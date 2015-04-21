/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 输入框微调输入扩展
 * @author maoquan(maoquan@baidu.com), jiangyuan(jiangyuan01@baidu.com)
 */
define(
    function (require) {

        var InputControl = require('esui/InputControl');

        var lib = require('esui/lib');
        var m = require('moment');
        var u = require('underscore');
        var ui = require('esui/main');

        /**
         * 微调输入控件
         *
         * @class ui.Spinner
         * @extends esui.InputControl
         */
        var exports = {};

        /**
         * 控件类型
         *
         * @type {string}
         * @override
         */
        exports.type = 'Spinner';


        /**
         * 微调输入控件
         *
         * @constructor
         */
        exports.constructor = function () {
            this.$super(arguments);
            // 短按计时器
            this.timer = 0;
            // 长按计时器
            this.longTimer = 0;
        };


        /**
         * 解析数字类型方法
         * @param value
         * @returns {string}
         */
        function parseToNum(value) {
            if (value) {
                value = parseFloat(value)
            }
            return isNaN(value) ? '' : value;
        }

        /**
         * 微调方向枚举值
         * @enum {string}
         */
        var Direct = {
            UP: 'up',
            DOWN: 'down'
        }

        /**
         * 更新日期类型方法
         * @param {Direct} direct
         */
        function updateDate (direct) {
            var input = this.getInput();
            var scale = typeof this.scale == 'object' ? this.scale : parseToNum(this.scale);
            var timeFormat = this.format;
            var value = m(input.value, timeFormat);
            var max = this.max;
            var min = this.min;

            //如果用户手动输入一个非法值，会默认显示最小值
            value = value.isValid() ? value : min;
            if (direct == Direct.UP) {
                value = value.add(scale.value, scale.key);
                if (m.max(value, max) == max) {
                    value = m(value, timeFormat).format(timeFormat);
                }
                else {
                    if (!!this.turn && this.turn !== 'false') {
                        value = m(min, timeFormat).format(timeFormat);
                    }
                    else {
                        value = m(max, timeFormat).format(timeFormat);
                    }
                }
            }
            else {
                value = value.subtract(scale.value, scale.key);
                if (m.min(value, min) == min) {
                    value = m(value, timeFormat).format(timeFormat);
                }
                else {
                    if (!!this.turn && this.turn !== 'false') {
                        value = m(max, timeFormat).format(timeFormat);
                    }
                    else {
                        value = m(min, timeFormat).format(timeFormat);
                    }
                }
            }
            setInputValue.call(this, value);
        }

        /**
         * 更新数值类型的方法
         * @param {Direct} direct
         */
        function updateNumber(direct) {
            var input = this.getInput();
            var scale = parseToNum(this.scale);
            var value = parseToNum(input.value);
            var max = this.max;
            var min = this.min;
            if (direct == Direct.UP) {
                value += scale;
                if (value > max) {
                    if (!!this.turn && this.turn !== 'false') {
                        value = min;
                    }
                    else {
                        value = max;
                    }
                }
            }
            else {
                value -= scale;
                if (value < min) {
                    if (!!this.turn && this.turn !== 'false') {
                        value = max;
                    }
                    else {
                        value = min;
                    }
                }
            }
            setInputValue.call(this, value);
        }

        /**
         * 更新值方法，用来判断值类型是数字类型还是时间类型
         * @param {Direct} direct
         */
        function updateValue (direct) {
            if (this.format != 'number') {
                updateDate.call(this, direct);
            }
            else {
                updateNumber.call(this, direct);
            }
        }

        /**
         * 改变value方法，该方法会触发 scrollValue 事件
         * 如果用户想自定义方法，可以通过preventDefault()阻止默认行为
         * @param {Event} e
         */
        function scrollValue (e) {
            if (!this.disabled && !this.readOnly) {
                var direct = (e.target.id == this.helper.getId('up')) ? Direct.UP : Direct.DOWN;
                var args = {
                    'direct': direct
                };
                var eventArgs = this.fire('scrollValue', args);
                if (!eventArgs.isDefaultPrevented()) {
                    updateValue.call(this, direct);
                }
            }
        }

        /**
         * 长按按钮自动更新方法
         * 长按3秒时，速度加倍
         * @param {Event} e
         */
        function autoUpdate(e) {
            var me = this;
            this.timer = setInterval(
                function () {
                    return scrollValue.call(me, e);
                },
                +parseToNum(this.timeInterval)
            );
            this.longTimer = setTimeout(
                function () {
                    clearInterval(me.timer);
                    me.timer = setInterval(
                        function () {
                            return scrollValue.call(me, e);
                        },
                        parseToNum(this.timeInterval) / 2
                    );
                },
                3000
            );
        }

        /**
         * 鼠标点击方法
         * @param {Event} e
         */
        function mouseDownHandler(e) {
            var delayTime = 1200 - this.timeInterval;
            scrollValue.call(this, e);
            var me = this;
            this.timer = setTimeout(
                function () {
                    return autoUpdate.call(me, e);
                },
                delayTime
            );
            // 阻止鼠标双击后反选控件其他部分
            e.preventDefault();
        }

        /**
         * 取消事件方法
         * @param {Event} e
         */
        function mouseUpHandler (e) {
            clearInterval(this.timer);
            clearTimeout(this.timer);
            clearTimeout(this.longTimer);
            this.timer = 0;
            this.longTimer = 0;
        }

        exports.initOptions = function (options) {
            var properties = { };
            lib.extend(properties, this.$self.defaultProperties, options);

            var format = properties.format;
            var max = properties.max;
            var min = properties.min;
            if (format === 'number') {
                max = max === 'indefinite' ? Number.MAX_VALUE : parseToNum(max);
                min = min === 'indefinite' ? -(Number.MAX_VALUE) : parseToNum(min);
            }
            else {
                max = max == 'indefinite' ? m().add(50, 'years') : m(max, format);
                min = min == 'indefinite' ? m().subtract(50, 'years'): m(min, format);
            }
            properties.max = max;
            properties.min = min;

            var scale = properties.scale;
            // 根据步长计算精度
            if (format === 'number') {
                var dotPosition = (scale + '').indexOf('.');
                if (dotPosition > -1) {
                    properties.precision = scale.length - dotPosition - 1;
                }
                else {
                    properties.precision = 0;
                }
            }

            // scale
            if (format !== 'number' && /^\s*\{/.test(scale)) {
                properties.scale = JSON.parse(scale);
            }

            this.setProperties(properties);
        };

        /**
         * 构建spinner
         */
        exports.initStructure = function () {
            var helper = this.helper;

            var spinnerTpl = [
                '<input id="${inputId}" type="text" />',
                '<span id="${upId}" class="${upClass} ${iconClass}"></span>',
                '<span id=${downId} class="${downClass} ${iconClass}"></span>'
            ].join('');

            var mainElement = this.main;

            mainElement.innerHTML = lib.format(
                spinnerTpl,
                {
                    inputId: helper.getId('input'),
                    upId: helper.getId('up'),
                    upClass: helper.getPartClasses('up'),
                    downId: helper.getId('down'),
                    downClass: helper.getPartClasses('down'),
                    iconClass: helper.getIconClass()
                }
            );

            lib.addClass(mainElement, helper.getPrefixClass('textbox'));

            ui.init(mainElement, {viewContext: this.viewContext});
        };

        /**
         * 初始化spinner事件
         */
        exports.initEvents = function () {
            var helper = this.helper;
            var up = helper.getPart('up');
            var down = helper.getPart('down');

            helper.addDOMEvent(up, 'mousedown', mouseDownHandler);
            helper.addDOMEvent(down, 'mousedown', mouseDownHandler);
            helper.addDOMEvent(up, 'mouseup',  mouseUpHandler);
            helper.addDOMEvent(down, 'mouseup',  mouseUpHandler);
            helper.addDOMEvent(up, 'mouseout',  mouseUpHandler);
            helper.addDOMEvent(down, 'mouseout',  mouseUpHandler);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        exports.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['rawValue'],
                paint: function (spinner, rawValue) {
                    var max = spinner.max;
                    var min = spinner.min;
                    var format = spinner.format;
                    if (spinner.format === 'number') {
                        rawValue = parseToNum(rawValue);
                        rawValue = Math.max(rawValue, min);
                        rawValue = Math.min(rawValue, max);
                    }
                    else {
                        rawValue = m(rawValue, format);
                        if (rawValue.isValid()) {
                            rawValue = m.max(rawValue, min);
                            rawValue = m.min(rawValue, max);
                        }
                        else {
                            rawValue = min;
                        }
                        rawValue = m(rawValue, format).format(format);
                    }
                    setInputValue.call(spinner, rawValue);
                }
            },
            {
                name: ['width'],
                paint: function (spinner, width) {
                    width = parseInt(width, 10);
                    spinner.main.style.width = width + 'px';
                }
            },
            {
                name: ['disabled', 'readOnly'],
                paint: function (spinner, disabled, readOnly) {
                    var input = spinner.getInput();
                    input.disabled = disabled;
                    input.readOnly = readOnly;
                }
            }
        );

        function setInputValue(value) {
            if (this.precision) {
                value = value.toFixed(this.precision);
            }
            var input = this.getInput();
            input.value = value;
        }

        /**
         * 获取input元素
         *
         * @return {Element}
         */
        exports.getInput = function () {
            return lib.g(this.helper.getId('input'));
        };

        /**
         * 获取控件值
         *
         * @return {string}
         */
        exports.getValue = function () {
            var input = this.getInput();
            return input.value;
        };

        /**
         * 设置控件值
         * @param {string} value
         */
        exports.setValue = function (value) {
            setInputValue.call(this, value);
        };


        /**
         * 销毁spinner方法
         */
        function disposeSpinner() {
            var helper = this.helper;
            var up = helper.getPart('up');
            var down = helper.getPart('down');

            helper.removeDOMEvent(up, 'mousedown', mouseDownHandler);
            helper.removeDOMEvent(down, 'mousedown', mouseDownHandler);
            helper.removeDOMEvent(up, 'mouseup',  mouseUpHandler);
            helper.removeDOMEvent(down, 'mouseup',  mouseUpHandler);
            helper.removeDOMEvent(up, 'mouseout',  mouseUpHandler);
            helper.removeDOMEvent(down, 'mouseout',  mouseUpHandler);
        }

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            disposeSpinner.call(this);
            this.$super(arguments);
        };


        var Spinner = require('eoo').create(InputControl, exports);

        /**
         * Spinner默认属性
         * turn: 当值到边界时是否反转
         * scale: 刻度单位, 如果format为 number 类型，则为数字类型， 如果format为 日期类型，则为Object类型，格式为：
         *          {
         *           key:   ***,    //时间单位，如 'days', 'years'等，具体请参考 {@link moment}
         *           value: ***     //单位时间， 数字类型
         *          }
         * max: 上界
         * min: 下界
         * format: 值的格式，包括 number 和 日期 两种，如果使用日期格式，format按照{@link moment}的格式进行设置
         * timeInterval: 长按按钮时，数值滚动的时间间隔
         * @type {{spaceHolder: string, turn: boolean, scale: number, range: Array}}
         */
        Spinner.defaultProperties = {
            turn: true,
            scale: 1,
            width: 200,
            height: 30,
            max: 'indefinite',
            min: 'indefinite',
            format: 'number',
            timeInterval: 100
        };

        require('esui').register(Spinner);

        return Spinner;
    }
);
