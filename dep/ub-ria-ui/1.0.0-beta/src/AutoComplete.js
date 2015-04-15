/**
 * 输入控件自动提示扩展
 * @file: AutoComplete.js
 * @author: liwei
 *
 */

define(function (require) {

    var lib = require('esui/lib');
    var u = require('underscore');
    var Layer = require('esui/Layer');
    var Extension = require('esui/Extension');
    var eoo = require('eoo');
    var cursorHelper = require('./helper/CursorPositionHelper');

    var TEXT_LINE = 'TextLine';
    var TEXT_BOX = 'TextBox';
    var INPUT = 'input';
    var TEXT = 'text';

    function filter(value, datasource) {
        return u.filter(datasource, function (data) {
            var text = u.isObject(data) ? data.text : data;
            return (new RegExp(escapeRegex(value), 'i')).test(text);
            // return caseSensitive ? text.indexOf(value) === 0;
        });
    }

    function escapeRegex(value) {
        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }

    function preProcessResponseData(data) {
        return data;
    }

    function repaintSuggest(value) {
        if (!value) {
            renderSuggest.call(this);
            return;
        }
        var me = this;
        if (typeof this.target.datasource === 'function') {
            this.target.datasource.call(this, value, function (data) {
                data = (me.target.preProcessResponseData || preProcessResponseData)(data) || data;
                // renderSuggest.call(me, filter(value, data, me.casesensitive), value);
                renderSuggest.call(me, data, value);
            });
        }
        else if (this.target.datasource && this.target.datasource.length) {
            renderSuggest.call(me, filter(value, this.target.datasource), value);
        }
    }

    function renderSuggest(data, inputValue) {
        var me = this;
        var ret = '';
        if (data && data.length) {
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];
                ret += '<li tabindex="-1"'
                    + (u.isObject(item) && item.id ? ' data-id="' + item.id + '"' : '')
                    + ' class="'
                    + this.target.helper.getPrefixClass('autocomplete-item')
                    + (i === 0 ? ' ' + this.target.helper.getPrefixClass('autocomplete-item-hover') : '')
                    + ' "><span class="'
                    + this.target.helper.getPrefixClass('autocomplete-item-text')
                    + '">'
                    + (u.isObject(item) ? item.text : item).replace(new RegExp(escapeRegex(inputValue), 'i'), function (m, n, o) {
                        return '<i class="'
                            + me.target.helper.getPrefixClass('autocomplete-item-char-selected') + '">'
                            + m + '</i>';
                    }) + '</span>'
                    + (u.isObject(item) ? '<span class="' + this.target.helper.getPrefixClass('autocomplete-item-desc')
                    + '">' + item.desc + '</span>' : '')
                    + '</li>';
            }
        }
        this.layer.repaint(ret);
        ret ? showSuggest.call(this) : hideSuggest.call(this);
    }

    var obj = {};

    function initMain() {
        var element = this.getElement();
        lib.addClass(element, this.control.helper.getPrefixClass('dropdown'));

        this.addCustomClasses([this.control.helper.getPrefixClass('autocomplete')]);
        this.control.main.appendChild(element);
    }

    function initEvents() {
        var me = this;
        var layerElement = me.layer.getElement(false);
        var target = me.target;
        var helper = target.helper;
        var inputElement;

        this.inputElement =
            helper.getPart(target.type === TEXT_LINE ? TEXT : INPUT);
        inputElement = this.inputElement;

        helper.addDOMEvent(layerElement, 'click', obj.selectItem = function (e) {
            var clickedTarget = e.target;
            if (clickedTarget.nodeName === 'I') {
                clickedTarget = clickedTarget.parentNode;
            }
            clickedTarget = clickedTarget.parentNode.firstChild;
            hideSuggest.call(me);
            var text = lib.getText(clickedTarget);
            if (target.select && target.select(text, target) === false) {
                return;
            }
            setTargetValue.call(me, text);
        });

        helper.addDOMEvent(inputElement, 'keydown', obj.keyboard = function (e) {
            if (me.layer.isHidden()) {
                return;
            }

            switch (e.keyCode) {
                // up
                case 38:
                    e.preventDefault();
                    moveTo.call(me, 'up');
                    break;
                // down
                case 40:
                    e.preventDefault();
                    moveTo.call(me, 'down');
                    break;
                // esc
                case 27:
                    hideSuggest.call(me);
                    break;
                // enter
                case 13:
                    e.preventDefault();
                    var selectedItem = getSelectedItem.call(me);
                    if (!selectedItem) {
                        return;
                    }
                    hideSuggest.call(me);
                    var text = lib.getText(selectedItem.firstChild);
                    if (target.select
                        && target.select(text, target) === false) {
                        return;
                    }
                    setTargetValue.call(me, text);
                    break;
            }
        });

        var inputEventName = ('oninput' in inputElement)
            ? 'input'
            : 'propertychange';
        helper.addDOMEvent(inputElement, inputEventName, obj.oninput = function (e) {
            var elementValue = inputElement.value;

            // 空格或逗号结尾都忽略
            if (!elementValue || /(?:\s|\,)$/.test(elementValue)) {
                repaintSuggest.call(me, '');
                hideSuggest.call(me);
                return;
            }

            elementValue = (target.extractWord || extractMatchingWord)(elementValue);

            if (!elementValue) {
                return;
            }

            if (target.search && target.search(elementValue) === false) {
                return;
            }

            repaintSuggest.call(me, elementValue);
        });
    }

    function setTargetValue(value) {
        var controlType = this.target.type === TEXT_LINE ? TEXT : INPUT;
        // this.target.getValue() 做了去重的事，这里不需要去重后的结果
        var targetValue = this.target.helper.getPart(controlType).value;
        targetValue = lib.trim(targetValue);
        var arr = [];
        if (/\n/.test(targetValue)) {
            var arr = targetValue.split(/\n/);
            targetValue = arr && arr.pop();
        }

        var words = targetValue.split(',');
        var word = words.pop();
        words.push(value);

        if (arr) {
            arr.push(words.join(','));
            value = arr.join('\n');
        }
        this.target.setValue(value);
        hideSuggest.call(this);
    }

    function extractMatchingWord(value) {
        var lines = value.split(/\n/);
        var line = lines.pop();
        var words = line.split(',');
        var word = words && words.pop();
        return lib.trim(word);
    }

    function removemain() {
        this.target.main.removeChild(this.layer.getElement(false));
    }

    function showSuggest() {
        this.layer.show();
        var input = this.inputElement;
        var style = this.layer.getElement(false).style;
        var offset = lib.getOffset(this.target.main);
        if (input.nodeName.toLowerCase() === 'textarea') {
            // TODO: 这里计算光标的像素坐标还是没有非常精确
            var pos = cursorHelper.getInputPositon(input);
            var scrollTop = input.scrollTop;
            var scrollLeft = input.scrollLeft;
            style.left = pos.left - offset.left - scrollLeft + 'px';
            style.top = pos.top - offset.top - scrollTop + parseInt(lib.getStyle(input, 'fontSize'), 10) + 'px';
        }
        else {
            style.left = 0;
            style.top = offset.height + 'px';
        }
    }

    function hideSuggest() {
        this.layer.hide();
    }

    // 'down': down  'up': up
    function moveTo(updown) {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = getSelectedItemIndex.call(this);

        if (selectedItemIndex !== -1) {
            var selectedItem = items[selectedItemIndex];
            selectedItem && lib.removeClass(selectedItem, this.target.helper.getPrefixClass('autocomplete-item-hover'));
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
        selectedItem && lib.addClass(selectedItem, this.target.helper.getPrefixClass('autocomplete-item-hover'));
        
        selectedItem && selectedItem.focus();
        this.inputElement.focus();
    }

    function getSelectedItemIndex() {
        var element = this.layer.getElement(false);
        var items = element.children;
        var selectedItemIndex = -1;
        for (var i = 0, len = items.length; i < len; i++) {
            if (lib.hasClass(items[i], this.target.helper.getPrefixClass('autocomplete-item-hover'))) {
                selectedItemIndex = i;
                break;
            }
        }
        return selectedItemIndex;
    }

    function getSelectedItem() {
        var element = this.layer.getElement(false);
        var selectedItem;
        var selectedItemIndex = getSelectedItemIndex.call(this);
        if (selectedItemIndex !== -1) {
            selectedItem = element.children[selectedItemIndex];
        }
        return selectedItem;
    }

    var layerExports = {};
    /**
     * 自动提示层构造器
     * @param {Object} [control] TextBox控件
     */
    layerExports.constructor = function (control) {
        this.$super(arguments);
        var helper = control.helper;
        var controlType = control.type === TEXT_LINE ? TEXT : INPUT;
        var ele = helper.getPart(controlType);
        if (ele.tagName.toLowerCase() === INPUT) {
            this.dock = {
                strictWidth: true
            };
        }
        this.initStructure();
    };

    layerExports.type = 'AutoCompleteLayer';

    layerExports.initStructure = function () {
        initMain.call(this);
    };

    layerExports.repaint = function (value) {
        var element = this.getElement(false);
        if (element) {
            this.render(element, value);
        }
    };

    layerExports.render = function (element, value) {
        if (value != null) {
            element.innerHTML = value;
        }
    };

    layerExports.isHidden = function () {
        var element = this.getElement();
        var ret;
        if (!element || this.control.helper.isPart(element, 'layer-hidden')) {
            ret = true;
        }
        else {
            ret = false;
        }
        return ret;
    };

    layerExports.nodeName = 'ol';

    var AutoCompleteLayer = eoo.create(Layer, layerExports);

    var exports = {};

    /**
     * 输入控件自动提示扩展
     *
     * 当输入控件加上此扩展后，其自动提示功能将由扩展自动提供
     *
     * @class extension.AutoComplete
     * @extends Extension
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
        this.initOptions();
    };

    exports.initOptions = function () {

    };

    /**
     * 指定扩展类型，始终为`"AutoComplete"`
     *
     * @type {string}
     */
    exports.type = 'AutoComplete';

    exports.attachTo = function () {
        this.$super(arguments);

        var me = this;
        setTimeout(function () {
            me.layer = new AutoCompleteLayer(me.target);
            initEvents.call(me);
        }, 0);
    };

    /**
     * 激活扩展
     *
     * @override
     */
    exports.activate = function () {
        // 只对`TextBox` 和 `TextLine`控件生效
        var type = this.target.type;

        if (!(type === TEXT_LINE
            || type  === TEXT_BOX)) {
            return;
        }
        this.$super(arguments);
    };

    /**
     * 取消扩展的激活状态
     *
     * @override
     */
    exports.inactivate = function () {
        var helper = this.target.helper;
        var inputEle = this.inputElement;

        helper.removeDOMEvent(inputEle, INPUT, obj.oninput);

        var layerMain = this.layer.getElement(false);
        helper.removeDOMEvent(inputEle, 'keydown', obj.keyboard);
        helper.removeDOMEvent(layerMain, 'click', obj.selectItem);
        removemain.call(this);

        this.$super(arguments);
    };

    var AutoComplete = eoo.create(Extension, exports);
    require('esui/main').registerExtension(AutoComplete);
    return AutoComplete;
});
