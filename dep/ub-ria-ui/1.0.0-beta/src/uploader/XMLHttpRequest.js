/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file XMLHttpRequest基类
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {

        var u = require('underscore');

        // 状态枚举值
        var STATUS_UNSENT = 0;
        var STATUS_OPENED = 1;
        var STATUS_HEADERS_RECEIVED = 2;
        var STATUS_LOADING = 3;
        var STATUS_DONE = 4;

        /**
         * XMLHttpRequest
         *
         * @class ui.XMLHttpRequest
         * @extends EventTarget
         */
        var exports = {
            // 请求的方法
            method: 'POST',
            // 请求的url
            url: '',
            // 请求头
            headers: {},
            // 超时时间, 大于0有效
            timeout: 0,
            // 当前状态
            readyState: STATUS_UNSENT,
            // 状态码
            status: 0,
            // 状态枚举值
            statusText: "",
            // 响应类型
            responseType: "json",
            // responseType为text或''有值
            responseText: null,
            // 根据responseType解析出的值，如json
            response: null

        };

        /**
         * @method
         * @param {String} method
         * @param {String} url
         * @param {Boolean} [async=true] 是否异步
        */
        exports.open = function (method, url, async) {
            this.method = method;
            this.url = unescape(encodeURIComponent(url));
            this.readyState = STATUS_OPENED;
        };

        /**
         * 发送上传请求
         * @param {Object} options 上传参数
         * @param {Object} data 要上传的数据
         */
        exports.send = function (options, data) {
            // 子类实现
            // 如html4, html5, flash等
        };

        /**
         * 获取状态
         */
        exports.getStatus = function () {
            return this.status;
        };

        /**
         * 获取响应结果
         * @return {Object|string}
         */
        exports.getResponse = function () {
            if (this.responseType === 'json') {
                if (u.isString(this.response) && !!window.JSON) {
                    try {
                        return JSON.parse(this.response);
                    }
                    catch (ex) {
                        return {};
                    }
                }
            }
            return this.response;
        };

        exports.abort = function () {
            this.fire('abort');
        };

        var EventTarget = require('mini-event/EventTarget');
        var XMLHttpRequest = require('eoo').create(EventTarget, exports);

        return XMLHttpRequest;
    }
);
