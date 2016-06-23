/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 简易信息提示控件
 * @author zhanglili(otakustay@gmail.com) , chenhaoyin(curarchy@163.com)
 */
define(
    function (require) {
        var eoo = require('eoo');
        var esui = require('./main');
        var Control = require('./Control');
        var u = require('underscore');
        var painters = require('./painters');
        var $ = require('jquery');

        /**
         * Toast控件
         *
         * @param {Object=} options 初始化参数
         * @extends Control
         * @constructor
         */
        var Toast = eoo.create(
            Control,
            {
                /**
                 * 控件类型，始终为`"Toast"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Toast',

                /**
                 * 初始化参数
                 *
                 * @param {Object=} options 构造函数传入的参数
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        /**
                         * @type {numberl} duration 显示时间
                         */
                        duration: 3000,
                        /**
                         * @type {numberl} messageType 消息类型
                         *  `normal`：默认信息：灰色背景
                         *  `info`：通知信息：蓝色背景
                         *  `alert`：警告信息：黄色背景
                         *  `error`：错误信息：红色背景
                         *  `success`：成功信息：绿色背景
                         */
                        messageType: 'normal',
                        /**
                         * @type {numberl} disponseOnHide 隐藏之后是否立即销毁
                         */
                        disposeOnHide: true,
                        /**
                         * @type {numberl} autoShow 初始化后是否自动展示，默认为否
                         */
                        autoShow: false
                    };
                    u.extend(properties, options);
                    if (properties.content == null) {
                        properties.content = this.main.innerHTML;
                    }
                    this.setProperties(properties);
                },

                /**
                 * 初始化结构
                 *
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    this.main.innerHTML = this.helper.getPartHTML('content', 'p');
                    // 增加一个默认的状态hidden
                    this.addState('hidden');
                },

                /**
                 * 重渲染
                 *
                 * @override
                 * @protected
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        /**
                         * @property {string} content
                         *
                         * 提示的内容，支持HTML
                         */
                        name: 'content',
                        paint: function (toast, content) {
                            var container = toast.main.firstChild;
                            container.innerHTML = content;
                            // 检查autoShow，如果希望初始化的那次repaint后自动展示，就show出来
                            if (toast.autoShow && toast.helper.isInStage('INITED')) {
                                toast.show();
                            }
                        }
                    },
                    {
                        /**
                         * @property {string} messageType
                         *
                         * 提示的类型
                         */
                        name: 'messageType',
                        paint: function (toast, messageType) {
                            toast.helper.addPartClasses(toast.messageType);
                        }
                    }
                ),

                /**
                 * 显示提示信息
                 *
                 * @override
                 */
                show: function () {
                    if (this.helper.isInStage('DISPOSED')) {
                        return;
                    }

                    // 如果没放到DOM中，这里放进去
                    if (!this.main.parentElement && !this.main.parentNode) {
                        this.appendTo(getContainer.call(this));
                    }

                    if (!this.isHidden()) {
                        return;
                    }

                    this.$super(arguments);
                    this.fire('show');
                    clearTimeout(this.timer);
                    if (!isNaN(this.duration) && this.duration !== Infinity) {
                        this.timer = setTimeout(u.bind(this.hide, this), this.duration);
                    }
                },

                /**
                 * 隐藏提示信息
                 *
                 * @override
                 */
                hide: function () {
                    if (this.isHidden()) {
                        return;
                    }
                    this.$super(arguments);
                    clearTimeout(this.timer);
                    this.fire('hide');
                    if (this.disposeOnHide) {
                        this.dispose();
                    }
                },

                /**
                 * 销毁控件，同时移出DOM树
                 *
                 * @protected
                 * @override
                 */
                dispose: function () {
                    clearTimeout(this.timer);
                    if (this.helper.isInStage('DISPOSED')) {
                        return;
                    }
                    this.$super(arguments);
                    $(this.main).remove();
                }
            }
        );

        /**
         * 获取的容器,可自行添加样式，使其呈现堆叠效果。
         *
         * @return {HTMLElement}
         * @ignore
         */
        function getContainer() {
            // 因为container是多个toast公用的，所以不能标记为特定id
            var prefix = require('./main').getConfig('uiClassPrefix');
            var containerId = prefix + '-toast-collection-area';
            var element = document.getElementById(containerId);
            if (!element) {
                element = document.createElement('div');
                element.id = containerId;
                this.helper.addPartClasses('collection-area', element);
                document.body.appendChild(element);
            }
            return element;
        }

        function createHandler(messageType) {
            return function (content, options) {
                if (messageType === 'show') {
                    messageType = 'normal';
                }
                options = u.extend({content: content}, options);
                options.messageType = options.messageType || messageType;
                var toast = new Toast(options);
                Control.prototype.hide.apply(toast);
                toast.appendTo(getContainer.call(toast));
                return toast;
            };
        }

        u.each(
            ['show', 'info', 'alert', 'error', 'success'],
            function (key) {
                Toast[key] = createHandler(key);
            }
        );

        esui.register(Toast);
        return Toast;
    }
);
