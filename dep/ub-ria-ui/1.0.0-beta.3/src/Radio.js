/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 单选框
 * @author hongfeng@baidu.com
 */
define(
    function (require) {
        var u = require('underscore');
        var $ = require('jquery');
        var esui = require('esui/main');
        var InputControl = require('esui/InputControl');
        var eoo = require('eoo');
        var painters = require('esui/painters');

        /**
         * 单选框
         *
         * @extends InputControl
         * @constructor
         */
        var Radio = eoo.create(InputControl, {
            /**
             * 控件类型，始终为`"Radio"`
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'Radio',

            /**
             * 初始化配置
             *
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    /**
                     * @property {string} [selectedValue='']
                     *
                     * Radio的Value
                     */
                    selectedValue: ''
                };

                u.extend(properties, options);
                properties.name = properties.name || this.main.getAttribute('name');
                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                var name = this.name;
                var inputs = $('input[name="' + name + '"]');
                var id = this.helper.getId();
                var classes = this.helper.getPartClasses('custom');
                var count = 0;

                u.each(
                    inputs,
                    function (input) {
                        input = $(input);
                        var inputId = id + '-part' + count++;
                        inputId = input.attr('id') || inputId;
                        input.attr('id', inputId);
                        input.wrap('<div class="' + classes + '"></div>');

                        var labelValue = input.data('label');
                        var label = $('<label for="' + inputId + '">' + labelValue + '</label>');
                        input.after(label);
                    }
                );
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var name = this.name;
                var inputs = $('input[name="' + name + '"]');
                var that = this;

                inputs.on('change', function () {
                    var value = $('input[name="' + name + '"]:checked').val();
                    that.setValue(value);
                    that.fire('change', {
                        value: value
                    });
                });
            },

            /**
             * 重渲染
             *
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                InputControl.prototype.repaint,
                {
                    /**
                     * @property {string} selectedValue
                     */
                    name: 'selectedValue',
                    paint: function (box, selectedValue) {
                        var name = box.name;
                        $('input[name="' + name + '"][value="' + selectedValue + '"]').prop('checked', true);
                    }
                },
                {
                    name: 'disabled',
                    paint: function (box, disabled) {
                        var name = box.name;
                        var inputs = $('input[name="' + name + '"]');

                        if (disabled) {
                            inputs.prop('disabled', true);
                        }
                        else {
                            inputs.prop('disabled', false);
                        }
                    }
                }
            )
        });

        esui.register(Radio);
        return Radio;
    }
);
