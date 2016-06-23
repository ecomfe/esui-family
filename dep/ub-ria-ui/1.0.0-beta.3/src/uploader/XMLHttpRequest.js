/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file XMLHttpRequest 封装Level1 XMLHttpRequest
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {
        var u = require('underscore');

        /**
         * XMLHttpRequest
         *
         * @class ui.XMLHttpRequest
         * @extends ui.XMLHttpRequest
         */
        var exports = {
            // 原生的xmlhttprequest对象
            xhr: null
        };

        /**
         * @override
         */
        exports.send = function (options, data) {
            this.$super(arguments);

            // 重置状态
            this.reset();

            // 创建请求对象
            if (!this.xhr) {
                this.createXHR();
            }

            // 创建表单对象
            var formData = new window.FormData();
            if (!u.isEmpty(data)) {
                u.each(
                    data,
                    function (value, name) {
                        formData.append(name, value);
                    }
                );
            }

            this.xhr.open(this.method, this.url, true);

            if (this.requestHeader) {
                u.each(
                    this.requestHeader,
                    function (item) {
                        this.xhr.setRequestHeader(item.key, item.value);
                    },
                    this
                );
            }

            this.xhr.send(formData);
        };

        /**
         * @override
         */
        exports.setRequestHeader = function (requestHeader) {
            this.requestHeader = requestHeader;
        };

        /**
         * @override
         */
        exports.abort = function () {
            this.$super(arguments);

            if (this.xhr && this.xhr.abort) {
                this.xhr.abort();
            }
        };

        /**
         * 创建XHR对象
         *
         * @public
         */
        exports.createXHR = function () {
            this.xhr = new window.XMLHttpRequest();
            this.xhr.responseType = 'json';
            this.xhr.onreadystatechange = u.bind(xhrEventBind, this);
        };

        /**
         * 事件绑定处理
         */
        function xhrEventBind() {
            // XMLHttpRequest.LOADING，尝试模拟progress事件
            if (this.xhr.readyState === 3) {
                var total = 0;
                var loaded = 0;

                try {
                    // 部分浏览器跨域时取不到这个头
                    total = this.xhr.getResponseHeader('Content-Length') || 0;
                    loaded = this.xhr.responseText.length;
                }
                catch (ex) {
                    total = 0;
                    loaded = 0;
                }

                this.fire('progress', {total: parseInt(total, 10), loaded: loaded});
            }
            // XMLHttpRequest.DONE
            else if (this.xhr.readyState === 4) {
                this.xhr.onreadystatechange = null;

                this.status = this.xhr.status;

                // 虽然done了，但仍然可能返回0，表示服务器不可用
                if (this.xhr.status === 0) {
                    this.fire('error');
                }
                else {
                    this.response = this.parseResponse(this.xhr.response);
                    this.fire('load');
                }
            }
        }

        var HttpRequest = require('./HttpRequest');
        var XMLHttpRequest = require('eoo').create(HttpRequest, exports);

        return XMLHttpRequest;
    }
);
