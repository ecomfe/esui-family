/**
 * ESUI (Enterprise UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 必填项验证规则
 * @author otakustay
 */
define(
    function (require) {
        var Rule = require('./Rule');
        var ValidityState = require('./ValidityState');
        var eoo = require('eoo');
        var esui = require('../main');

        /**
         * 非空验证规则
         *
         * @extends validator.Rule
         * @class validator.RequiredRule
         * @constructor
         */
        var RequiredRule = eoo.create(
            Rule,
            {
                /**
                 * 规则类型，始终为`"require"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'required',

                /**
                 * 错误提示信息
                 *
                 * @type {string}
                 */
                errorMessage: '${title}不能为空',

                /**
                 * 验证控件的验证状态
                 *
                 * @param {string} value 校验值
                 * @param {Control} control 待校验控件
                 * @return {validator.ValidityState}
                 * @override
                 */
                check: function (value, control) {
                    return new ValidityState(!!value, this.getErrorMessage(control));
                }
            }
        );

        esui.registerRule(RequiredRule, 0);
        return RequiredRule;
    }
);
