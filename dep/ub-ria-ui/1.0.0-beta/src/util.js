/**
 * UB-RIA-UI 1.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 工具模块
 * @author lixiang
 */
define(
    function (require) {
        var EMPTY_OBJECT = {};

        /**
         * 工具模块
         *
         * @class util
         * @singleton
         */
        var util = require('eoo').static(require('underscore'));

        /**
         * 深度复制一个对象
         *
         * @param {Mixed} obj 任何对象
         * @return {Mixed} 复制后的对象
         */
        util.deepClone = function (obj) {
            // 非对象以及函数就直接返回
            if (!util.isObject(obj) || util.isFunction(obj) || util.isRegExp(obj)) {
                return obj;
            }

            if (util.isArray(obj)) {
                return util.map(obj, util.deepClone);
            }

            var clone = {};
            util.each(
                obj,
                function (value, key) {
                    clone[key] = util.deepClone(value);
                }
            );
            return clone;
        };

        util.parseBoolean = function (properties) {
            util.each(properties, function (property, key) {
                if (property === 'false') {
                    properties[key] = false;
                }
            });
        };

        return util;
    }
);
