/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file HttpRequest基类
 * @author maoquan(maoquan@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');

        /**
         * HttpRequest
         *
         * @class ui.HttpRequest
         * @extends EventTarget
         */
        var exports = {};

        exports.constructor = function (method, url) {
            this.method = method;
            this.url = unescape(encodeURIComponent(url));
        };

        /**
         * 重置请求状态
         *
         * @public
         */
        exports.reset = function () {
            // 重置状态
            this.status = null;
            this.response = null;
        };

        /**
         * 发送上传请求
         *
         * @param {Object} options 上传参数
         * @param {Object} data 要上传的数据
         * @public
         */
        exports.send = function (options, data) {
            this.fire('beforesend', {data: data});
            // 子类实现
            // 如iframe, xhr level1, xhr level2, flash等
        };

        /**
         * 终止请求
         *
         * @public
         */
        exports.abort = function () {
            this.fire('abort');
        };

        /**
         * 获取当前请求状态
         *
         * @return {string}
         */
        exports.getStatus = function () {
            return this.status;
        };

        /**
         * 获取响应结果，responseType规定为json，因此直接解析成json
         *
         * @param {string} response 待解析的response串
         * @return {Object}
         * @public
         */
        exports.parseResponse = function (response) {
            if (u.isString(response) && !!window.JSON) {
                try {
                    return JSON.parse(response);
                }
                catch (ex) {
                    return {};
                }
            }
            return response;
        };

        /**
         * 显示错误结果
         *
         * @protected
         * @method ui.Uploader#showUploadErrorResult
         * @param {Object} options 上传结果
         */
        exports.showUploadErrorResult = function (options) {
            // 如果成功，`options`格式为：
            // {
            //     info: {
            //         value: {string}
            //     }
            // }
            //
            // 如果上传失败，`options`必须是以下格式
            // {
            //     fields:
            //         [
            //             {
            //                 field: "file",
            //                 message: "文件太大"
            //             }
            //         ]
            // }

            if (options.fields) {
                this.fire('fail', {fields: options.fields});
                this.notifyFail(options.fields[0].message);
            }
            else if (options.info) {
                if (!options.info.hasOwnProperty('type')) {
                    options.info.type = this.fileType;
                }

                this.fileInfo = options.info;
                this.fire('complete');
                this.notifyComplete(options.info);
            }
        };

        var EventTarget = require('mini-event/EventTarget');
        var HttpRequest = require('eoo').create(EventTarget, exports);

        return HttpRequest;
    }
);
