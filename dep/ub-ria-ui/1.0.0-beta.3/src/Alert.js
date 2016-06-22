/**
 * UB-RIA UI Library
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 警告框（Alert）
 * @author zhangyujie(zhangyujie@baidu.com)
 */

define(
    function (require) {
        var eoo = require('eoo');
        var u = require('underscore');
        var esui = require('esui');
        var lib = require('esui/lib');
        var Control = require('esui/Control');
        var $ = require('jquery');
        var painters = require('esui/painters');

        // Alert类型
        var allType = ['success', 'info', 'warning', 'error'];

        /**
         * Alert控件
         *
         * @param {Object} options 初始化参数
         * @extends Control
         * @constructor
         */
        var Alert = eoo.create(
            Control,
            {

                /**
                 * 控件类型，始终为`"Alert"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Alert',

                /** 初始化参数
                 *
                 * @param {Object=} options 构造函数传入的参数
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    /**
                     * @cfg defaultProperties
                     *
                     * 默认属性值
                     *
                     * @cfg {string} [defaultProperties.msgType='error'] 消息类型
                     *      `success`：成功：绿
                     *      `info` ：通知：蓝
                     *      `warning`：警告：黄
                     *      `error`  ：错误：红
                     * @cfg {string | Array} [defaultProperties.message] 数据源数组，可兼容单条string
                     * @cfg {boolean} [defaultProperties.autoClose=false] 自动关闭延迟
                     * @cfg {number} [defaultProperties.autoCloseDuration=1000] 自动关闭延迟
                     * @cfg {boolean} [defaultProperties.closeBtn=false] 是否带有关闭按钮
                     * @cfg {boolean} [defaultProperties.autoSlide=true] 是否滚动
                     * @cfg {number} [defaultProperties.autoSlideInterval=4000] 多条消息自动滚动时间
                     * @cfg {boolean} [defaultProperties.icon=true] 是否使用系统默认图标
                     * @static
                     */
                    var properties = {
                        msgType: 'error',
                        autoClose: false,
                        autoCloseDuration: 1000,
                        autoSlide: true,
                        autoSlideInterval: 4000,
                        closeBtn: true,
                        pageIndex: 1,
                        icon: ''
                    };
                    // 如果没有从html构造，则从js中构造时必须传入父容器
                    if (!this.main.parentNode && u.isEmpty(options.container)) {
                        throw new Error('Parent is needed if constructed form scripts');
                    }

                    // 兼容传入单条string
                    if (typeof options.message === 'string') {
                        options.message = [options.message];
                    }

                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 带有注入innerHTML的部件HTML模板
                 *
                 * @param {string} part 部件名称
                 * @param {string} nodeName HTML节点标签
                 * @param {string} innerHTML 注入的innerHTML
                 * @protected
                 * @return {string} 部件HTML内容
                 */
                getInjectedPartHTML: function (part, nodeName, innerHTML) {
                    return this.helper.getPartBeginTag(part, nodeName)
                        + innerHTML
                        + this.helper.getPartEndTag(part, nodeName);
                },

                /**
                 * 骨架构造
                 *
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    var innerHTML = '';
                    var controlHelper = this.helper;
                    var parts = ['icon', 'text', 'close', 'pager'];

                    u.each(parts, function (item, index) {
                        innerHTML += controlHelper.getPartHTML(item, 'div');
                    }, this);
                    this.main.innerHTML = this.getInjectedPartHTML('container', 'div', innerHTML);
                },

                /**
                 * 为Page绑定事件
                 *
                 * @protected
                 */
                bindPagerEvent: function () {
                    // 翻页至上一页
                    this.helper.addDOMEvent('prev', 'click', function () {
                        if (this.pageIndex > 1) {
                            this.setProperties({pageIndex: this.pageIndex - 1});
                        }
                    });

                    // 翻页至下一页
                    this.helper.addDOMEvent('next', 'click', function () {
                        if (this.pageIndex < this.message.length) {
                            this.setProperties({pageIndex: this.pageIndex + 1});
                        }
                    });
                },

                /**
                 * 为控件注入Icon
                 *
                 * @param {string} html 注入的HTML
                 * @param {string} icon 图标的class selector
                 * @protected
                 */
                injectIcon: function (html, icon) {
                    var controlerHelper = this.helper;
                    var iconContainer = controlerHelper.getPart('icon');
                    var mainElement = this.main;
                    iconContainer.innerHTML = html;
                    var iconClass = controlerHelper.getPartClassName('has-icon');
                    if (html) {
                        $(mainElement).addClass(iconClass);
                        $(iconContainer.firstChild).addClass(icon);
                    }
                    else {
                        $(mainElement).removeClass(iconClass);
                    }
                },

                /**
                 * 重绘
                 *
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        /**
                         * @property {boolean} icon
                         *
                         * 是否带提示图标
                         */
                        name: 'icon',
                        paint: function (self, icon) {
                            if (!icon) {
                                self.injectIcon('');
                                return;
                            }
                            self.injectIcon(self.helper.getPartHTML('icon-content', 'span'), icon);
                        }
                    },
                    {
                        /**
                         * @property {string} message
                         *
                         * 提示的内容，支持HTML
                         */
                        name: 'message',
                        paint: function (self, message) {
                            var html = '';
                            u.each(message, function (item) {
                                html += self.getInjectedPartHTML('item', 'span', item);
                            });
                            self.helper.getPart('text').innerHTML = html;

                            var pagerClass = self.helper.getPartClassName('has-pager');
                            var $main = $(self.main);
                            if (message.length > 1) {
                                $main.addClass(pagerClass);
                                buildPager(self);
                            }
                            else {
                                $main.removeClass(pagerClass);
                            }
                        }
                    },
                    {
                        /**
                         * @property {string} msgType
                         *
                         * 提示的类型
                         */
                        name: 'msgType',
                        paint: function (self, msgType) {
                            // 清理掉老的type
                            u.each(allType, function (type) {
                                self.helper.removePartClasses(type);
                            });
                            self.helper.addPartClasses(self.msgType);
                        }
                    },
                    {
                        /**
                         * @property {number} pageIndex
                         *
                         * 转到的页码
                         */
                        name: 'pageIndex',
                        paint: function (self, pageIndex) {
                            var controlHelper = self.helper;
                            var $messages = $(controlHelper.getPart('text')).children();
                            var activeClassName = controlHelper.getPartClassName('item-active');
                            var $newMessage = $messages.eq(pageIndex - 1);
                            if (self.message.length === 1) {
                                $newMessage.addClass(activeClassName);
                                return;
                            }

                            var $oldMessage = $messages.filter('.' + activeClassName);

                            // 如果是初始的第一条，则不用切换任何渐进效果相关的class
                            if ($oldMessage.size() > 0) {
                                $oldMessage.removeClass(activeClassName);
                            }

                            $newMessage.addClass(activeClassName);
                            controlHelper.getPart('page').innerHTML = pageIndex;

                            // 分页器边界逻辑
                            if (pageIndex === 1) {
                                controlHelper.addPartClasses('prev-disabled', 'prev');
                            }
                            else {
                                controlHelper.removePartClasses('prev-disabled', 'prev');
                            }
                            if (pageIndex === self.message.length) {
                                controlHelper.addPartClasses('next-disabled', 'next');
                            }
                            else {
                                controlHelper.removePartClasses('next-disabled', 'next');
                            }
                        }
                    },
                    {
                        /**
                         * @property {number} closeBtn
                         *
                         * 是否带有关闭按钮
                         */
                        name: 'closeBtn',
                        paint: function (self, closeBtn) {
                            var controlHelper = self.helper;
                            // 默认为true的属性兼容从html构造传入false覆盖的情况
                            if (closeBtn === false) {
                                controlHelper.getPart('button') && controlHelper.removeDOMEvent('button');
                                controlHelper.getPart('close').innerHTML = '';
                                return;
                            }
                            controlHelper.getPart('close').innerHTML = ''
                                + self.getInjectedPartHTML(
                                    'button',
                                    'div',
                                    controlHelper.getPartHTML('icon-content', 'span')
                                );
                            $(controlHelper.getPart('button').firstChild).addClass(controlHelper.getIconClass());
                            controlHelper.addDOMEvent('button', 'click', function (e) {
                                this.hide();
                            });
                        }
                    },
                    {
                        /**
                         * @property {number} autoSlide
                         *
                         * 自动轮播时间间隔
                         */
                        name: 'autoSlide',
                        paint: function (self, autoSlide) {
                            clearInterval(self.autoSlideTimer);
                            if (self.message.length === 1 || !autoSlide) {
                                return;
                            }
                            self.autoSlideTimer = setInterval(u.bind(slide, self), self.autoSlideInterval);
                        }
                    },
                    {
                        /**
                         * @property {number} autoClose
                         *
                         * 控件自动关闭时间间隔
                         */
                        name: 'autoClose',
                        paint: function (self, autoClose) {
                            // 自动关闭定时器
                            clearTimeout(self.autoCloseTimer);
                            if (!autoClose) {
                                return;
                            }
                            self.autoCloseTimer = setTimeout(u.bind(self.hide, self), self.autoCloseDuration);
                        }
                    }
                ),

                /**
                 * 显示提示信息
                 *
                 * @protected
                 * @override
                 */
                show: function () {
                    var me = this;
                    var controlHelper = me.helper;
                    if (controlHelper.isInStage('DISPOSED')) {
                        return;
                    }

                    var ref = lib.g(me.container).firstChild;
                    // 插入节点，引起渲染
                    if (ref) {
                        me.insertBefore(ref);
                    }
                    else {
                        me.appendTo(lib.g(me.container));
                    }

                    // toggle效果实现
                    controlHelper.addPartClasses('toggle', 'container');

                    me.$super(arguments);
                    me.fire('show');

                    // 自动轮换功能暂停重启逻辑
                    controlHelper.addDOMEvent(me.main, 'mouseenter', function () {
                        me.setProperties({autoSlide: false});
                    });
                    controlHelper.addDOMEvent(me.main, 'mouseleave', function () {
                        me.setProperties({autoSlide: this.autoSlide});
                    });
                },

                /**
                 * 隐藏提示信息
                 *
                 * @protected
                 * @override
                 */
                hide: function () {
                    this.$super(arguments);
                    this.fire('hide');
                    this.dispose();
                },

                /**
                 * 销毁控件，同时移出DOM树
                 *
                 * @protected
                 * @override
                 */
                dispose: function () {
                    clearTimeout(this.autoCloseTimer);
                    clearInterval(this.autoSlideTimer);
                    if (this.helper.isInStage('DISPOSED')) {
                        return;
                    }
                    $(this.main).remove();
                    this.$super(arguments);
                }
            }
        );

        // 快捷方式注册
        u.each(allType, function (type) {
            Alert[type] = function (options) {
                options.msgType = options.msgType || type;
                var alert = new Alert(options);
                alert.show();
                return alert;
            };
        });

        /**
         * 分页器构造
         *
         * @param {ESUI.Alert} self 控件实例
         */
        function buildPager(self) {

            var controlHelper = self.helper;
            // 上一条按钮
            var prev = self.getInjectedPartHTML('prev', 'div', controlHelper.getPartHTML('icon-content', 'span'));

            // 下一条按钮
            var next = self.getInjectedPartHTML('next', 'div', controlHelper.getPartHTML('icon-content', 'span'));

            // 页码
            var index = self.getInjectedPartHTML(
                'index',
                'div',
                controlHelper.getPartHTML('page', 'strong') + '/' + self.message.length
            );

            // 渲染
            controlHelper.getPart('pager').innerHTML = prev + index + next;
            controlHelper.getPart('page').innerHTML = self.pageIndex;
            var iconClass = controlHelper.getIconClass();
            $(controlHelper.getPart('prev')).addClass(iconClass);
            $(controlHelper.getPart('next')).addClass(iconClass);
            // 绑事件
            self.bindPagerEvent();
        }

        /**
         * 多条信息时，轮换到下一页，通过设置pageIndex引起重绘来实现
         *
         */
        function slide() {
            var pageIndex = this.pageIndex;
            if (pageIndex === this.message.length) {
                pageIndex = 1;
            }
            else {
                pageIndex++;
            }
            this.setProperties({pageIndex: pageIndex});
        }

        esui.register(Alert);
        return Alert;
    }
);
