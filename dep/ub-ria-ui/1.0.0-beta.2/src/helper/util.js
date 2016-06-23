/**
 * UB-RIA-UI 1.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 工具模块
 * @author curarchy
 */
define(
    function (require) {
        /**
         * 工具模块
         *
         * @class util
         * @singleton
         */
        var util = {};

        var u = require('underscore');

        /**
         * 比较两个字符串
         * stringA 是否等于 stringB
         * 或 stringA 是否包含 stringB
         *
         * @param {string} stringA 第一个字符串
         * @param {string} stringB 第二个字符串
         * @param {Object} config 比较配置
         * @param {boolean} config.caseSensitive 大小写敏感
         * @param {boolean} config.isPartial 是否部分匹配
         * @return {boolean} 比较结果
         */
        util.compare = function (stringA, stringB, config) {
            if (!u.isString(stringA) || !u.isString(stringB)) {
                return stringA === stringB;
            }

            config = config || {};
            if (!config.caseSensitive) {
                stringA = stringA.toLowerCase();
                stringB = stringB.toLowerCase();
            }

            if (config.isPartial) {
                return stringA.indexOf(stringB) !== -1;
            }
            return stringA === stringB;
        };

        return util;
    }
);
