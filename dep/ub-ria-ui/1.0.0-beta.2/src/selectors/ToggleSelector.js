/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 可将一个单选RichSelector展开收起的控件
 * @exports ToggleSelector
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var $ = require('jquery');
        var esui = require('esui');
        var u = require('underscore');
        var TogglePanel = require('../TogglePanel');
        var eoo = require('eoo');

        /**
         * @class ToggleSelector
         * @extends TogglePanel
         */
        var ToggleSelector = eoo.create(
            TogglePanel,
            {

                /**
                 * @override
                 */
                type: 'ToggleSelector',

                getCategory: function () {
                    return 'input';
                },

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        textField: null,
                        collapseAfterChange: true
                    };
                    options = u.extend(properties, options);
                    this.$super(arguments);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    var me = this;

                    var controlHelper = this.helper;
                    me.$super(arguments);
                    var $mainElement = $(me.main);

                    var $children = $mainElement.children();
                    var $text = $children.eq(0);
                    var $contentLayer = $children.eq(1);
                    var $caret = $('<span></span>').addClass(
                        controlHelper.getPrefixClass('select-arrow')
                        + ' '
                        + controlHelper.getIconClass()
                    );

                    $mainElement.addClass(controlHelper.getPrefixClass('select'));
                    $text.addClass(controlHelper.getPrefixClass('select-text'));
                    $mainElement.append($caret);
                    $contentLayer.insertAfter($mainElement);
                },

                /**
                 * @override
                 */
                initEvents: function () {
                    // this.$super(arguments);
                    var me = this;
                    var target = me.viewContext.getSafely(me.targetControl);
                    var controlHelper = me.helper;
                    target.on('change', u.bind(changeHandler, me));
                    target.on('add', u.bind(addHandler, me));
                    me.updateDisplayText(target);
                    controlHelper.addDOMEvent(
                        me.main,
                        'click',
                        me.toggleContent
                    );
                },

                /**
                 * @override
                 */
                toggleContent: function () {
                    if (!this.isDisabled()) {
                        this.toggleStates();
                    }
                },

                updateDisplayText: function (target) {
                    var displayText = this.title;
                    // 要render了以后才能获取到value
                    if (target.helper.isInStage('RENDERED')) {
                        var rawValue = target.getRawValue();
                        // 因为只针对单选控件，因此即便是多个也默认选第一个
                        if (u.isArray(rawValue)) {
                            rawValue = rawValue[0];
                        }
                        if (rawValue && rawValue[this.textField]) {
                            displayText = rawValue[this.textField];
                        }
                    }
                    this.set('title', u.escape(displayText));
                },

                getRawValue: function () {
                    var target = this.viewContext.getSafely(this.targetControl);
                    var rawValue = target.getRawValue();
                    if (rawValue) {
                        return rawValue[this.valueField];
                    }
                },

                setRawValue: function (value) {
                    var target = this.viewContext.getSafely(this.targetControl);
                    target.setRawValue(value);
                },

                getValue: function () {
                    return this.getRawValue();
                },

                setValue: function (value) {
                    var rawValue = [{id: value}];

                    this.setRawValue(rawValue);
                },

                /**
                 * 进行验证
                 *
                 * @return {boolean}
                 */
                validate: function () {
                    var target = this.viewContext.get(this.targetControl);

                    if (!target) {
                        return true;
                    }

                    if (typeof target.validate === 'function') {
                        return target.validate();
                    }
                }
            }
        );

        /**
         * 数据变化时如果没有阻止，则更新显示文字
         *
         * @event
         * @param {Object} e 事件对象
         */
        function changeHandler(e) {
            var event = this.fire('change');
            if (!event.isDefaultPrevented()) {
                this.updateDisplayText(e.target);
            }
        }

        /**
         * 添加数据时才控制展开收起
         *
         * @event
         * @param {Object} e 事件对象
         */
        function addHandler(e) {
            if (this.collapseAfterChange) {
                this.toggleContent();
            }
        }

        esui.register(ToggleSelector);
        return ToggleSelector;
    }
);
