/**
 * UB-RIA-UI 1.0
 *
 * @ignore
 * @file 折叠控件
 * @author wangyaqiong, liyidong(srhb18@gmail.com)
 */

define(
    function (require) {
        var Control = require('esui/Control');
        var esui = require('esui');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var u = require('underscore');
        var Layer = require('esui/Layer');
        var $ = require('jquery');

        require('esui/Panel');

        /**
         * 折叠控件
         *
         * @class ui.TogglePanel
         * @extends.esui.Control
         */
        var TogglePanel = eoo.create(
            Control,
            {
                /**
                 * 控件类型，始终为`"TogglePanel"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'TogglePanel',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 构造函数传入的参数
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var defaults = {
                        expanded: false,
                        position: 'layer'
                    };

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
                    var $children = $(this.main).children();
                    var titleElem = $children[0];
                    var contentElem = $children[1];

                    // 初始化Title部分的DOM结构
                    initTitle.call(this, titleElem);

                    // 初始化content部分的DOM结构
                    var position = this.position;
                    initContentPanel.call(this, contentElem);
                    if (position === 'layer') {
                        initContentLayer.call(this, contentElem, titleElem);
                    }
                },

                /**
                 * 切换展开/收起状态
                 *
                 * @inner
                 */
                toggleContent: function () {
                    this.toggleStates();
                    this.fire('change');
                },

                toggleStates: function () {
                    this.setProperties({
                        expanded: !this.expanded
                    });
                },

                initEvents: function () {
                    var me = this;
                    me.$super(arguments);
                    var titlePanel = me.getChild('title');
                    me.helper.addDOMEvent(titlePanel.main, 'click', u.bind(onToggle, me));
                },

                /**
                 * 重绘
                 *
                 * @override
                 * @protected
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: 'title',
                        paint: function (panel, title) {
                            panel.getChild('title').set('content', title);
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
                            var layerMode = panel.position === 'layer';
                            var method = expanded ?
                                'addState' : 'removeState';

                            panel[method]('expanded');
                            panel[method]('active');

                            method = expanded ?
                                'show' : 'hide';
                            if (layerMode) {
                                panel.layer[method]();
                            }
                            else {
                                panel.getChild('content')[method]();
                            }
                        }
                    },
                    /**
                     * @property {number} width
                     *
                     * 宽度
                     */
                    painters.style('height'),
                    /**
                     * @property {number} width
                     *
                     * 宽度
                     */
                    painters.style('height')
                ),

                isExpanded: function () {
                    return this.hasState('expanded');
                }
            }
        );

        /**
         * 初始化Title部分的DOM结构
         *
         * @inner
         * @param {Object} titleElem Title的DOM对象
         */
        function initTitle(titleElem) {
            var options = {
                main: titleElem,
                childName: 'title',
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };
            var titlePanel = esui.create('Panel', options);
            this.helper.addPartClasses('title', titlePanel.main);
            this.addChild(titlePanel, 'title');
            titlePanel.render();
            this.set('title', titleElem && titleElem.innerHTML);
        }

        /**
         * 按Panel模式初始化Content部分的DOM结构
         *
         * @inner
         * @param {Object} contentElem content的DOM对象
         */
        function initContentPanel(contentElem) {
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
         * 按Overlay模式初始化Content部分的DOM结构
         *
         * @inner
         * @param {Object} contentElem content的DOM对象
         * @param {Object} titleElem title的DOM对象
         */
        function initContentLayer(contentElem, titleElem) {
            var me = this;
            contentElem.id = me.helper.getId('layer');
            var layer = new Layer(me);
            me.layer = layer;
            layer.prepareLayer(contentElem);
            layer.on('hide', function () {
                // 重复设置同样值不会触发repaint因此不用担心死循环
                me.setProperties(
                    {
                        expanded: false
                    }
                );
            });
            layer.autoCloseExcludeElements = [titleElem];
        }

        /**
         * 点击Title区域的句柄
         *
         * @inner
         */
        function onToggle() {
            var e = this.fire('beforetoggle');
            if (e.isDefaultPrevented()) {
                return;
            }
            this.toggleContent();
        }

        esui.register(TogglePanel);
        return TogglePanel;
    }
);
