/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file HTML4XMLHttpRequest 模拟XMLHttpRequest接口封装上传请求
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {

        var u = require('underscore');
        var lib = require('esui/lib');
        var File = require('./File');

        /**
         * HTML4XMLHttpRequest
         *
         * @class ui.Uploader
         * @extends esui.InputControl
         */
        var exports = {};

        // 发送请求用到的iframe
        var iframe = null;

        exports.send = function (options, data) {
            this.status = null;
            this.response = null;

            // uid关联iframe,form,input
            // 如果没有uid，则iframe,form等无法重用
            var uid;
            var file = null;
            u.each(
                data,
                function (value, name) {
                    if (value && value instanceof File) {
                        file = value;
                        uid = file.id;
                        delete data[name];
                    }
                }
            );
            if (!uid) {
                return;
            }

            var container = options.container || document.body;
            var input = lib.g(uid);
            // 这里放个占位符，一会input上传完了还要放回来
            var placeholder = lib.dom.createElement(
                '<div id="' + uid + '_placeholder" style="display:none;"></div>'
            );
            lib.insertBefore(placeholder, input);

            var form = lib.g(uid + '_form');
            if (!form) {
                form = document.createElement('form');
                form.setAttribute('id', uid + '_form');
                form.setAttribute('method', this.method);
                form.setAttribute('enctype', 'multipart/form-data');
                form.setAttribute('encoding', 'multipart/form-data');
                form.style.display = 'none';
                container.appendChild(form);
            }
            form.setAttribute('target', uid + '_iframe');
            form.appendChild(input);

            // 上传的数据通过hidden input实现
            u.each(
                data,
                function (value, name) {
                    var hidden = document.createElement('input');
                    u.extend(
                        hidden,
                        {
                            type : 'hidden',
                            name : name,
                            value : value
                        }
                    );
                    form.appendChild(hidden);
                }
            );
            form.setAttribute("action", this.url);

            createIframe();
            form.submit();
            this.fire('loadstart');

            var me = this;

            function createIframe() {

                iframe = lib.dom.createElement(
                    lib.format(
                        '<iframe id="${uid}_iframe" name="${uid}_iframe"'
                        + ' src="javascript:&quot;&quot;" style="display:none"></iframe>',
                        {
                            uid: uid
                        }
                    )
                );
                container.appendChild(iframe);

                // 上传成功后处理服务器响应
                lib.on(
                    iframe,
                    'load',
                    function () {
                        try {
                            var doc = iframe.contentWindow.document
                                || iframe.contentDocument || window.frames[iframe.id].document;

                            // 尝试探测一些标准错误页面
                            if (/^4(0[0-9]|1[0-7]|2[2346])\s/.test(doc.title)) {
                                me.status = doc.title.replace(/^(\d+).*$/, '$1');
                            }
                            else {
                                me.status = 200;
                                // 获取响应结果
                                me.response = lib.trim(doc.body.innerHTML);

                                me.fire(
                                    'progress',
                                    {
                                        loaded: me.response.length,
                                        total: me.response.length
                                    }
                                );

                                // 也更新一下上传进度，表示上传完成了
                                me.fire(
                                    'uploadprogress',
                                    {
                                        loaded: file.size || 1025,
                                        total: file.size || 1025
                                    }
                                );
                            }
                        }
                        catch (ex) {
                            me.status = 404;
                        }

                        // 清理战场
                        cleanup.call(
                            me,
                            function () {
                                if (me.status === 200) {
                                    me.fire('load');
                                }
                                else {
                                    me.fire(
                                        'error',
                                        {
                                            status: me.status
                                        }
                                    );
                                }
                            }
                        );

                    }
                );
            }

        };


        /**
         * 上传完成后，要做一些清理工作
         * 比如删除iframe，还有要清理临时生成的hidden input等
         * @param {Function} callback 清理完成后调用
         */
        function cleanup(callback) {

            if (!iframe) {
                return;
            }

            var uid = iframe.id.replace(/_iframe$/, '');

            // input放回原位
            var input = lib.g(uid);
            var placeholder = lib.g(uid + '_placeholder');
            if (placeholder && input) {
                lib.insertBefore(input, placeholder);
                placeholder.parentNode.removeChild(placeholder);
            }

            var form = lib.g(uid + '_form');
            if (form) {
                var inputs = form.getElementsByTagName('input');
                u.each(
                    inputs,
                    function (input) {
                        var type = input.getAttribute('type');
                        if (type === 'hidden') {
                            input.parentNode.removeChild(input);
                        }
                    }
                );
                inputs = [];

                form.parentNode.removeChild(form);
                form = null;
            }

            // 不用timeout，浏览器控制台看到的网络请求变成 已取消
            setTimeout(
                function () {
                    // lib.un(iframe, 'load');
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                    iframe = null;
                    callback();
                },
            1);
        }

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
                    iframe.src = "about:blank";
                }
            }

            var me = this;
            cleanup.call(
                me,
                function () {
                    me.fire('abort');
                }
            );

        };

        var XMLHttpRequest = require('./XMLHttpRequest');
        var HTML4XMLHttpRequest = require('eoo').create(XMLHttpRequest, exports);

        return HTML4XMLHttpRequest;
    }
);
