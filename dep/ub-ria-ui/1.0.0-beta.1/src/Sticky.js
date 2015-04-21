/**
 * @file Sticky控件类
 * @exports Sticky
 */

define(function (require) {
    var u = require('underscore');
    var lib = require('esui/lib');
    var paint = require('esui/painters');
    var Control = require('esui/Control');
    var eoo = require('eoo');

    var sticked = [];
    var bindScroll = false;
    var getCurrentStyle = lib.getComputedStyle;

    function documentHeight() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.documentElement.clientHeight);
    }

    function check(sticky) {
        if (sticky.disabled) {
            return false;
        }
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop,
            dwh = documentHeight() - window.innerHeight,
            extra = (scrollTop > dwh) ? dwh - scrollTop : 0,
            etse = sticky.initialTop - sticky.top - extra;
        return (scrollTop >= etse);
    }

    function reset(sticky) {
        sticky.currentTop = null;
        var style = sticky.main.style;
        style.position = '';
        style.top = '';
        style.width = '';
        style.margin = 0 + 'px';
        style.left = '';
    }

    function checkscrollposition() {
        var stickies = sticked;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (!stickies.length || scrollTop < 0) {
            return;
        }

        var windowHeight = document.documentElement.clientHeight;
        var dwh = documentHeight() - windowHeight;
        var extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
        var newTop;
        var stickyHeight;
        var sticky;
        var stickyMainElement;

        for (var i = 0; i < stickies.length; i++) {
            sticky = stickies[i];
            stickyMainElement = sticky.main;
            if (!stickyMainElement.offsetWidth || !stickyMainElement.offsetHeight) {
                continue;
            }
            if (!check(sticky)) {
                if (!isNaN(sticky.currentTop)) {
                    reset(sticky);
                }
            } 
            else {
                if (sticky.top < 0) {
                    newTop = 0;
                } 
                else {
                    stickyHeight = stickyMainElement.offsetHeight;
                    newTop = documentHeight - stickyHeight - sticky.top - scrollTop - extra;
                    newTop = newTop < 0 ? newTop + sticky.top : sticky.top;
                }
                if (sticky.currentTop != newTop) {
                    var style = stickyMainElement.style;
                    var width = sticky.getWidthFrom ?
                        lib.g(sticky.getWidthFrom).offsetWidth : stickyMainElement.offsetWidth;
                    style.width = width + 'px';
                    style.position = 'fixed';
                    style.top = parseInt(newTop) + 'px';
                    style.left = lib.getOffset(stickyMainElement).left + 'px';
                    sticky.currentTop = newTop;
                }
            }
        }
    }

    var exports = {
        type : 'Sticky',

        initOptions: function (options) {
            var properties = {
                top: 0
            };
            u.extend(properties, options); 
            this.setProperties(properties);
        },

        initStructure: function () {
            var placeHolder = document.createElement('div');
            var mainElement = this.main;
            lib.insertBefore(placeHolder, mainElement);
            placeHolder.appendChild(mainElement);
            lib.addClass(placeHolder, this.helper.getPartClassName('placeholder'));
            var height = getCurrentStyle(mainElement, 'position') != 'absolute' ? mainElement.offsetHeight : ''; 
            var style = placeHolder.style;

            style.height = height + 'px';
            style.float = getCurrentStyle(mainElement, 'float') != 'none' ? getCurrentStyle(mainElement).float : '';
            style.margin = getCurrentStyle(mainElement, 'margin');
            this.initialTop = lib.getOffset(mainElement).top;
        },

        initEvents: function() {
            if (sticked.length === 0) {
                lib.on(window, 'scroll', checkscrollposition);
            }
            sticked.push(this);
        },

        dispose: function () {
            var me = this;
            me.$super(arguments);
            var mainElement = me.main;
            reset(me);
            sticked = u.without(sticked, me);
            if (sticked.length === 0) {
                lib.un(window, 'scroll', checkscrollposition);
            }

            var placeHolder = mainElement.parentNode;
            lib.insertBefore(mainElement, mainElement.parentNode);
            lib.removeNode(placeHolder);
        }
    };

    var Sticky = eoo.create(Control, exports);
    require('esui/main').register(Sticky);
    return Sticky;
});
