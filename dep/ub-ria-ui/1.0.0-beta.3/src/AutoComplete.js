/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 输入控件自动提示扩展
 * @exports AutoComplete
 * @author maoquan(3610cn@gmail.com), liwei, weifeng(weifeng@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui');
        var lib = require('esui/lib');
        var u = require('underscore');
        var Layer = require('esui/Layer');
        var Extension = require('esui/Extension');
        var eoo = require('eoo');
        var textCursorHelper= require('./helper/TextCursorHelper');
        var keyboard = require('esui/behavior/keyboard');
        require('esui/behavior/jquery-ui');

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
                        // 保留光标位置，待会儿插入时需要知道在哪儿插入
                        me.caretPos = textCursorHelper.getCaretPosition(inputElement);

                        // 获取光标前的字符
                        var val = textCursorHelper.getTextBeforeCaret(inputElement);

                        // 进入数据面板触发逻辑
                        repaintHelperSlector.call(me, val);

                        this.fire('change', {args: val});
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
                        var pos = textCursorHelper.getCaretPositionStyle(input);
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

                /**
                 * 获取查询词，也即 at 符号后边的词
                 *
                 * @param  {string} val 截取字符
                 * @return {string} 查询词
                 */
                getQuery: function (val) {
                    var lastAtIndex = val.lastIndexOf(this.control.openAt);
                    return val.slice(lastAtIndex + 1);
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
         * @param {string} value 用户输入
         */
        function repaintHelperSlector(value) {
            // 判断是否需要弹出帮助面板
            if (canShowSelector.call(this, value)) {

                // 获取搜索词
                this.query = this.getQuery(value);

                var me = this;
                var datasource = this.control.datasource;
                if (typeof datasource === 'function') {
                    datasource.call(
                        this,
                        value,
                        function (data) {
                            renderSlector.call(me, data, value);
                        }
                    );
                }
                else if (datasource && datasource.length) {
                    // 根据搜索词，获取过滤后的优选词数据列表
                    var list = filter(this.query, datasource);

                    // 渲染帮助面板
                    renderSlector.call(me, list, value);
                }
            }
            else {
                this.hide();
            }
        }

        /**
         * 绘制下拉选择列表
         *
         * @param {Array} data 需要渲染的数据源
         * @param {string} inputValue 需要检索的字符串
         */
        function renderSlector(data, inputValue) {
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
            var closeTag = this.control.closeAt ? this.control.closeAt : '';
            // 执行插入操作,先删除查询词然后插入提示词
            textCursorHelper.del(input, -this.query.length, this.caretPos);
            textCursorHelper.add(input, value + closeTag, this.caretPos - this.query.length);
        }

        function extractMatchingWord(value) {
            var lines = value.split(/\n/);
            var line = lines.pop();
            var words = line.split(',');
            var word = words && words.pop();
            return lib.trim(word);
        }

        /**
         * 检测是否需要显示数据面板，检测逻辑如下：
         *
         * 一：局部替换，开闭符号都包含
         * - 包含触发符号 `{`
         * - 最后一个触发符号 `{` 需要出现在最后一个触发结束符号 `}` 后边
         *
         * 二：全部替换，只有开合(openAt)没有闭合(closeAt)
         * - 这时候会在开始输入的时候就给提示并进行替换
         *
         * @param {string} val 光标前的数据
         * @return {boolean} 需要显示返回 true，否则返回 false
         */
        function canShowSelector (val) {
            var openIndex = -1;
            var closeIndex = -1;
            var openTag = this.control.openAt;
            var closeTag = this.control.closeAt;

            if (openTag) {
                openIndex = val.lastIndexOf(openTag);
            }
            if (closeTag) {
                closeIndex = val.lastIndexOf(closeTag);
            }

            if (openIndex >= 0 && openIndex > closeIndex) {
                return true;
            }
            else if (openTag && !closeTag) {
                return true;
            }

            return false;
        };

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
                        $(layerMain).remove();
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
