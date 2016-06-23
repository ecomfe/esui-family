/**
 * 控件添加器，基于模板或者基准控件来进行添加的组建
 * @file ControlRepeater.js
 * @author weifeng(weifeng@baidu.com)
 */

define(function (require) {

    var u = require('underscore');
    var esui = require('esui');
    var lib = require('esui/lib');
    var InputControl = require('esui/InputControl');
    var eoo = require('eoo');
    var $ = require('jquery');
    var painters = require('esui/painters');

    /**
     * ControlRepeater,可以添加或者删除自定义控件
     *
     * @extends {InputControl}
     * @param {Object} options 初始化参数
     * @constructor
     */
    var ControlRepeater = eoo.create(
        InputControl,
        {
            /**
             * 控件类型,始终为`"ControlRepeater"`
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'ControlRepeater',

            /**
             * 初始化参数
             *
             * @param {Object} [options] 构造函数传入的参数
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    /**
                     * @property {number} [maxCount=999]
                     *
                     * 可添加的最大的控件组的数目,由于实际场景中不可能添加到999个,所以默认值使用999
                     * 表示没有数量限制
                     */
                    maxCount: 999,
                    /**
                     * @property {string} [repeaterText='添加']
                     *
                     * 添加按钮显示的文本
                     */
                    repeaterText: '添加',
                    /**
                     * @property {Array} [rawValue=[]]
                     *
                     * 控件的数据源,会根据数据源的数据结构来渲染带有值的控件组
                     */
                    rawValue: [],
                    /**
                     * @property {boolean} [disabled=false]
                     *
                     * 是否禁用控件
                     */
                    disabled: false
                };

                u.extend(properties, options);

                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                var helper = this.helper;

                // 创建时候的number，只有初始化或者重新渲染的时候会重置这个值
                this.repeaterIndex = 0;

                // 生成容器和子元素模板
                // 备注：模板里面不要写id和name属性，否则会出错
                this.tpl = $(this.main).find('script').html();

                var tpl = [
                    '<div id="${bodyId}" class="${bodyClass}">',
                    '</div>',
                    '<div>',
                        '<a id="${reapeatLinker}" class="${adder}">${repeaterText}</a>',
                    '</div>'
                ].join('');

                this.main.innerHTML = lib.format(
                    tpl,
                    {
                        bodyId: helper.getId('body'),
                        bodyClass: helper.getPartClassName('body'),
                        reapeatLinker: helper.getId('reapeatLinker'),
                        adder: helper.getPartClassName('adder'),
                        repeaterText: this.get('repeaterText')
                    }
                );
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
                    name: ['rawValue'],
                    paint: function (controlRepeater, rawValue) {
                        if (!rawValue || !rawValue.length) {
                            rawValue = [''];
                        }

                        // 当需要添加的时候，清空以前的重新添加
                        // 实际上是重新渲染了，所以需要把一些之前的值清除掉
                        $(controlRepeater.helper.getPart('body')).html('');
                        controlRepeater.repeaterIndex = 0;
                        controlRepeater.children = [];
                        u.each(rawValue, function (value) {
                            addControl.call(controlRepeater, value);
                        });
                    }
                },
                {
                    name: ['disabled', 'readOnly'],
                    paint: function (controlRepeater, disabled, readOnly) {
                        // 需要搞定禁用和启动的切换
                        // $(controlRepeater.main).toggleClass('controlrepeater-disabled', !!disabled);
                        u.each(getInputControls.call(controlRepeater), function (controls) {
                            u.each(controls, function (control) {
                                control.setProperties({
                                    disabled: !!disabled,
                                    readOnly: !!readOnly
                                });
                            });
                        });
                    }
                }
            ),

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var me = this;

                // 为添加按钮添加点击事件,没点击一次,增加一行
                this.helper.addDOMEvent(
                    this.helper.getPart('reapeatLinker'),
                    'click',
                    function (event) {
                        addControl.call(me);
                    }
                );

                // 为删除按钮添加点击事件,根据删除按钮的data-role=remove属性来判断删除哪一个
                // 删除
                this.helper.addDOMEvent(
                    this.helper.getPart('body'),
                    'click',
                    '[data-role=remove]',
                    function (event) {
                        var index = +$(event.target).closest('.'
                            + this.helper.getPartClassName('panel-container')).data('index');

                        me.deleteControl.call(me, index);
                    }
                );
            },

            /**
             * 获取输入控件的值的字符串形式
             *
             * @return {string}
            */
            getValue: function () {
                /**
                 * @property {string} value
                 *
                 * 输入控件的字符串形式的值
                 */
                return this.stringifyValue(this.getRawValue());
            },

            /**
             * 获取输入控件的原始值，原始值的格式由控件自身决定
             *
             * @return {Mixed}
             */
            getRawValue: function () {
                var rawValue = [];
                u.each(getInputControls.call(this), function (controls) {
                    var obj = {};
                    u.each(controls, function (control) {
                        obj[control.childName] = control.getRawValue();
                    });
                    rawValue.push(obj);
                });
                return rawValue;
            },

            /**
             * 暴露一个删除controls的接口 默认从0开始
             * 如果某些场合下需要手动删除某个位置下的control可以调用此方法
             *
             * @param {number} index 要删除的controls的索引
             *
             */
            deleteControl: function (index) {
                removeControl.call(this, index);
            },

            /**
             * 验证控件，当值不合法时显示错误信息
             *
             * @return {boolean}
             * @fires beforevalidate
             * @fires aftervalidate
             */
            validate: function () {
                var result = true;
                u.each(getInputControls.call(this), function (controls) {
                    u.each(controls, function (control) {
                        result = control.validate() && result;
                    });
                });
                this.fire('aftervalidate');
                return result;
            },

            /**
             * 获取数据输出的控件
             *
             * @return {Array} 二维控件数组
             */
            getChildInputControl: function () {
                return getInputControls.call(this);
            }
        }
    );

    /**
     * 添加一个添加一组控件
     * 如果带值的话需要给控件进行赋值
     *
     * @param {valueObj} valueObj 要删除的panel的索引
     */
    function addControl(valueObj) {
        // 如果当前已加入的组建数目的数目大于等于最大数目,
        // 抛出一个error，然后返回
        if (this.maxCount <= this.children.length) {
            this.fire('maxCountError');
            return;
        }

        // 如果模板跟panel一起渲染的话会把panel里面的子控件放到panel的父控件上面
        var panel = esui.create('Panel', u.extend({
            content: this.tpl
        }));

        panel.appendTo($(this.helper.getPart('body'))[0]);
        this.addChild(panel, 'panelName' + ++this.repeaterIndex);
        $(panel.main).addClass(
            this.helper.getPartClassName('panel-container')
        ).attr('data-index', this.repeaterIndex);

        getLeafNode(panel, [], valueObj);
        this.fire('controladded');
    }

    /**
     * 删除一组control,并将容器节点删除
     *
     * @param {number} index 要删除的panel的索引
     *
     */
    function removeControl(index) {
        // 至少保留一个
        if (this.children.length <= 1) {
            return;
        }
        var panelContainer = this.getChild('panelName' + index);

        if (panelContainer) {
            this.removeChild(panelContainer);
            // 要移除panel元素,消除子控件以及容器控件
            panelContainer.disposeChildren();
            panelContainer.dispose();
            $(panelContainer.main).remove();

            this.fire('controldeleted');
        }
    }


    /**
     * 获取所有的input类型的含有childName的子孙控件
     *
     * @return {Array} controls 二维数组，第二维里面的是该容器里满足条件的控件
     */
    function getInputControls() {
        var controls = [];
        u.each(this.children, function (control, index) {
            controls[index] = getLeafNode.call(this, control, []);
        }, this);

        return controls;
    }

    /**
     * 获取该组件下的所有的input类型的含有childName的子孙控件，
     * 并且将这些控件放置在同一级当中
     *
     * @param {Object} control 需要遍历的控件
     * @param {Array} controls 需要放置的数组
     * @param {Object} valueObj 需要赋予控件的值
     *
     * @return {Array} 获取到的子控件数组
     */
    function getLeafNode(control, controls, valueObj) {
        u.each(control.children, function (childControl, index) {
            if (isInputControl(childControl)
                && childControl.hasOwnProperty('childName')) {
                if (valueObj && valueObj[childControl.childName]) {
                    childControl.setRawValue(valueObj[childControl.childName]);
                }
                controls.push(childControl);
            }
            else if (isContainer(childControl) && childControl.children) {
                getLeafNode.call(this, childControl, controls, valueObj);
            }
        }, this);
        return controls;
    }

    /**
     * 判断是否为输入控件
     *
     * @param {Control} control 控件
     * @return {boolean}
     * @ignore
     */
    function isInputControl(control) {
        var category = control.getCategory();
        return category === 'input' || category === 'check';
    }

    /**
     * 判断是否为容器控件
     *
     * @param {Control} control 控件
     * @return {boolean}
     * @ignore
     */
    function isContainer(control) {
        var category = control.getCategory();
        return category === 'container';
    }

    esui.register(ControlRepeater);
    return ControlRepeater;
});
