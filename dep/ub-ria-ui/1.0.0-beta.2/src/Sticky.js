/**
 * @file Sticky 悬停控件
 * @exports Sticky
 * @author maoquan(3610cn@gmail.com), xutingting02
 */

define(function (require) {
    var u = require('underscore');
    var esui = require('esui');
    var lib = require('esui/lib');
    var Control = require('esui/Control');
    var eoo = require('eoo');
    var $ = require('jquery');

    var sticked = [];

    var Sticky = eoo.create(
        Control,
        {
            type: 'Sticky',

            initOptions: function (options) {
                var properties = {
                    top: 0
                };
                u.extend(properties, options);
                this.setProperties(properties);
            },

            initStructure: function () {
                var main = this.main;

                var height = $(main).css('position') !== 'absolute' ? main.offsetHeight : '';
                var cssFloat = $(main).css('float');
                cssFloat = cssFloat === 'none' ? '' : cssFloat;

                var $placeHolder = $('<div></div>')
                    .css(
                        {
                            'height': height + 'px',
                            'float': cssFloat,
                            'margin': $(main).css('margin')
                        }
                    )
                    .addClass(
                        this.helper.getPartClassName('placeholder')
                    );
                $(main).wrap($placeHolder);

                this.initialTop = $(main).offset().top;
            },

            initEvents: function () {
                if (sticked.length === 0) {
                    this.helper.addDOMEvent(window, 'scroll', checkScrollPosition);
                }
                sticked.push(this);
            },

            dispose: function () {

                reset(this);

                sticked = u.without(sticked, this);
                if (sticked.length === 0) {
                    this.helper.addDOMEvent(window, 'scroll', checkScrollPosition);
                }

                $(this.main).unwrap();

                this.$super(arguments);
            }
        }
    );

    /**
     * 计算文档高度
     *
     * @return {number}
     */
    function documentHeight() {
        return $(document).height();
    }

    /**
     * 检查是否达到悬停条件
     *
     * @param {ui.Sticky} sticky Sticky实例
     * @return {boolean}
     */
    function check(sticky) {
        if (sticky.disabled) {
            return false;
        }
        var scrollTop = $(window).scrollTop();
        var dwh = documentHeight() - $(window).height;
        var extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
        var etse = sticky.initialTop - sticky.top - extra;
        return scrollTop >= etse;
    }

    /**
     * 重置，即取消悬停
     *
     * @param {ui.Sticky} sticky Sticky实例
     */
    function reset(sticky) {
        sticky.currentTop = null;
        $(sticky.main).css(
            {
                position: '',
                top: '',
                width: '',
                margin: 0 + 'px',
                left: ''
            }
        );
    }

    /**
     * 页面滚动时，检查页面所有sticky组件
     * 对需要悬停效果的，进行相应处理
     */
    function checkScrollPosition() {
        var scrollTop = $(document).scrollTop();

        if (!sticked.length || scrollTop < 0) {
            return;
        }

        var dwh = documentHeight() - $(window).height();
        var extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

        for (var i = 0; i < sticked.length; i++) {
            var sticky = sticked[i];
            var main = sticky.main;
            if (!main.offsetWidth || !main.offsetHeight) {
                continue;
            }
            if (!check(sticky)) {
                if (!isNaN(sticky.currentTop)) {
                    reset(sticky);
                }
            }
            else {
                var newTop = 0;
                if (sticky.top >= 0) {
                    var stickyHeight = main.offsetHeight;
                    newTop = documentHeight() - stickyHeight - sticky.top - scrollTop - extra;
                    newTop = newTop < 0 ? newTop + sticky.top : sticky.top;
                }

                if (sticky.currentTop !== newTop) {
                    var width = sticky.getWidthFrom ? lib.g(sticky.getWidthFrom).offsetWidth : main.offsetWidth;
                    $(main).css(
                        {
                            width: width + 'px',
                            position: 'fixed',
                            top: parseInt(newTop, 10) + 'px',
                            left: $(main).offset().left + 'px'
                        }
                    );
                    sticky.currentTop = newTop;
                }
            }
        }
    }

    esui.register(Sticky);
    return Sticky;
});
