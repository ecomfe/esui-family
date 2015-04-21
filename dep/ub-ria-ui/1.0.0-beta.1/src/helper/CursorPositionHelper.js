/**
 * @file获取光标像素坐标
 * @author liwei@baidu.com
 */

define(function (require) {
    var _style = {};
    var lib = require('esui/lib');

    var helper = {
        /**
         * 获取输入光标在页面中的坐标
         * @param   {HTMLElement}   [elem] 输入框元素
         * @return  {Object}   返回left和top,bottom
         */
        getInputPositon: function (elem) {
            var ret;
            // IE Support
            if (document.selection) {
                elem.focus();
                var Sel = document.selection.createRange();
                var doc = elem.ownerDocument;
                var body = doc.body;
                var docElem = doc.documentElement;
                var clientTop = docElem.clientTop || body.clientTop || 0;
                var top = Sel.boundingTop + (self.pageYOffset || docElem.scrollTop) - clientTop;
                
                ret = {
                    left: Sel.boundingLeft,
                    top: top - 80,
                    bottom: Sel.boundingTop + Sel.boundingHeight
                };
            }
            else {
                var cloneDiv = '{$clone_div}';
                var cloneLeft = '{$cloneLeft}';
                var cloneFocus = '{$cloneFocus}';
                var none = '<span style="white-space:pre-wrap;"> </span>';
                var div = elem[cloneDiv] || document.createElement('div');
                var focus = elem[cloneFocus] || document.createElement('span');
                var text = elem[cloneLeft] || document.createElement('span');
                var offset = _offset(elem);
                var index = _getFocus(elem);
                var focusOffset = {
                    left: 0,
                    top: 0
                };

                if (!elem[cloneDiv]) {
                    elem[cloneDiv] = div, elem[cloneFocus] = focus;
                    elem[cloneLeft] = text;
                    div.appendChild(text);
                    div.appendChild(focus);
                    document.body.appendChild(div);
                    focus.innerHTML = '|';
                    focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;';
                    div.className = _cloneStyle(elem);
                    div.style.cssText = 'visibility:hidden;display:inline-block;'
                        + 'position:absolute;z-index:-100;overflow:hidden;';
                }
                div.style.left = offset.left + 'px';
                div.style.top = offset.top + 'px';
                var strTmp = elem.value.substring(0, index).replace(/</g, '<')
                    .replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
                text.innerHTML = strTmp;

                focus.style.display = 'inline-block';
                try {
                    focusOffset = _offset(focus);
                }
                catch (e) {}
                focus.style.display = 'none';
                ret = {
                    left: focusOffset.left,
                    top: focusOffset.top,
                    bottom: focusOffset.bottom
                };
            }

            return ret;
        }
    };

    // 克隆元素样式并返回类
    function _cloneStyle(elem, cache) {
        if (!cache && elem['${cloneName}']) {
            return elem['${cloneName}'];
        }
        var className;
        var name;
        var rstyle = /^(number|string)$/;
        // Opera: content; IE8:outline && outlineWidth
        var rname = /^(content|outline|outlineWidth)$/;
        var cssText = [];
        var sStyle = elem.style;
        var val;

        for (name in sStyle) {
            if (!rname.test(name)) {
                val = lib.getComputedStyle(elem, name);
                // Firefox 4
                if (val !== '' && rstyle.test(typeof val)) {
                    name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
                    cssText.push(name);
                    cssText.push(':');
                    cssText.push(val);
                    cssText.push(';');
                }
            }
        }
        cssText = cssText.join('');
        elem['${cloneName}'] = className = 'clone' + (new Date()).getTime();
        _addHeadStyle('.' + className + '{' + cssText + '}');
        return className;
    }

    // 向页头插入样式
    function _addHeadStyle(content) {
        var style = _style[document];
        if (!style) {
            style = _style[document] = document.createElement('style');
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        style.styleSheet && (style.styleSheet.cssText += content)
            || style.appendChild(document.createTextNode(content));
    }

    // 获取光标在文本框的位置
    function _getFocus(elem) {
        var index = 0;
        // IE Support
        if (document.selection) {
            elem.focus();
            var Sel = document.selection.createRange();
            // textarea
            if (elem.nodeName === 'TEXTAREA') {
                var Sel2 = Sel.duplicate();
                Sel2.moveToElementText(elem);
                index = -1;
                while (Sel2.inRange(Sel)) {
                    Sel2.moveStart('character');
                    index++;
                }
            }
            // input
            else if (elem.nodeName === 'INPUT') {
                Sel.moveStart('character', -elem.value.length);
                index = Sel.text.length;
            }
        }
        // Firefox support
        else if (elem.selectionStart || +elem.selectionStart === 0) {
            index = elem.selectionStart;
        }
        return (index);
    }

    // 获取元素在页面中位置
    function _offset(elem) {
        var box = elem.getBoundingClientRect();
        var doc = elem.ownerDocument;
        var body = doc.body;
        var docElem = doc.documentElement;
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop;
        var left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
        return {
            left: left,
            top: top,
            right: left + box.width,
            bottom: top + box.height
        };
    }

    return helper;
});
