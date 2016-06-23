/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file L2XMLHttpRequest 封装Level2 XMLHttpRequest
 * @author maoquan(maoquan@baidu.com) lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        /**
         * L2XMLHttpRequest
         *
         * @class ui.L2XMLHttpRequest
         * @extends ui.XMLHttpRequest
         */
        var exports = {};

        /**
         * @override
         */
        exports.createXHR = function () {
            this.xhr = new window.XMLHttpRequest();
            xhrEventBind.call(this);
        };

        /**
         * XHR Level2 事件绑定处理
         */
        function xhrEventBind() {
            var me = this;

            // 上传完成
            this.xhr.onload = function (e) {
                me.status = e.target.status;
                if (e.target.status !== 200) {
                    me.fire('error');
                }
                else {
                    me.response = me.parseResponse(e.target.response);
                    me.fire('load');
                }
            };

            // 网络中断，服务器down机等，可以说，如果跑进来了，一定就是网络问题
            this.xhr.onerror = function (e) {
                me.fire('error');
            };

            // 上传进行中
            this.xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    me.fire('progress', {total: e.total, loaded: e.loaded});
                }
            };
        }

        var XMLHttpRequest = require('./XMLHttpRequest');
        var L2XMLHttpRequest = require('eoo').create(XMLHttpRequest, exports);

        return L2XMLHttpRequest;
    }
);
