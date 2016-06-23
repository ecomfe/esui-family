/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file File 文件封装类，保证FileInput中的数据一致性
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {

        var lib = require('esui/lib');
        var u = require('underscore');

        var STATUS_MAP = {
            // 文件加入队列
            WAITING: 0,
            // 文件正在上传
            UPLOADING: 1,
            // 文件上传失败
            FAILED: 2,
            // 文件上传完成
            DONE: 3,
            // 文件验证不通过
            ERROR: -1
        };

        /**
         * File
         *
         * @class File
         * @extends EventTarget
         */
        var exports = {};

        /**
         * 构造函数
         *
         * @constructor
         * @param {Object} options options成员参考exports声明
        */
        exports.constructor = function (options) {
            if (window.File && options instanceof window.File) {
                this.name = options.name;
                this.originalSize = options.size;
                this.size = formatSize(options.size);
                this.fileData = options;
            }
            else if (options) {
                u.extend(this, options);
            }
            this.id = this.id || lib.getGUID();
            // 文件初始状态
            this.status = STATUS_MAP.WAITING;
        };

        /**
         * 格式化文件尺寸，返回KB和MB
         *
         * @param {number} size 尺寸大小
         * @return {string} 返回尺寸大小
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

        var EventTarget = require('mini-event/EventTarget');
        var File = require('eoo').create(EventTarget, exports);

        File.formatSize = formatSize;

        u.extend(File, STATUS_MAP);

        return File;
    }
);
