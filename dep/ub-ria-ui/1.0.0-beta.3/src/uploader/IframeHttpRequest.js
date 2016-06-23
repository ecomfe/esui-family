/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file IframeHttpRequest iframe请求处理
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {
        var $ = require('jquery');
        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * IframeHttpRequest
         *
         * @class ui.IframeHttpRequest
         * @extends ui.HttpRequest
         */
        var exports = {};

        // 发送请求用到的iframe
        var iframe = null;

        /**
         * @override
         */
        exports.send = function (options, data) {
            this.$super(arguments);

            this.status = null;
            this.response = null;

            this.size = data.size;

            // uid关联iframe,form,input
            // 如果没有uid，则iframe,form等无法重用
            var uid = data.id;
            if (!uid) {
                return;
            }

            var container = options.container || document.body;
            var input = lib.g(uid);
            // 这里放个占位符，一会input上传完了还要放回来
            var placeholder = $('<div id="' + uid + '_placeholder" style="display:none;"></div>');
            lib.insertBefore(placeholder[0], input);

            // 创建提交用form
            var formId = uid + '-form';
            var form = lib.g(formId);
            if (!form) {
                return;
            }

            // 创建接收的iframe
            var iframeId = uid + '-iframe';
            iframe = createIframe.call(this, iframeId);
            container.appendChild(iframe);

            // 关联form， iframe
            form.target = iframeId;

            // 上传的数据通过hidden input实现
            // 现增加header，iframe里，header的信息追加到表单中
            if (this.requestHeader) {
                data = u.extend(data, this.requestHeader);
            }

            u.each(
                data,
                function (value, name) {
                    var hidden = document.createElement('input');
                    u.extend(
                        hidden,
                        {
                            type: 'hidden',
                            name: name,
                            value: value
                        }
                    );
                    form.appendChild(hidden);
                }
            );
            form.setAttribute('method', this.method);
            form.setAttribute('action', this.url);
            form.submit();
        };

        /**
         * override
         */
        exports.abort = function () {
            if (iframe && iframe.contentWindow) {
                // FireFox / Safari / Chrome
                if (iframe.contentWindow.stop) {
                    iframe.contentWindow.stop();
                }
                // IE
                else if (iframe.contentWindow.document.execCommand) {
                    iframe.contentWindow.document.execCommand('Stop');
                }
                else {
                    iframe.src = 'about:blank';
                }
            }
            this.cleanup();
            this.fire('abort');
        };

        /**
         * 上传完成后，要做一些清理工作
         * 比如删除iframe，还有要清理临时生成的hidden input等
         *
         * @public
         */
        exports.cleanup = function () {
            if (!iframe) {
                return;
            }

            var uid = iframe.id.replace(/-iframe$/, '');

            // input放回原位
            // var input = lib.g(uid);
            // var placeholder = lib.g(uid + '_placeholder');
            // if (placeholder && input) {
            //     lib.insertBefore(input, placeholder);
            //     placeholder.parentNode.removeChild(placeholder);
            // }

            var form = lib.g(uid + '-form');
            if (form) {
                form.innerHTML = '';
                form.parentNode.removeChild(form);
                form = null;
            }

            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
            iframe = null;
        };

        /**
         * 创建接收结果用的iframe
         *
         * @param {string} id 元素id
         * @return {Element} 创建好的iframe元素
         */
        function createIframe(id) {
            var me = this;
            var iframe = $(
                lib.format(
                    '<iframe id="${id}" name="${id}"'
                    + ' src="javascript:&quot;&quot;" style="display:none"></iframe>',
                    {
                        id: id
                    }
                )
            );

            // 上传成功后处理服务器响应
            iframe.on(
                'load',
                function () {
                    try {
                        var doc;
                        if (iframe[0].contentWindow) {
                            doc = iframe[0].contentWindow.document;
                        }
                        else {
                            doc = iframe[0].contentDocument || window.frames[iframe[0].id].document;
                        }

                        // 尝试探测一些标准错误页面
                        if (/^4(0[0-9]|1[0-7]|2[2346])\s/.test(doc.title)) {
                            me.status = doc.title.replace(/^(\d+).*$/, '$1');
                            me.fire('error');
                        }
                        else {
                            me.response = me.parseResponse(lib.trim(doc.body.innerHTML));
                            var event = me.fire('load');
                            // 外部可能做一些错误处理，如果不阻止，则做清理操作
                            if (!event.isDefaultPrevented()) {
                                me.cleanup();
                            }
                        }
                    }
                    catch (ex) {
                        // FIXME 不一定是404，后端返回的其他status的错误也会抛异常
                        me.status = 404;
                        me.fire('error');
                    }
                }
            );
            return iframe[0];
        }

        var HttpRequest = require('./HttpRequest');
        var IframeHttpRequest = require('eoo').create(HttpRequest, exports);

        return IframeHttpRequest;
    }
);
