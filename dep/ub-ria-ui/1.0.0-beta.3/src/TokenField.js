/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file TokenField.js
 * @description 标签输入框，典型场景如邮件收件人输入框
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {
        var esui = require('esui');
        var $ = require('jquery');
        var u = require('underscore');
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var eoo = require('eoo');
        var painters = require('esui/painters');

        require('esui/TextBox');

        /**
         * TokenField
         *
         * @class
         * @extends esui.InputControl
         */
        var TokenField = eoo.create(
            InputControl,
            {

                /**
                 * 控件类型，始终为`"TokenField"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'TokenField',

                /**
                 * 初始化配置
                 *
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {

                        /**
                         * 控件宽度
                         *
                         * @type {number}
                        */
                        width: 300,

                        /**
                         * 输入框最小宽度,剩余宽度不够就换行了
                         *
                         * @type {number}
                        */
                        inputWidth: 90,

                        /**
                         * token最小字符串长度，低于该长度不创建, 默认不限制
                         *
                         * @type {number}
                        */
                        minLength: 0,

                        /**
                         * token最大数量,默认不限制
                         *
                         * @type {number}
                        */
                        limit: 0,

                        /**
                         * 是否允许重复
                         *
                         * @type {bool}
                        */
                        allowRepeat: false,

                        /**
                         * 默认空数组
                         */
                        rawValue: []
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

                    // 如果用的是一个`<input>`，替换成`<div>`
                    if (this.main.nodeName.toLowerCase() === 'input') {
                        this.helper.replaceMain();
                        this.main.id = this.helper.getId();
                    }

                    var html = [
                        '<input type="text" autocomplete="off"',
                        ' class="${inputClasses}"',
                        ' data-ui-type="TextBox"',
                        ' data-ui-width="${width}"',
                        ' data-ui-id="${inputId}">'
                    ].join('');

                    this.main.innerHTML = lib.format(
                        html,
                        {
                            inputId: this.helper.getId('input'),
                            inputClasses: this.helper.getPartClasses('input'),
                            width: this.inputWidth
                        }
                    );
                    // 创建控件树
                    this.initChildren();
                },

                /**
                 * 初始化事件交互
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    var controlHelper = this.helper;

                    controlHelper.addDOMEvent(this.main, 'click', this.focusInput);
                    var itemClass = this.helper.getPartClassName('item');
                    controlHelper.addDOMEvent(this.main, 'click', '.' + itemClass, this.remove);

                    var input = this.getInput();
                    input.on('focus', this.focus, this);
                    input.on('blur', this.blur, this);
                    input.on('enter', this.enter, this);

                    var inputElem = input.getFocusTarget();
                    controlHelper.addDOMEvent(inputElem, 'keydown', this.keydown);
                    controlHelper.addDOMEvent(inputElem, 'keyup', this.keyup);
                },

                /**
                 * 获取真实输入框控件
                 *
                 * @return {esui.TextBox}
                 */
                getInput: function () {
                    var inputId = this.helper.getId('input');
                    return this.viewContext.get(inputId);
                },

                /**
                 * 输入框focus
                 *
                 * @param {Event} e 事件对象
                 */
                focusInput: function (e) {
                    var input = this.getInput();
                    input.getFocusTarget().focus();
                },

                /**
                 * 响应focus, 输入框获取焦点时，控件整体相应的focus
                 *
                 * @param {Event} e 事件对象
                 */
                focus: function (e) {
                    this.focused = true;
                    this.helper.addStateClasses('focus');
                },

                /**
                 * 响应blur
                 *
                 * @param {Event} e 事件对象
                 */
                blur: function (e) {
                    this.focused = false;
                    this.helper.removeStateClasses('focus');
                },

                /**
                 * 响应keydown,keydown较keyup早触发，keydown时可记录输入框变化前的值
                 *
                 * @param {Event} e 事件对象
                 */
                keydown: function (e) {
                    var input = this.getInput();
                    switch (e.keyCode) {
                        // backspace
                        case 8:
                            if (input.getFocusTarget() === document.activeElement) {
                                // keydown触发早于keyup，keydown时记下当前输入框的字符
                                // 用于keyup时判断是否应删除token
                                this.lastInputValue = input.getRawValue();
                            }
                            break;
                        default:
                            break;
                    }
                },

                /**
                 * 响应keyup
                 *
                 * @param {Event} e 事件对象
                 */
                keyup: function (e) {
                    if (!this.focused) {
                        return;
                    }
                    var input = this.getInput();
                    var inputValue = input.getRawValue();
                    switch (e.keyCode) {
                        // backspace
                        case 8:
                        // delete
                        case 46:
                            if (input.getFocusTarget() === document.activeElement) {
                                if (inputValue.length || this.lastInputValue) {
                                    break;
                                }
                                this.remove();
                            }
                            break;
                    }
                },

                /**
                 * 用户按下回车或者预设置的triggerKey，则触发token创建
                 *
                 * @param {Event} e 事件对象
                 */
                enter: function (e) {
                    var input = e.target;
                    var inputValue = input.getRawValue();
                    if (input.getFocusTarget() === document.activeElement && inputValue.length) {
                        createTokensFromInput.call(this);
                    }
                },

                /**
                 * 删除token，有两种情况：
                 * 1. 用户点击删除按钮
                 * 2. 用户在真实输入框按下backspace / delete键，且输入框中无字符
                 *
                 * @param {Event=} e 事件对象
                 */
                remove: function (e) {
                    var deleteIndex = -1;
                    var rawValue = this.rawValue.slice(0);

                    var target = e && e.currentTarget;
                    if (!target) {
                        // 通过回车删除, 则删除最后一个
                        deleteIndex = rawValue.length - 1;
                    }
                    else {
                        // 找到用户点击了哪个item上的删除按钮
                        var itemClass = this.helper.getPartClassName('item');
                        deleteIndex = $(this.main).find('.' + itemClass).index(target);
                    }

                    if (deleteIndex >= 0) {
                        var removedValue = rawValue.splice(deleteIndex, 1);
                        this.fire('removetoken', {token: removedValue[0]});
                        this.setProperties({rawValue: rawValue});
                    }
                },

                /**
                 * 将字符串类型的值转换成数组格式
                 *
                 * @param {string} value 字符串值
                 * @return {Array}
                 * @protected
                 */
                parseValue: function (value) {
                    if (u.isString(value)) {
                        return value.split(',');
                    }
                    return value || [];
                },

                /**
                 * 将值从原始格式转换成字符串
                 *
                 * @param {Array} rawValue 原始值
                 * @return {string}
                 * @protected
                 */
                stringifyValue: function (rawValue) {
                    if (u.isArray(rawValue)) {
                        return rawValue.join(',');
                    }
                    return '';
                },


                /**
                 * 重绘
                 *
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    painters.style('width'),
                    {
                        name: ['disabled', 'readOnly'],
                        paint: function (textbox, disabled, readOnly) {
                            var input = textbox.getInput();
                            input.setProperties(
                                {
                                    disabled: disabled,
                                    readOnly: readOnly
                                }
                            );
                        }
                    },
                    {
                        name: ['rawValue'],
                        paint: function (textbox, rawValue) {
                            renderTokens.call(textbox, rawValue);
                        }
                    }
                ),

                /**
                 * 清空所有token
                 */
                clearAllTokens: function () {
                    var itemClass = this.helper.getPartClassName('item');
                    $(this.main).find('.' + itemClass).remove();
                },

                /**
                 * 销毁
                 *
                 * @protected
                 * @override
                 */
                dispose: function () {
                    var controlHelper = this.helper;

                    controlHelper.removeDOMEvent(this.main, 'click', this.focusInput);
                    var itemClass = this.helper.getPartClassName('item');
                    controlHelper.removeDOMEvent(this.main, 'click', '.' + itemClass, this.remove);

                    var input = this.getInput();
                    input.un('focus', this.focus, this);
                    input.un('blur', this.blur, this);
                    input.un('enter', this.enter, this);

                    var inputElem = input.getFocusTarget();
                    controlHelper.removeDOMEvent(inputElem, 'keydown', this.keydown);
                    controlHelper.removeDOMEvent(inputElem, 'keyup', this.keyup);

                    this.$super(arguments);
                }
            }
        );

        /**
         * 检测token是否合法
         *
         * @param {Object} token 要检测的token
         * @return {boolean} 是否合法
         */
        function isTokenValid(token) {
            // token长度要大于最小长度限制
            if (!token || token.length <= this.minLength) {
                return false;
            }

            return true;
        }

        /**
         * 查找重复token
         *
         * @param {Object} token 要检测的token
         * @return {Object|null} 如果找到重复token，则返回，否则返回null
         */
        function findRepeatToken(token) {
            if (!this.allowRepeat) {
                var repeatIndex = u.indexOf(this.rawValue, token);
                if (repeatIndex > -1) {
                    var itemClass = this.helper.getPartClassName('item');
                    return {
                        index: repeatIndex,
                        element: $(this.main).find('.' + itemClass).get(repeatIndex),
                        token: this.rawValue[repeatIndex]
                    };
                }
            }
            return null;
        }

        /**
         * 闪动指定元素
         *
         * @param {Object} repeatToken 重复的token对象
         */
        function flashToken(repeatToken) {
            this.helper.addPartClasses('flash', repeatToken.element);

            var me = this;
            setTimeout(
                function () {
                    me.helper.removePartClasses('flash', repeatToken.element);
                },
                300
            );
        }

        /**
         * 创建token，添加到dom中
         *
         * @param {string|Object} token 要创建的token定义
         */
        function renderToken(token) {
            token = lib.trim(token);

            var event = this.fire('beforecreate', {token: token});
            if (event.preventDefault()) {
                return;
            }

            var $tokenElem = $('<div></div>');
            $tokenElem.addClass(this.helper.getPartClassName('item'));
            $tokenElem.html(
                this.helper.getPartHTML('label', 'span')
                + this.helper.getPartHTML('close', 'span')
            );

            // token标签值
            var $tokenLabel = $tokenElem.children(':first-child');
            $tokenLabel.html(token);
            // 关闭按钮
            var $closeButton = $tokenElem.children(':last-child');
            $closeButton.addClass(this.helper.getIconClass());

            var input = this.getInput();
            var inputElem = input.main;
            $tokenElem.insertBefore(inputElem);

            this.fire('aftercreate', {token: token});
        }

        /**
         * 对tokens进行预处理
         *
         * @param {Array=} rawValue 要设置的token数组
         */
        function renderTokens(rawValue) {
            if (u.isArray(this.rawValue)) {
                // 因为renderTokens是对rawValue进行全量渲染，所以这里要全部清空
                this.clearAllTokens();
                // 合法性校验
                this.rawValue = u.filter(this.rawValue, isTokenValid, this);

                // token数量要小于最大限制
                this.rawValue = u.filter(
                    this.rawValue,
                    function (item, index) {
                        return index < this.limit
                    },
                    this
                );

                // 重复检测，分为两个场景
                // 1. 根据初始rawValue值生成tokens，仅去重；
                // 2. 在用户输入值时，如果与已存在列表重复，需提示用户，
                //  派发事件等，则在用户输入时进行处理;
                // 因此，这里仅对this.rawValue进行重复过滤
                if (!this.allowRepeat) {
                    this.rawValue = u.uniq(this.rawValue);
                }
                // 根据rawValue值进行全量更新
                u.each(this.rawValue, renderToken, this);
            }
        }

        /**
         * 根据input输入创建tokens列表
         */
        function createTokensFromInput() {
            var beforeValue = this.getValue();

            var input = this.getInput();
            var inputValue = input.getRawValue();
            // 检测重复元素
            var repeatToken = findRepeatToken.call(this, inputValue);
            if (repeatToken) {
                flashToken.call(this, repeatToken);
                return;
            }
            // 这里要保证setProperties时rawValue前后值不同，这里复制一份
            if (!this.rawValue) {
                // 第一次没有设置的时候设置一个空值进来
                this.rawValue = [];
            }
            var rawValue = this.rawValue.slice(0);
            rawValue.push(inputValue);
            this.setProperties({rawValue: rawValue});

            if (beforeValue === this.getValue() && inputValue.length) {
                return;
            }
            // token创建成功，清空输入框
            input.setRawValue('');
        }

        esui.register(TokenField);
        return TokenField;
    }
);
