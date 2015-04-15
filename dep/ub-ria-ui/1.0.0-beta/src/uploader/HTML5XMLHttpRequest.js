/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file HTML5XMLHttpRequest 封装XMLHttpRequest
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {

        var u = require('underscore');
        var lib = require('esui/lib');
        var File = require('./File');

        /**
         * HTML5XMLHttpRequest
         * 不支持IE9-
         *
         * @class ui.HTML5XMLHttpRequest
         * @extends ui.XMLHttpRequest
         */
        var exports = {};
        // 原生的xmlhttprequest对象
        var xhr;

        exports.send = function (options, data) {
            this.status = null;
            this.response = null;

            xhr = new window.XMLHttpRequest();
            xhr.open(this.method, this.url, true);

            var formData = new window.FormData();

            if (!u.isEmpty(data)) {
                u.each(
                    data,
                    function (value, name) {
                        if (value instanceof File) {
                            value = value.raw;
                        }
                        formData.append(name, value);
                    }
                );
            }

            var me = this;
            // XHR L2
            if (xhr.upload) {

                xhr.addEventListener(
                    'load',
                    function(e) {
                        if (xhr.status === 200) {
                            me.response = xhr.response;
                            me.fire('load', e);
                        }
                        else {
                            me.fire('error', e);
                        }
                    }
                );

                xhr.addEventListener(
                    'error',
                    function(e) {
                        me.fire('error', e);
                    }
                );

                xhr.addEventListener(
                    'progress',
                    function(e) {
                        me.fire(
                            'progress'
                        );
                    }
                );

                xhr.upload.addEventListener(
                    'progress',
                    function(e) {
                        me.fire(
                            'uploadprogress',
                            {
                                loaded: e.loaded,
                                total: e.total
                            }
                        );
                    }
                );
            }
            // 模拟XHR L2
            else {
                xhr.onreadystatechange = function onReadyStateChange() {
                    switch (xhr.readyState) {
                        // XMLHttpRequest.OPENED
                        case 1:
                            break;
                        // XMLHttpRequest.HEADERS_RECEIVED
                        case 2:
                            break;
                        // XMLHttpRequest.LOADING
                        case 3:
                            // 尝试模拟progress事件
                            var total = 0;
                            var loaded = 0;

                            try {
                                // 部分浏览器跨域时取不到这个头
                                total = xhr.getResponseHeader('Content-Length') || 0;
                                loaded = xhr.responseText.length;
                            }
                            catch (ex) {
                                total = 0;
                                loaded = 0;
                            }

                            me.fire(
                                'progress',
                                {
                                    lengthComputable: !!total,
                                    total: parseInt(total, 10),
                                    loaded: loaded
                                }
                            );
                            break;
                        // XMLHttpRequest.DONE
                        case 4:
                            xhr.onreadystatechange = null;

                            // 服务器不可用
                            // firefox: timeout也返回0
                            if (xhr.status === 0) {
                                me.fire('error');
                            }
                            else {
                                me.fire('load');
                            }
                            break;
                    }
                };
            }

            if (this.responseType && 'responseType' in xhr) {
                xhr.responseType = this.responseType;
            }
            xhr.send(formData);
        };

        /**
         * override
         */
        exports.getResponse = function () {
            if (this.responseType === 'json') {
                this.response = xhr.response;
                return this.response;
            }
            else if (this.responseType === 'text' || responseType === '') {
                return JSON.parse(this.responseText);
            }
            return {};
        };

        /**
         * override
         */
        exports.abort = function () {
            if (xhr && xhr.abort) {
                xhr.abort();
            }
            me.fire('abort');
        };

        var XMLHttpRequest = require('./XMLHttpRequest');
        var HTML5XMLHttpRequest = require('eoo').create(XMLHttpRequest, exports);

        return HTML5XMLHttpRequest;
    }
);
