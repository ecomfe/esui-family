/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file TokenField, 典型场景为收件人输入框
 * @author maoquan
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
         * @extends InputControl
         * @constructor
         */
        var TokenField = eoo.create(
            InputControl,
            {

                constructor: function () {
                    this.$super(arguments);
                    this.data = {};
                },

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
                         * 输入input宽度
                         *
                         * @type {number}
                        */
                        inputWidth: 90, // 输入框最小宽度,剩余宽度不够就换行了
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
                         * 分隔符
                         *
                         * @type {string}
                        */
                        delimiter: ',',
                        /**
                         * TokenField的值
                         *
                         * @type {string}
                        */
                        tokens: '',
                        /**
                         * 是否允许重复
                         *
                         * @type {bool}
                        */
                        repeat: false
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
                        '<input type="text" name="${inputName}" autocomplete="off"',
                        ' class="${inputClasses}"',
                        ' data-ui-type="TextBox"',
                        ' data-ui-width="${width}"',
                        ' data-ui-id="${inputId}" />'
                    ].join('');

                    this.main.innerHTML = lib.format(
                        html,
                        {
                            inputName: this.name,
                            inputId: this.helper.getId('input'),
                            inputClasses: this.helper.getPartClasses('input'),
                            width: this.inputWidth
                        }
                    );
                    // 创建控件树
                    this.initChildren(this.main);
                    // 创建初始token
                    this.setTokens(this.tokens, false);
                },

                /**
                 * 初始化事件交互
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    var controlHelper = this.helper;
                    controlHelper.addDOMEvent(
                        this.main,
                        'click',
                        this.focusInput
                    );
                    var itemClass = this.helper.getPartClassName('item');
                    controlHelper.addDOMEvent(
                        this.main,
                        'click',
                        '.' + itemClass,
                        this.remove
                    );
                    var input = this.getInput();
                    var inputElem = input.getFocusTarget();

                    input.on('focus', u.bind(this.focus, this));
                    input.on('blur', u.bind(this.blur, this));
                    input.on('enter', u.bind(this.enter, this));

                    // TODO: TextBox不提供keydown / keyup事件
                    controlHelper.addDOMEvent(inputElem, 'keydown', this.keydown);
                    controlHelper.addDOMEvent(inputElem, 'keyup', this.keyup);
                },

                /**
                 * 获取真实输入框控件
                 * @return {TextBox}
                 */
                getInput: function () {
                    var inputId = this.helper.getId('input');
                    return this.viewContext.get(inputId);
                },

                /**
                 * 创建token，添加到dom中
                 * @param {string|Object} token 要创建的token定义
                 */
                createToken: function (token) {
                    if (typeof token === 'string') {
                        token = {value: token, label: token};
                    }
                    else {
                        // 复制一份，避免污染原数据
                        token = u.extend({}, token);
                    }

                    token.value = lib.trim(token.value);
                    token.label = lib.trim(token.label) || token.value;

                    // token长度要大于最小长度限制
                    if (!token.value || !token.label || token.label.length <= this.minLength) {
                        return;
                    }

                    // token数量要小于最大限制
                    if (this.limit && this.getTokens().length >= this.limit) {
                        return;
                    }

                    this.fire('beforecreate', {token: token});

                    var $tokenElem = $('<div></div>');
                    $tokenElem.addClass(this.helper.getPartClassName('item'));
                    $tokenElem.html(
                        this.helper.getPartHTML('label', 'span')
                        + this.helper.getPartHTML('close', 'span')
                    );
                    var guid = lib.getGUID();
                    $tokenElem.attr('data-id', guid);
                    this.data[guid] = token;

                    var input = this.getInput();
                    var inputElem = input.main;

                    var $tokenLabel = $tokenElem.children(':first-child');
                    $tokenLabel.html(token.label);
                    var $closeButton = $tokenElem.children(':last-child');
                    $closeButton.addClass(this.helper.getIconClass());

                    $tokenElem.insertBefore(inputElem);

                    this.fire(
                        'aftercreate',
                        {
                            token: token
                        }
                    );
                },

                /**
                 * 输入框focus
                 * @param {Event} e 事件对象
                 */
                focusInput: function (e) {
                    var input = this.getInput();
                    input.getFocusTarget().focus();
                },

                /**
                 * 响应focus, 输入框获取焦点时，控件整体相应的focus
                 * @param {Event} e 事件对象
                 */
                focus: function (e) {
                    this.focused = true;
                    this.helper.addStateClasses('focus');
                },

                /**
                 * 响应blur
                 * @param {Event} e 事件对象
                 */
                blur: function (e) {
                    this.focused = false;
                    this.helper.removeStateClasses('focus');
                },

                /**
                 * 响应keydown,keydown较keyup早触发，keydown时可记录输入框变化前的值
                 * @param {Event} e 事件对象
                 */
                keydown: function (e) {
                    var input = this.getInput();
                    switch (e.keyCode) {
                        case 8: // backspace
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
                 * @param {Event} e 事件对象
                 */
                keyup: function (e) {
                    if (!this.focused) {
                        return;
                    }
                    var input = this.getInput();
                    var inputValue = input.getRawValue();
                    switch (e.keyCode) {
                        case 8: // backspace
                        case 46: // delete
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
                 * @param {Event=} e 事件对象
                 */
                remove: function (e) {
                    var me = this;
                    var target = e && e.currentTarget;
                    if (!target) {
                        target = $(me.getInput().main).prev();
                    }

                    var $t = $(target);
                    if ($t.size() > 0) {
                        var dataId = $(target).attr('data-id');
                        $t.remove();
                        delete me.data[dataId];
                    }
                },

                /**
                 * 对tokens进行预处理
                 * @param {string|Array} tokens 要添加的Token
                 * @param {boolean} isAdd 是否增量，如果为false，则清空已添加token列表
                 */
                setTokens: function (tokens, isAdd) {
                    if (!tokens) {
                        return;
                    }

                    var itemClass = this.helper.getPartClassName('item');
                    var me = this;
                    if (!isAdd) {
                        $(this.main).children().each(
                            function (idx, tokenElem) {
                                var $ele = $(tokenElem);
                                if ($ele.hasClass(itemClass)) {
                                    // 先删除关联数据
                                    var dataId = $ele.attr('data-id');
                                    delete me.data[dataId];
                                    $ele.remove();
                                }
                            }
                        );
                    }

                    if (typeof tokens === 'string') {
                        tokens = tokens.split(this.delimiter);
                    }

                    u.each(
                        tokens,
                        function (token) {
                            me.createToken(token);
                        }
                    );
                },

                /**
                 * 获取已创建的token列表
                 * @return {Array}
                 */
                getTokens: function () {
                    var tokens = [];
                    var me = this;
                    $(this.main).children().each(
                        function (idx, tokenElem) {
                            var $ele = $(tokenElem);
                            var dataId = $ele.attr('data-id');
                            if (dataId) {
                                var token = me.data[dataId];
                                if (token) {
                                    tokens.push(token);
                                }
                            }
                        }
                    );
                    return tokens;
                },

                /**
                 * 获取控件表单值
                 * @return {string} 组件的值
                 */
                getRawValue: function () {
                    var separator = this.delimiter;
                    return u.map(
                        this.getTokens(),
                        function (token) {
                            return token.value;
                        }
                    ).join(separator);
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
                    }
                )
            }
        );

        function flashToken(tokenElem) {
            var me = this;
            setTimeout(function () {
                me.helper.addPartClasses('flash', tokenElem);
            }, 0);

            setTimeout(function () {
                me.helper.removePartClasses('flash', tokenElem);
            }, 300);
        }

        function checkRepeatToken(tokenValue) {
            var repeatToken = {};
            u.each(this.data, function (token, dataId) {
                if (token.value === tokenValue) {
                    repeatToken.dataId = dataId;
                    repeatToken.token = token;
                    return false;
                }
            });

            if (repeatToken.dataId) {
                repeatToken.tokenElement = $(this.main).find('div[data-id=' + repeatToken.dataId + ']')[0];
            }
            return repeatToken;
        }

        function createTokensFromInput() {
            var input = this.getInput();
            var inputValue = input.getRawValue();
            if (inputValue.length < this.minLength) {
                return;
            }

            if (!this.repeat) {
                var repeatToken = checkRepeatToken.call(this, inputValue);
                if (repeatToken.token) {
                    flashToken.call(this, repeatToken.tokenElement);
                    u.isFunction(this.repeatCallback) && this.repeatCallback(repeatToken);
                    return;
                }
            }

            var before = this.getRawValue();
            this.setTokens(inputValue, true);
            if (before === this.getRawValue() && inputValue.length) {
                return;
            }
            // token创建成功，清空输入框
            input.setRawValue('');
        }

        esui.register(TokenField);
        return TokenField;
    }
);
