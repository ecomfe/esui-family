/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file ESUI组件，封装了一个Flash对象，将指定内容复制到剪贴板中
 * @author yankun01(yankun01@baidu.com)
 */

define(
    function (require) {
        // 引用创建SWF元素的帮助类
        require('./FlashObject');
        var u = require('underscore');
        var Control = require('esui/Control');
        var eoo = require('eoo');
        var esui = require('esui/main');
        var $ = require('jquery');
        // 引用Flash swf的路径通过AMD路径计算
        var swfPath = require.toUrl('../resource/fClipboard.swf');

        /**
         * CopyButton类定义
         *
         * @class
         * @extends Control
         *
         * @constructor
         *
         * 创建新的CopyButton实例
         *
         * @param {Object} [options] 组件参数
         */
        var CopyButton = eoo.create(
            Control,
            {
                /**
                 * CopyButton类型用于注册到ESUI库
                 *
                 * @override
                 */
                type: 'CopyButton',

                /**
                 * 初始化传入参数
                 *
                 * @param {Object} options 初始化参数
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        /**
                         * @property {boolean}
                         *
                         * 是否把Flash Hover鼠标设置成小手
                         */
                        setHandCursor: true,
                        /**
                         * @property {string}
                         *
                         * 要拷贝到剪切板的字符串
                         */
                        content: ''
                    };
                    u.extend(properties, options);
                    this.$super([properties]);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    var helper = this.helper;
                    this.flashId = helper.getId('flash');
                    var jqFlashWrapper = $('<span id="' + helper.getId('flash-wrapper') + '"></span>');
                    var jqMainElement = $(this.main);

                    // 创建Flash页面元素
                    var flashObj = esui.create('FlashObject', {
                        id: this.flashId,
                        swf: swfPath,
                        width: '100%',
                        height: '100%',
                        wmode: 'transparent'
                    });
                    this.addChild(flashObj, 'flashObj');
                    flashObj.appendTo(jqFlashWrapper[0]);

                    // 对齐元素
                    jqMainElement.append(jqFlashWrapper);
                    jqMainElement.css('position', 'relative');
                    jqFlashWrapper.css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0
                    });
                },

                /**
                 * @override
                 */
                initEvents: function () {
                    var me = this;

                    me.copyScriptFun = me.id + '_proxy';
                    window[me.copyScriptFun] = u.bind(onCopyScript, me);
                    checkFlashState.call(me, function () {
                        /**
                         * Flash元素完成初始化时触发
                         *
                         * @event CopyButton#ready
                         */
                        me.fire('ready');
                    });
                },

                /**
                 * @override
                 */
                dispose: function () {
                    var helper = this.helper;
                    if (helper.isInStage('DISPOSED')) {
                        return;
                    }

                    // 移除添加的DOM元素
                    $(this.main).css('position', '');
                    $('#' + helper.getId('flash-wrapper')).remove();
                    // 清除全局Flash Proxy函数
                    delete window[this.copyScriptFun];
                    this.$super(arguments);
                }
            }
        );

        /**
         * 触发copy事件使用者从外部传入要拷贝到剪切板的内容
         *
         * @return {string} 需要拷贝到剪切板的内容
         * @private
         */
        function onCopyScript() {
            /**
             * 值变更时触发
             *
             * @event
             * @param {Object} e 事件参数
             * @param {string} e.content CopyButton当前content的值
             *
             * @example
             *     copyButtonInstance.on('copy', function (e) {
             *         // 上一次的值
             *         console.log(e.content);
             *         this.content = 'new value to copy';
             *     );
             */
            this.fire('copy', {
                content: this.content
            });

            return this.content;
        }

        /**
         * 循环检测 flash 的初始化情况，初始化后注册回调函数
         *
         * @param  {Function} callback 完成初始化后的回调函数
         */
        function checkFlashState(callback) {
            var me = this;
            var flash = $('#' + me.flashId)[0];
            if (flash && flash.flashInit && flash.flashInit()) {
                flash.setHandCursor(me.setHandCursor);
                flash.setContentFuncName(me.copyScriptFun);

                if (callback) {
                    callback();
                }
            }
            else {
                setTimeout(
                    function () {
                        checkFlashState.call(me, callback);
                    },
                    10
                );
            }
        }

        esui.register(CopyButton);
        return CopyButton;
    }
);
