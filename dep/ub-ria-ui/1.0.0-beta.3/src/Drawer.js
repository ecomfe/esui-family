/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Drawer.js 可以配置三个方向飞入飞出的抽屉控件。
 * @author yankun01(yankun01@baidu.com)
 */

define(
    function (require) {
        var $ = require('jquery');
        var Control = require('esui/Control');
        var esui = require('esui');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var u = require('underscore');

        /**
         * Drawer类定义。
         *
         * @class
         * @extends Control
         *
         * @constructor
         *
         * 创建新的Drawer实例
         *
         * @param {Object} [options] 组件参数
         */
        var Drawer = eoo.create(
            Control,
            {
                /**
                 * Drawer类型用于注册到ESUI库
                 *
                 * @override
                 */
                type: 'Drawer',

                /**
                 * 初始化传入参数。
                 *
                 * @param {Object} options 初始化参数
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        /**
                         * @property {Number|string}
                         *
                         * Drawer的宽度。可以为百分比或者像素。
                         */
                        width: null
                    };
                    u.extend(properties, options);

                    this.setProperties(properties);
                },

                /**
                 * 初始化组件结构
                 *
                 * @override
                 */
                initStructure: function () {
                    var me = this;
                    var main = me.main;

                    me.$super(arguments);

                    if (main.parentNode
                        && main.parentNode.nodeName.toLowerCase() !== 'body') {
                        document.body.appendChild(main);
                    }
                    var roles = parseMainElement(main);
                    var tempEle;
                    for (var key in roles) {
                        if (roles.hasOwnProperty(key)) {
                            tempEle = roles[key];
                            tempEle.id = me.helper.getId(key);
                            me.helper.addPartClasses(key, tempEle);
                        }
                    }

                    this.helper.initChildren();
                },

                /**
                 * 组件的重绘属性处理函数。
                 *
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: ['width'],
                        paint: function (drawer, width) {
                            var helper = drawer.helper;
                            var w = 'width';
                            if (width) {
                                $(helper.getPart('header')).css(w, width);
                                $(helper.getPart('content')).css(w, width);
                                $(helper.getPart('footer')).css(w, width);
                            }
                        }
                    },
                    {
                        name: ['title'],
                        paint: function (drawer, title) {
                            var titleId = drawer.helper.getId('title');

                            $('#' + titleId).html(title);
                        }
                    }
                ),

                /**
                 * 事件绑定
                 *
                 * @override
                 */
                initEvents: function () {
                    this.$super(arguments);

                    var helper = this.helper;
                    // 监听main中具有data-role="close"的节点 点击就关闭自己
                    helper.addDOMEvent(this.main, 'click', '[data-role="close"]', close);
                },

                /**
                 * 显示Drawer
                 */
                show: function () {
                    document.body.style.overflowY = 'hidden';
                    $(this.main).addClass(this.helper.getPrimaryClassName('visible'));
                    this.fire('show');
                },

                /**
                 * 隐藏Drawer
                 */
                hide: function () {
                    // 如果直接显示页面滚动，可能会出现content和页面双滚动
                    // 因此延迟一会儿
                    setTimeout(function () {
                        document.body.style.overflowY = '';
                    }, 200);
                    $(this.main).removeClass(this.helper.getPrimaryClassName('visible'));
                    this.fire('hide');
                },

                /**
                 * 关闭drawer, 和hide区别是close会fire`hide`事件
                 */
                close: function () {
                    close.call(this);
                },

                /**
                 * 销毁组件
                 *
                 * @override
                 */
                dispose: function () {
                    $(this.main).remove();
                    this.$super(arguments);
                }
            }
        );

        /**
         * 关闭按钮的处理函数
         *
         * @param {Object} e 事件参数
         * @return {boolean} 是否关闭成功
         * @private
         */
        function close(e) {
            e && e.preventDefault();

            var beforecloseEvent = this.fire('beforeclose');
            // 阻止事件，则不继续运行
            if (beforecloseEvent.isDefaultPrevented()) {
                return false;
            }

            this.hide();
            this.fire('close');
            return true;
        }

        /**
         * 递归一个DOM元素，取到组件相关的DOM元素
         *
         * @param {DOMElement} element 要进行parse的元素
         * @return {DOMElement} 需要拷贝到剪切板的内容
         * @private
         */
        function parseMainElement(element) {
            var roles = {};
            $(element).find('[data-role]').each(function () {
                roles[$(this).data('role')] = this;
            });

            return roles;
        }

        esui.register(Drawer);
        return Drawer;
    }
);
