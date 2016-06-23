/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 复选框
 * @author otakustay
 */

define(
    function (require) {
        var u = require('underscore');
        var $ = require('jquery');
        var lib = require('./lib');
        var InputControl = require('./InputControl');
        var eoo = require('eoo');
        var painters = require('./painters');

        /**
         * 复选框
         *
         * @extends InputControl
         * @constructor
         */
        var CheckBox = eoo.create(InputControl, {
            /**
             * 控件类型，始终为`"CheckBox"`
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'CheckBox',

            /**
             * 获取控件的分类，始终返回`"check"`
             *
             * @return {string}
             * @override
             */
            getCategory: function () {
                return 'check';
            },

            /**
             * 初始化配置
             *
             * 如果未给出{@link CheckBox#title}属性，
             * 则按以下规则以优先级从高到低从主元素上提取：
             *
             * 1. 如果主元素有`title`属性，使用该属性的值
             * 2. 如果提供了`value`属性，则以`value`属性作为值
             * 3. 使用空字符串
             *
             * 以下属性如果未给出，则使用主元素上的对应属性：
             *
             * - `name`
             * - `value`，如果主元素上也未给出，则默认值为`"on"`
             * - `checked`
             *
             * @param {Object} [options] 初始化配置项
             * @param {Mixed[] | Mixed} [options.datasource] 初始化数据源
             *
             * `CheckBox`控件在初始化时可以提供`datasource`属性，
             * 该属性用于控件判断一开始是否选中，且这个属性只在初始化时有效，不会保存下来
             *
             * `datasource`可以是以下类型：
             *
             * - 数组：此时只要`rawValue`在`datasource`中（使用`==`比较）则选上
             * - 其它：只要`rawValue`与此相等（使用`==`比较）则选上
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    /**
                     * @property {string} [value='on']
                     *
                     * Checkbox的Value值
                     */
                    value: this.main.value || 'on',
                    /**
                     * @property {boolean} [checked=false]
                     *
                     * 是否check对钩
                     */
                    checked: this.main.checked || false
                };

                u.extend(properties, options);

                properties.name
                    = properties.name || this.main.getAttribute('name');

                var datasource = properties.datasource;
                delete properties.datasource;

                // 这里涉及到`value`和`rawValue`的优先级问题，
                // 而这个处理在`InputControl.prototype.setProperties`里，
                // 因此要先用一下，然后再管`datasource`
                this.setProperties(properties);
                if (datasource != null) {
                    if (u.isArray(datasource)) {
                        this.checked = u.any(
                            datasource,
                            function (item) {
                                return item.value === this.value;
                            },
                            this
                        );
                    }
                    else if (this.rawValue === datasource) {
                        this.checked = true;
                    }
                }

                if (!this.title) {
                    this.title = this.main.title
                        || (this.getValue() === 'on' ? '' : this.getValue());
                }
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                // 如果用的是一个`<input>`，替换成`<div>`
                if ($(this.main).is('input')) {
                    var classList = this.main.className;
                    this.main.className = '';
                    this.boxId = this.main.id || this.helper.getId('box');
                    this.helper.replaceMain();
                    this.main.id = this.helper.getId();
                    if (classList) {
                        $(this.main).addClass(classList);
                    }
                }
                else {
                    this.boxId = this.helper.getId('box');
                }

                var html = '<input type="checkbox" name="${name}" id="${id}" />'
                    + '<label id="${textId}" for="${id}" class="${box}"></label>';

                this.main.innerHTML = lib.format(
                    html,
                    {
                        name: this.name,
                        id: this.boxId,
                        textId: this.helper.getId('text'),
                        box: this.helper.getPartClasses('box')
                    }
                );
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var box = lib.g(this.boxId);
                this.helper.addDOMEvent(
                    box,
                    'click',
                    function (e) {
                        /**
                         * @event click
                         *
                         * 点击时触发
                         */
                        this.fire('click');
                        if (!box.addEventListener) {
                            syncChecked.call(this, e);
                        }
                    }
                );

                if (box.addEventListener) {
                    this.helper.addDOMEvent(box, 'change', syncChecked);
                }
            },

            /**
             * 批量更新属性并重绘
             *
             * @param {Object} properties 需更新的属性
             * @override
             * @fires change
             */
            setProperties: function (properties) {
                var changes
                    = this.$super(arguments);
                if (changes.hasOwnProperty('checked')) {
                    /**
                     * @event change
                     *
                     * 当值发生变化时触发
                     */
                    this.fire('change');
                }
            },

            /**
             * 获得应当获取焦点的元素，主要用于验证信息的`<label>`元素的`for`属性设置
             *
             * @return {HTMLElement}
             * @protected
             * @override
             */
            getFocusTarget: function () {
                var box = lib.g(this.boxId);
                return box;
            },

            /**
             * 更新标签文本
             *
             * @param {string} title 新的标签文本内容，未经HTML转义
             * @protected
             */
            updateTitle: function (title) {
                // 如果外部直接调用，则要更新下当前实体上的属性
                this.title = title;
                title = u.escape(title);
                this.helper.getPart('text').innerHTML = title;
                $(this.boxId).attr('title', title);
            },

            /**
             * 更新checkbox状态
             *
             * @param {boolean} indeterminate 更新状态
             * @protected
             */
            updateIndeterminate: function (indeterminate) {
                this.helper.getPart('box').indeterminate = indeterminate;
            },

            /**
             * 重渲染
             *
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                InputControl.prototype.repaint,
                {
                    /**
                     * @property {boolean} checked
                     *
                     * 标识是否为选中状态
                     */
                    name: ['rawValue', 'checked', 'indeterminate'],
                    paint: function (box, rawValue, checked, indeterminate) {
                        if (indeterminate !== undefined) {
                            box.updateIndeterminate(indeterminate);
                            delete box.indeterminate;
                        }
                        var value = box.stringifyValue(rawValue);
                        box = lib.g(box.boxId);

                        box.value = value;
                        box.checked = checked;
                    }
                },
                {
                    name: ['disabled', 'readOnly'],
                    paint: function (box, disabled, readOnly) {
                        var boxElement = lib.g(box.boxId);
                        boxElement.disabled = disabled || readOnly;
                    }
                },
                {
                    /**
                     * @property {string} title
                     *
                     * 复选框的文本内容
                     */
                    name: 'title',
                    paint: function (box, title) {
                        box.updateTitle(title);
                    }
                }
            ),

            /**
             * 设置选中状态
             *
             * @param {boolean} checked 状态
             */
            setChecked: function (checked) {
                this.setProperties({checked: checked});
            },

            /**
             * 获取选中状态
             *
             * @return {boolean} 如已经选中则返回`true`
             */
            isChecked: function () {
                if (this.helper.isInStage('RENDERED')) {
                    var box = lib.g(this.boxId);
                    return box.checked;
                }

                return this.checked;
            }
        });

        /**
         * 同步选中状态
         *
         * @param {Event} e DOM事件对象
         * @ignore
         */
        function syncChecked(e) {
            var checked = lib.g(this.boxId).checked;
            this.setProperties({checked: checked});
            this.fire('changed');
        }

        require('./main').register(CheckBox);
        return CheckBox;
    }
);
