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

        /**
         * 字符串省略显示
         *
         * @public
         * @method ui.util.ellipsis
         * @param {string} str 目标字符串
         * @param {number | string} len 目标长度
         * @return {string} 截断后字符串
         */
        util.ellipsis = function (str, len) {
            len = parseInt(len, 10);
            // length属性读出来的汉字长度为1
            if (str.length * 2 <= len) {
                return str;
            }
            var strlen = 0;
            var s = '';
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 128) {
                    strlen = strlen + 2;
                    if (strlen > len) {
                        return s.substring(0, s.length - 1) + '...';
                    }
                }
                else {
                    strlen = strlen + 1;
                    if (strlen > len) {
                        return s.substring(0, s.length - 2) + '...';
                    }
                }
                s = s + str.charAt(i);
            }
            return s;
        };

        /**
         * 格式化数字
         *
         * @public
         * @method ui.util.formatNumber
         * @param {number} number 输入的数字
         * @param {number} [decimals=0] 保留小数位数
         * @param {string} [emptyValue=""] 当输入为空或不是数字时的返回内容，会加前缀
         * @param {string} [prefix=""] 返回的字符串的前缀
         * @return {string}
         */
        util.formatNumber = function (number, decimals, emptyValue, prefix) {
            // 共6个重载：
            //
            // - `formatNumber(s)`
            // - `formatNumber(s, emptyValue)`
            // - `formatNumber(s, emptyValue, prefix)`
            // - `formatNumber(s, decimals)`
            // - `formatNumber(s, decimals, emptyValue)`
            // - `formatNumber(s, decimals, emptyValue, prefix)`
            //
            // 主要看第2个参数的类型，不是数字的话参数往前移1个
            if (typeof arguments[1] !== 'number') {
                prefix = arguments[2];
                emptyValue = arguments[1];
                decimals = 0;
            }
            prefix = prefix || '';
            emptyValue = emptyValue || '';

            if (number == null || isNaN(number)) {
                return prefix + emptyValue;
            }

            number = parseFloat(number).toFixed(decimals);
            // 分为整数和小数
            var parts = number.split('.');
            var integer = parts[0];
            var decimal = parts[1];
            // 加上千位分隔
            integer = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
            // 再拼起来
            var result = prefix + integer;
            if (decimal) {
                result += '.' + decimal;
            }
            return result;
        };

        return util;
    }
);
