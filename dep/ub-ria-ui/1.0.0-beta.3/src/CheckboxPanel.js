/**
 * UB-RIA-UI 1.0
 *
 * @ignore
 * @file 折叠控件(通过checkbox是否选中进行切换)
 * @author maoquan
 */

define(
    function (require) {
        var InputControl = require('esui/InputControl');
        var esui = require('esui');
        var lib = require('esui/lib');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var u = require('underscore');
        var $ = require('jquery');

        require('esui/CheckBox');
        require('esui/Panel');

        /**
         * 折叠控件
         *
         * @class ui.CheckboxPanel
         * @extends.esui.InputControl
         */
        var CheckboxPanel = eoo.create(
            InputControl,
            {
                /**
                 * 控件类型，始终为`"CheckboxPanel"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'CheckboxPanel',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 构造函数传入的参数
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var defaults = {
                        expanded: false
                    };

                    // 从dom中抽取相关属性
                    if (!options.title || !options.value) {
                        extractDatasourceFromDOM(this.main, options);
                    }

                    var properties = u.extend(defaults, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @override
                 * @protected
                 */
                initStructure: function () {
                    if (this.customClasses) {
                        $(this.main).addClass(this.customClasses);
                    }
                    // 初始化Title部分的DOM结构
                    initTitle.call(this);
                    // 初始化content部分的DOM结构
                    initContentPanel.call(this);
                },

                /**
                 * 切换展开/收起状态
                 *
                 * @inner
                 */
                toggleContent: function () {
                    this.toggleStates();
                },

                toggleStates: function () {
                    this.setProperties({expanded: !this.expanded});
                },

                initEvents: function () {
                    this.$super(arguments);
                    var me = this;
                    var checkbox = me.getChild('title');
                    checkbox.on(
                        'change',
                        function () {
                            var checked = this.isChecked();
                            me.setProperties({expanded: checked});
                            me.fire('change');
                        }
                    );
                },

                // 在控件disable/enable时，不能无脑disable/enable所有子控件
                // 需在disable的时候根据当前状态记录子控件id，以便在enable时恢复
                disabledIds: [],

                /**
                 * 重绘
                 *
                 * @override
                 * @protected
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'title',
                        paint: function (panel, title) {
                            panel.getChild('title').setProperties({title: title});
                        }
                    },
                    {
                        name: 'content',
                        paint: function (panel, content) {
                            panel.getChild('content').set('content', content);
                        }
                    },
                    {
                        name: 'expanded',
                        paint: function (panel, expanded) {
                            panel.getChild('title').setProperties({checked: expanded});

                            var method = expanded ?  'addState' : 'removeState';
                            panel[method]('expanded');
                            panel[method]('active');

                            method = expanded ? 'show' : 'hide';
                            panel.getChild('content')[method]();
                            // 联动切换content里的值
                            setDisabled.call(panel, !expanded);

                        }
                    },
                    {
                        name: 'disabled',
                        paint: function (me, disabled) {
                            // 先切换title的状态
                            me.getChild('title').setDisabled(disabled);

                            // 如果要设置disabled为false，先要看看控件是否处于展开状态
                            if (disabled === false) {
                                disabled = !me.expanded;
                            }
                            setDisabled.call(me, disabled);
                        }
                    }
                ),

                isExpanded: function () {
                    return this.hasState('expanded');
                }
            }
        );

        /**
         * 设置content面板里所有控件的disabled状态
         *
         * @param {boolean} disabled 是否disable
         */
        function setDisabled(disabled) {
            var contentMain = this.getChild('content').main;
            var controls = this.getChild('content').children;
            if (disabled === false) {
                u.each(
                    controls,
                    function (child) {
                        if (u.contains(this.disabledIds, child.id)) {
                            this.disabledIds = u.without(this.disabledIds, child.id);
                            child.setDisabled(false);
                        }
                    },
                    this
                );
            }
            else {
                u.each(
                    controls,
                    function (child) {
                        if (!child.isDisabled()) {
                            this.disabledIds.push(child.id);
                            child.setDisabled(true);
                        }
                    },
                    this
                );
            }
        }

        /**
         * 初始化Title部分的DOM结构
         *
         * @inner
         * @param {Object} titleElem Title的DOM对象
         */
        function initTitle() {
            var $children = $(this.main).children();
            var options = {
                main: $children[0],
                childName: 'title',
                title: this.title,
                rawValue: this.rawValue,
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };
            var checkbox = esui.create('CheckBox', options);
            this.helper.addPartClasses('title', checkbox.main);
            this.addChild(checkbox, 'title');
            checkbox.render();
        }

        /**
         * 按Panel模式初始化Content部分的DOM结构
         *
         * @inner
         */
        function initContentPanel() {
            var $children = $(this.main).children();
            var contentElem = $children[1];

            var options = {
                main: contentElem,
                childName: 'content',
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };

            var contentPanel = esui.create('Panel', options);
            this.helper.addPartClasses('content', contentPanel.main);
            this.addChild(contentPanel, 'content');
            contentPanel.render();
        }

        /**
         * 从已有的DOM中分析出数据源
         *
         * @param {HTMLElement} element 供分析的DOM元素
         * @param {Object} options 输入的配置项
         * @param {string|undefined} options.name 输入控件的名称
         * @ignore
         */
        function extractDatasourceFromDOM(element, options) {
            // 提取符合以下条件的子`<input>`控件：
            //
            // - `type`属性为`checkbox`
            // - 二选一：
            //     - 当前控件和`<input>`控件都没有`name`属性
            //     - `<input>`和当前控件的`name`属性相同
            //
            // 根据以下优先级获得`title`属性：
            //
            // 1. 有一个`for`属性等于`<input>`的`id`属性的`<label>`元素，则取其文字
            // 2. 取`<input>`的`title`属性
            // 3. 取`<input>`的`value`
            var boxes = element.getElementsByTagName('input');
            var labels = element.getElementsByTagName('label');

            // 先建个索引方便取值
            var labelIndex = {};
            for (var i = labels.length - 1; i >= 0; i--) {
                var label = labels[i];
                var forAttribute = lib.getAttribute(label, 'for');
                if (forAttribute) {
                    labelIndex[forAttribute] = label;
                }
            }

            for (var j = 0, max = boxes.length; j < max; j++) {
                var box = boxes[j];
                // 提取`value`和`title`
                options.rawValue = box.value;
                var label2 = box.id && labelIndex[box.id];
                options.title = label2 ? $(label2).text() : '';
                if (!options.title) {
                    options.title = box.title || (box.value === 'on' ? box.value : '');
                }
                options.customClasses = box.className || '';

                break;
            }
        }

        esui.register(CheckboxPanel);
        return CheckboxPanel;
    }
);
