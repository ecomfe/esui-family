/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file File
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {

        var lib = require('esui/lib');
        var u = require('underscore');

        var STATUS_MAP = {
            // 文件加入队列
            QUEUED: 0,
            // 文件正在上传
            UPLOADING: 1,
            // 文件上传失败
            FAILED: 2,
            // 文件上传完成
            DONE: 3
        };

        /**
         * File
         *
         * @class File
         * @extends EventTarget
         */
        var exports = {
            // 文件尺寸, 旧浏览器或者修改情况下可能为undefined
            size: undefined,
            // 已加载字节数
            loaded: 0
        };

        /**
         * @constructor
         * @param {Object} options options成员参考exports声明
        */
        exports.constructor = function (options) {
            if (window.File && options instanceof window.File) {
                this.name = options.name;
                this.raw = options;
                this.size = options.size;
            }
            else if (options) {
                u.extend(this, options);
            }
            this.id = this.id || lib.getGUID();
            // 文件状态
            this.status = STATUS_MAP.QUEUED;
            // 文件上传成功后对应的服务器返回
            this.serverData = null;
        };

        /**
         * 格式化文件尺寸
         * @return {string}
         */
        function formatSize(size) {
            if (u.isNumber(size)) {
                var k = size / 1024;
                var m = k / 1024;
                if (m >= 1) {
                    return m.toFixed(1) + 'MB';
                }
                return k.toFixed(1) + 'KB';
            }
            return 'N/A';
        }

        /**
         * 返回当前文件上传的进度
         * @return {string}
         */
        exports.getProgress = function () {
            if (!u.isUndefined(this.size)) {
                var percent = Math.ceil(this.loaded / this.size * 100);
                return percent + '%';
            }
            return 'N/A'
        }

        var EventTarget = require('mini-event/EventTarget');
        var File = require('eoo').create(EventTarget, exports);

        File.formatSize = formatSize;

        u.extend(File, STATUS_MAP);

        return File;
    }
);
