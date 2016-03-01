/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 输入控件自动提示扩展
 * @exports AutoComplete
 * @author maoquan(3610cn@gmail.com), liwei
 */
define(
    function (require) {
        var esui = require('esui');
        var lib = require('esui/lib');
        var u = require('underscore');
        var Layer = require('esui/Layer');
        var Extension = require('esui/Extension');
        var eoo = require('eoo');
        var CursorPositionHelper = require('./helper/CursorPositionHelper');
        var keyboard = require('esui/behavior/keyboard');
        require('esui/behavior/position');

        var TEXT_LINE = 'TextLine';
        var TEXT_BOX = 'TextBox';
        var INPUT = 'input';
        var $ = require('jquery');

        /**
         * @class AutoCompleteLayer
         * @exports esui.Layer
         */
        var AutoCompleteLayer = eoo.create(
            Layer,
            {

                /**
                 * 自动提示层构造器
                 *
                 * @param {Object} [control] TextBox控件
                 */
                constructor: function (control) {
                    this.$super(arguments);
                    // 对于input单行，要求layer宽度不大于input宽度
                    var controlType = control.type;
                    if (controlType === TEXT_BOX) {
                        var ele = lib.g(control.inputId);
                        if (ele.tagName.toLowerCase() === INPUT) {
                            this.dock = {
                                strictWidth: true
                            };
                        }
                    }
                    this.initStructure();
                    this.initEvents();
                },

                type: 'AutoCompleteLayer',

                initStructure: function () {
                    var helper = this.control.helper;

                    this.addCustomClasses(
                        [
                            helper.getPrefixClass('autocomplete'),
                            helper.getPrefixClass('dropdown')
                        ]
                    );

                    var element = this.getElement();
                    $(this.control.main).after(element);
                },

                initEvents: function () {
                    var me = this;
                    var target = me.control;
                    var helper = target.helper;

                    var inputElement = this.inputElement = this.getInput();

                    var layerElement = me.getElement(false);
                    helper.addDOMEvent(
                        layerElement,
                        'click',
                        'li',
                        function (e) {
                            var clickedTarget = e.currentTarget;
                            me.hide();

                            var firstChild = $(clickedTarget.firstChild);
                            var text = firstChild.text();
                            var id = firstChild.closest('li').data('id');

                            // 事件参数
                            var args = {value: text};
                            // 如果选择项存在id属性，则在事件参数中加上
                            if (id !== undefined) {
                                args.id = id;
                            }
                            // 为了与 `select` 事件区分，用了 `targetselect`
                            var selectEvent = me.control.fire('targetselect', args);
                            if (selectEvent.isDefaultPrevented()) {
                                return;
                            }

                            /**
                             * @deprecated
                             */
                            var deprecatedEvent = me.control.fire('select', text);
                            if (deprecatedEvent.isDefaultPrevented()) {
                                return;
                            }

                            setTargetValue.call(me, text);
                        }
                    );

                    helper.addDOMEvent(
                        inputElement,
                        'keydown',
                        function (e) {
                            if (me.isHidden()) {
                                return;
                            }

                            switch (e.keyCode) {
                                // up
                                case keyboard.UP:
                                    e.preventDefault();
                                    moveTo.call(me, 'up');
                                    break;
                                // down
                                case keyboard.DOWN:
                                    e.preventDefault();
                                    moveTo.call(me, 'down');
                                    break;
                                // esc
                                case keyboard.ESC:
                                    me.hide();
                                    break;
                                // enter
                                case keyboard.RETURN:
                                    e.preventDefault();
                                    var selectedItem = me.getSelectedItem();
                                    if (!selectedItem) {
                                        return;
                                    }
                                    me.hide();

                                    var firstChild = $(selectedItem.firstChild);
                                    var text = firstChild.text();
                                    var id = firstChild.closest('li').data('id');

                                    // 事件参数
                                    var args = {value: text};
                                    // 如果选择项存在id属性，则在事件参数中加上
                                    if (id !== undefined) {
                                        args.id = id;
                                    }
                                    // 为了与 `select` 事件区分，用了 `targetselect`
                                    var selectEvent = me.control.fire('targetselect', args);
                                    if (selectEvent.isDefaultPrevented()) {
                                        return;
                                    }

                                    /**
                                     * @deprecated
                                     */
                                    var deprecatedEvent = me.control.fire('select', text);
                                    if (deprecatedEvent.isDefaultPrevented()) {
                                        return;
                                    }

                                    setTimeout(
                                        function () {
                                            setTargetValue.call(me, text);
                                        },
                                        0
                                    );
                                    break;
                            }
                        }
                    );

                    this.control.on('input', onInput);

                    /**
                     * 用户输入时触发，根据输入下拉提示
                     *
                     * @param {Event} event 事件对象
                     */
                    function onInput(event) {
                        var elementValue = inputElement.value;

                        // 空格或逗号结尾都忽略
                        if (!elementValue || /(?:\s|\,)$/.test(elementValue)) {
                            repaintSuggest.call(me, '');
                            me.hide();
                            return;
                        }

                        if (u.isFunction(target.extractWord)) {
                            elementValue = target.extractWord(elementValue);
                        }
                        else {
                            elementValue = extractMatchingWord(elementValue);
                        }

                        if (!elementValue) {
                            return;
                        }

                        if (target.search && target.search(elementValue) === false) {
                            return;
                        }

                        repaintSuggest.call(me, elementValue);
                    }

                },

                repaint: function (value) {
                    var element = this.getElement(false);
                    if (element) {
                        this.render(element, value);
                    }
                },

                render: function (element, value) {
                    if (value != null) {
                        element.innerHTML = value;
                    }
                },

                getSelectedItemIndex: function () {
                    var element = this.getElement(false);
                    var items = element.children;
                    var selectedItemIndex = -1;
                    for (var i = 0, len = items.length; i < len; i++) {
                        if ($(items[i]).hasClass(
                            this.control.helper.getPrefixClass('autocomplete-item-hover')
                        )) {
                            selectedItemIndex = i;
                            break;
                        }
                    }
                    return selectedItemIndex;
                },

                getSelectedItem: function () {
                    var element = this.getElement(false);
                    var selectedItem;
                    var selectedItemIndex = this.getSelectedItemIndex();
                    if (selectedItemIndex !== -1) {
                        selectedItem = element.children[selectedItemIndex];
                    }
                    return selectedItem;
                },

                /**
                 * @override
                 * 对textarea自行实现position
                 */
                position: function () {
                    var input = this.inputElement;
                    if (input.nodeName.toLowerCase() !== 'textarea') {
                        this.$super(arguments);
                    }
                },

                show: function () {
                    this.$super(arguments);
                    var input = this.inputElement;
                    var $ele = $(this.getElement(false));
                    if (input.nodeName.toLowerCase() === 'textarea') {
                        var cursorInstance = CursorPositionHelper.getInstance(input);
                        var pos = cursorInstance.getCaretPosition();
                        $ele.position(
                            {
                                of: input,
                                at: 'left+' + pos.left + ' top+' + pos.top,
                                my: 'left top'
                            }
                        );
                    }
                },

                isHidden: function () {
                    var element = this.getElement();
                    return $(element).is(':hidden');
                },

                /**
                 * 获取内部输入元素
                 *
                 * @return {Element}
                 */
                getInput: function () {
                    var control = this.control;
                    if (control.type === TEXT_BOX) {
                        return lib.g(control.inputId);
                    }
                    else if (control.type === TEXT_LINE) {
                        return control.getTextArea();
                    }
                    return null;
                },

                nodeName: 'ol'
            }
        );

        /**
         * 匹配已输入值的算法
         *
         * @param {string} value 当前用户输入
         * @param {Array} datasource 数据源
         * @return {Array}
         */
        function filter(value, datasource) {
            return u.filter(
                datasource,
                function (data) {
                    var text = u.isObject(data) ? data.text : data;
                    return (new RegExp(escapeRegex(value), 'i')).test(text);
                }
            );
        }

        /**
         * 特殊字符处理，这些字符排除在匹配算法外
         *
         * @param {string} value 用户输入
         * @return {string}
         */
        function escapeRegex(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        }

        /**
         * 根据用户输入绘制下拉选择列表
         *
         * @param {sttring} value 用户输入
         */
        function repaintSuggest(value) {
            if (!value) {
                renderSuggest.call(this);
                return;
            }
            var me = this;
            var datasource = this.control.datasource;
            if (typeof datasource === 'function') {
                datasource.call(
                    this,
                    value,
                    function (data) {
                        renderSuggest.call(me, data, value);
                    }
                );
            }
            else if (datasource && datasource.length) {
                renderSuggest.call(me, filter(value, datasource), value);
            }
        }

        function renderSuggest(data, inputValue) {

            var helper = this.control.helper;

            /**
             * 将text中匹配到的搜索词高亮
             *
             * @param {string} word 要高亮的关键字
             * @return {string}
             */
            function highlightWord(word) {
                return '<i class="'
                    + helper.getPrefixClass('autocomplete-item-char-selected') + '">'
                    + word + '</i>';
            }

            var ret = [];
            if (data && data.length) {
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    var text = u.isObject(item) && item.text || item;
                    var desc = u.isObject(item) && item.desc || undefined;
                    var html = lib.format(
                        '<li tabindex="-1" ${dataId} class="${lineClasses}">'
                            + '<span class="${itemClasses}">${text}</span>${desc}</li>',
                        {
                            dataId: u.isObject(item) && item.id ? ' data-id="' + item.id + '"' : '',
                            lineClasses: helper.getPrefixClass('autocomplete-item')
                                + (i === 0 ? ' ' + helper.getPrefixClass('autocomplete-item-hover') : ''),
                            itemClasses: helper.getPrefixClass('autocomplete-item-text'),
                            text: text.replace(
                                new RegExp(escapeRegex(inputValue), 'i'),
                                highlightWord
                            ),
                            desc: desc ? '<span class="' + helper.getPrefixClass('autocomplete-item-desc')
                                + '">' + item.desc + '</span>' : ''
                        }
                    );
                    ret.push(html);
                }
            }
            ret = ret.join('');
            this.repaint(ret);
            ret ? this.show() : this.hide();
        }


        /**
         * 将用户选中值回填到input输入框
         *
         * @param {string} value 用户选择值
         */
        function setTargetValue(value) {
            var input = this.getInput();
            var targetValue = input.value;
            targetValue = lib.trim(targetValue);
            var items = [];
            if (/\n/.test(targetValue)) {
                items = targetValue.split(/\n/);
                targetValue = items && items.pop();
            }

            var words = targetValue.split(',');
            words.pop();
            words.push(value);

            if (items) {
                items.push(words.join(','));
                value = items.join('\n');
            }
            this.control.setValue(value);
        }

        function extractMatchingWord(value) {
            var lines = value.split(/\n/);
            var line = lines.pop();
            var words = line.split(',');
            var word = words && words.pop();
            return lib.trim(word);
        }

        /**
         * 下拉建议列表中上下选择
         *
         * @param {string} updown up / down
         */
        function moveTo(updown) {
            var element = this.getElement(false);
            var items = element.children;
            var selectedItemIndex = this.getSelectedItemIndex();

            if (selectedItemIndex !== -1) {
                var selectedItem = items[selectedItemIndex];
                if (selectedItem) {
                    lib.removeClass(
                        selectedItem,
                        this.control.helper.getPrefixClass('autocomplete-item-hover')
                    );
                }
            }


            if (updown === 'up') {
                if (selectedItemIndex === -1 || selectedItemIndex === 0) {
                    selectedItemIndex = items.length - 1;
                }
                else {
                    selectedItemIndex--;
                }
            }
            else if (updown === 'down') {
                if (selectedItemIndex === -1 || selectedItemIndex === items.length - 1) {
                    selectedItemIndex = 0;
                }
                else {
                    selectedItemIndex++;
                }
            }
            selectedItem = items[selectedItemIndex];
            $(selectedItem).addClass(this.control.helper.getPrefixClass('autocomplete-item-hover'));

            selectedItem && selectedItem.focus();
            this.inputElement.focus();
        }

        var AutoComplete = eoo.create(
            Extension,
            {

                /**
                 * 输入控件自动提示扩展
                 *
                 * 当输入控件加上此扩展后，其自动提示功能将由扩展自动提供
                 *
                 * @class extension.AutoComplete
                 * @extends Extension
                 * @constructor
                 */
                constructor: function () {
                    this.$super(arguments);
                },

                /**
                 * 指定扩展类型，始终为`"AutoComplete"`
                 *
                 * @type {string}
                 */
                type: 'AutoComplete',

                attachTo: function () {
                    this.$super(arguments);

                    var me = this;
                    setTimeout(function () {
                        me.layer = new AutoCompleteLayer(me.target);
                    }, 0);
                },

                /**
                 * 激活扩展
                 *
                 * @override
                 */
                activate: function () {
                    // 只对`TextBox` 和 `TextLine`控件生效
                    var type = this.target.type;

                    if (!(type === TEXT_LINE
                        || type  === TEXT_BOX)) {
                        return;
                    }
                    this.$super(arguments);
                },

                /**
                 * 取消扩展的激活状态
                 *
                 * @override
                 */
                inactivate: function () {
                    var helper = this.target.helper;
                    var inputEle = this.inputElement;

                    helper.removeDOMEvent(inputEle, INPUT);

                    var layerMain = this.layer.getElement(false);

                    if (layerMain) {
                        helper.removeDOMEvent(layerMain, 'click');
                        layerMain.remove();
                    }
                    helper.removeDOMEvent(inputEle, 'keydown');
                    this.$super(arguments);
                }
            }
        );

        esui.registerExtension(AutoComplete);
        return AutoComplete;
    }
);
