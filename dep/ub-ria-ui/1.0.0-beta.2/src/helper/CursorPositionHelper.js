/**
 * @file获取光标像素坐标
 * @author liwei@baidu.com
 */

define(function (require) {
    var $ = require('jquery');
    var u = require('underscore');
    var eoo = require('eoo');

    var sentinelChar = '吶';

    var DIV_PROPERTIES = {
        left: -9999,
        position: 'absolute',
        top: 0,
        whiteSpace: 'pre-wrap'
    };

    var COPY_PROPERTIES = [
        'border-width', 'font-family', 'font-size', 'font-style', 'font-variant',
        'font-weight', 'height', 'letter-spacing', 'word-spacing', 'line-height',
        'text-decoration', 'text-align', 'width', 'padding-top', 'padding-right',
        'padding-bottom', 'padding-left', 'margin-top', 'margin-right',
        'margin-bottom', 'margin-left', 'border-style', 'box-sizing', 'tab-size'
    ];

    function getStyles(element) {
        var styles = {};
        $.each(
            COPY_PROPERTIES,
            function (index, property) {
                styles[property] = $(element).css(property);
            }
        );
        return styles;
    }

    function copyCss() {
        var element = this.element;
        var overflow = element.scrollHeight > element.offsetHeight ? 'scroll' : 'auto';
        return u.extend(
            {
                overflow: overflow
            },
            DIV_PROPERTIES,
            getStyles(this.element)
        );
    }

    function getTextFromHeadToCaret() {
        return this.element.value.substring(0, this.element.selectionEnd);
    }

    function getTextFromHeadToCaretIE() {
        this.element.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -this.element.value.length);
        var arr = range.text.split(sentinelChar);
        return arr.length === 1 ? arr[0] : arr[1];
    }

    var TextAreaPositionHelper = eoo.create(
        {
            constructor: function (ele) {
                this.$element = $(ele);
                this.element = this.$element[0];
            },

            getCaretPosition: function () {
                var notIE = typeof this.element.selectionEnd === 'number';
                var getHeadText
                    = notIE ? getTextFromHeadToCaret : getTextFromHeadToCaretIE;

                // 通过创建一个隐藏容器，将input value复制到div中，
                // 以此推算光标位置
                var $dummyDiv = $('<div></div>')
                    .css(copyCss.call(this))
                    .text(getHeadText.call(this));
                var $span = $('<span></span>').text('.').appendTo($dummyDiv);
                this.$element.before($dummyDiv);
                var position = $span.position();
                position.top += $span.height() - this.$element.scrollTop();
                position.lineHeight = $span.height();
                $dummyDiv.remove();
                return position;
            }
        }
    );

    /**
     * 获取一个和element相关的实例
     * @param {Element} element 要计算的元素
     * @return {Object} 返回实例
     */
    TextAreaPositionHelper.getInstance = function (element) {
        var cursorHelper = 'corsorPositionHelper';
        var instance = $(element).data(cursorHelper);

        if (!instance) {
            instance = new TextAreaPositionHelper(element);
            $(element).data(cursorHelper, instance);
        }
        return instance;
    };

    return TextAreaPositionHelper;
});
