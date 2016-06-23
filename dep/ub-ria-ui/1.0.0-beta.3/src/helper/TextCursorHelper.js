/**
 * UB-RIA-UI
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 文本框焦点辅助函数
 * @author weifeng(weifeng@baidu.com),liwei
 *
 */
define(
    function (require) {

        var TextCursorHelper = {};

        var $ = require('jquery');
        var u = require('underscore');

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

        /**
         * 复制css属性
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {Object} 元素的css属性
         */
        function copyCss(t) {
            var overflow = t.scrollHeight > t.offsetHeight ? 'scroll' : 'auto';
            return u.extend(
                {
                    overflow: overflow
                },
                DIV_PROPERTIES,
                getStyles(t)
            );
        }

        /**
         * 获取文件样式
         *
         * @param  {HTMLTextAreaElement} element 文本框
         * @return {Object} 元素的css属性
         */
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

        /**
         * 获取文本框t当前光标所在位置
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {jQuery object} 光标所在位置
         */
        TextCursorHelper.getCaretPositionStyle = function (t) {
            // 通过创建一个隐藏容器，将input value复制到div中，
            // 以此推算光标位置
            var $dummyDiv = $('<div></div>')
                .css(copyCss(t))
                .text(this.getTextBeforeCaret(t));
            var $span = $('<span></span>').text('.').appendTo($dummyDiv);
            var $element = $(t);
            $element.before($dummyDiv);
            var position = $span.position();
            position.top += $span.height() - $element.scrollTop();
            position.lineHeight = $span.height();
            $dummyDiv.remove();
            return position;
        };

        /**
         * 获取文本框t当前光标所在位置
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {number} 光标所在位置
         */
        TextCursorHelper.getCaretPosition = function (t) {
            var value;
            var len;
            var textInputRange;
            var endRange;
            var pos = 0;

            if (document.selection) {
                // IE
                var ds = document.selection;
                var range = ds.createRange();

                if (range && range.parentElement() === t) {
                    value = t.value.replace(/\r\n/g, '\n');
                    len = value.length;

                    textInputRange = t.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    endRange = t.createTextRange();
                    endRange.collapse(false);

                    if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                        pos = len;
                    }
                    else {
                        pos = -textInputRange.moveStart('character', -len);
                    }
                }

                return pos;
            }

            // chrome
            return t.selectionStart;
        };

        /**
         * 在文本框t中，设置光标的位置为p
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number} p 光标位置
         */
        TextCursorHelper.setCaretPosition = function (t, p) {
            select(t, p, p);
        };

        /**
         * 获取光标前的字符串
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @return {string} 光标前的字符串
         */
        TextCursorHelper.getTextBeforeCaret = function (t) {
            var value = t.value;
            var str = value;
            var caretPos = this.getCaretPosition(t);
            str = value.slice(0, caretPos);

            if (document.selection) {
                // IE的文本框换行有两个字符
                str = str.replace(/\r\n/g, '\n');
            }

            // 需要对空格、'<'等符号进行编码
            str = u.escape(str);
            str = str.replace(/\n/g, '<br >');
            return str;
        };

        /**
         * 选中文本框t中，从s到e的字符
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number} s 开始位置
         * @param  {number} e 结束位置
         */
        function select(t, s, e) {
            if (document.selection) {

                // 创建一个可变的动态的range
                var range = t.createTextRange();

                range.moveEnd('character', -t.value.length);
                range.moveEnd('character', e);
                range.moveStart('character', s);
                range.select();
            }
            else {
                t.setSelectionRange(s, e);
                t.focus();
            }
        }

        /**
         * 在文本框t当前光标位置后面添加字符txt
         *
         * @param {HTMLTextAreaElement} t  文本框
         * @param {string} txt 待插入字符
         * @param {number} caretPos 光标位置
         */
        TextCursorHelper.add = function (t, txt, caretPos) {
            if (document.selection) {
                t.focus();
                this.setCaretPosition(t, caretPos);
                document.selection.createRange().text = txt;
            }
            else {
                var cp = t.selectionStart;
                var len = t.value.length;

                t.value = t.value.slice(0, cp) + txt + t.value.slice(cp, len);
                this.setCaretPosition(t, cp + txt.length);
            }
        };

        /**
         * 删除光标前面或者后面的n个字符
         *
         * @param  {HTMLTextAreaElement} t 文本框
         * @param  {number}  n>0删除后面n字符，否则删除前面n字符
         * @param  {number} caretPos 光标位置
         */
        TextCursorHelper.del = function (t, n, caretPos) {
            var p = caretPos || this.getCaretPosition(t);
            var val = t.value;

            if (document.selection) {
                val = val.replace(/\r\n/g, '\n');
            }

            t.value = n > 0 ? val.slice(0, p) + val.slice(p - n)
                            : val.slice(0, p + n) + val.slice(p);

            var newPos = p - (n < 0 ? -n : 0);
            this.setCaretPosition(t, newPos);
        };

        return TextCursorHelper;
    }
);
