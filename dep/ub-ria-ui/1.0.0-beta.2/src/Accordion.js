/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 手风琴控件
 * @author wangfj(wangfengjiao01@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui');
        var eoo = require('eoo');
        var u = require('underscore');
        var Control = require('esui/Control');
        var painters = require('esui/painters');
        var $ = require('jquery');

        /**
         * 手风琴控件
         *
         * @extends Control
         * @constructor
         */
        var Accordion = eoo.create(
            Control,
            {

                /**
                 * 控件类型，始终为`"Accordion"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Accordion',

                /**
                 * 初始化参数
                 *
                 * 初始化从HTML生成的情况下，按以下规则从DOM中获取：
                 *
                 * 1. 获取主元素的所有子元素，每个子元素视为panel，保存到panelElements数组中
                 * 2. 将每个panel的第一个元素作为header
                 * 3. 将每个panel的第二个元素作为content
                 * 4. 支持自定义控件
                 *
                 * 初始化从JS生成的情况下，接收panels配置，后续生成DOM节点，不支持自定义控件
                 *
                 *
                 * @param {Object} [options] 构造函数传入的参数
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        /**
                         * @property {number} activeIndex
                         *
                         * 激活的panel下标
                         * 如果为负数视为全部折叠
                         */
                        activeIndex: 0,

                        /**
                         * @property {boolean} hoverable
                         *
                         * 是否hover展开
                         */
                        hoverable: false,

                        /**
                         * @property {boolean} collapsible
                         *
                         * 折叠方式
                         */
                        collapsible: false,

                        /**
                         * @property {string} headerIcon
                         *
                         * 图标
                         */
                        headerIcon: 'caret-right',

                        /**
                         * @property {string} activeHeaderIcon
                         *
                         * 图标
                         */
                        activeHeaderIcon: 'caret-down',

                        /**
                         * @property {number} fixHeight
                         *
                         * 固定Panel高度
                         */
                        fixHeight: null
                    };

                    properties.headerIcon = this.helper.getIconClass(properties.headerIcon);
                    properties.activeHeaderIcon = this.helper.getIconClass(properties.activeHeaderIcon);
                    u.extend(properties, options);

                    this.setProperties(properties);
                },

                /**
                 * 重渲染
                 *
                 * @method
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    painters.style('width'),
                    {
                        // 激活的panel下标
                        name: 'activeIndex',
                        paint: function (accordion, index) {
                            accordion.fire('change');
                            activateAccordion(accordion, index);
                        }
                    }
                ),

                /**
                 * 骨架构造
                 *
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    renderAccordionEl(this);
                },

                /**
                 * 初始化事件类型
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    var header = '.' + this.helper.getPartClassName('header');
                    var type = this.hoverable ? 'mouseover' : 'click';
                    this.helper.addDOMEvent(this.main, type, header, clickAccordion);
                },

                /**
                 * 获取当前激活的{@link meta.panel}对象
                 *
                 * @return {meta.panel}
                 */
                getActivePanel: function () {
                    var elements = $(this.main).children().toArray();
                    return elements[this.get('activeIndex')];
                },

                getSize: function () {
                    return $(this.main).children().length;
                }
            }
        );

        /**
         * 渲染手风琴元素
         *
         * @param {Accordion} accordion accordion控件实例
         * @ignore
         */
        function renderAccordionEl(accordion) {
            var $elements = $(accordion.main).children();
            var controlHelper = accordion.helper;
            var activePanelClass = controlHelper.getPartClassName('panel-active');
            var panelClass = controlHelper.getPartClassName('panel');
            var panelHeaderClass = controlHelper.getPartClassName('header');
            var panelContentClass = controlHelper.getPartClassName('content');
            var panelHeaderIconClass = controlHelper.getPartClassName('header-icon');

            $elements.each(function (idx, panel) {
                var $panel = $(panel);
                $panel.addClass(panelClass);

                if (accordion.activeIndex === idx) {
                    $panel.addClass(activePanelClass);
                }

                var $header = $panel.children().eq(0);
                if ($header.size() > 0) {
                    $header.addClass(panelHeaderClass);
                    var $icon = $('<span></span>');
                    $icon.addClass(panelHeaderIconClass);
                    $icon.addClass(accordion.headerIcon);
                    $header.append($icon);
                }
                // 获取内容元素，增加样式属性
                var $content = $panel.children().eq(1);
                if ($content.size() > 0) {
                    $content.addClass(panelContentClass);

                    // 内容元素是否固定高度
                    if (accordion.fixHeight) {
                        $content.css('height', accordion.fixHeight);
                        $content.css('overflow', 'auto');
                    }
                }
            });
        }

        /*
         * 点击时的切换逻辑
         *
         * @param {Event} e 触发事件的事件对象
         * @fires collapse
         * @ignore
         */
        function clickAccordion(e) {
            var $target = $(e.currentTarget);
            var $panel = $target.parent();
            var $accordion = $panel.parent();
            var me = this;
            var activePanelClass = me.helper.getPartClassName('panel-active');
            var activeIndex = $accordion.children().index($panel);

            // 非互斥折叠
            if (me.collapsible) {
                // 该元素内容已展开，折叠收缩
                if ($panel.hasClass(activePanelClass)) {
                    collapseAccordion.call(me);
                    me.activeIndex = -1;
                }
                else {
                    // 只激活当前元素
                    me.set('activeIndex', activeIndex);
                }
            }
            // 互斥折叠
            else {
                // 该元素内容已展开，什么都不做
                if ($panel.hasClass(activePanelClass)) {
                    return;
                }
                // 只激活当前元素
                this.set('activeIndex', activeIndex);
            }
        }

        /*
         * 激活指定位置的panel
         *
         * @param {accordion} accordion accordion控件实例
         * @parma {number} index 待激活的panel下标
         * @ignore
         */
        function activateAccordion(accordion, index) {
            var $elements = $(accordion.main).children();
            var activeIconClass = accordion.activeHeaderIcon;
            var iconClass = accordion.headerIcon;
            var controlHelper = accordion.helper;
            var activePanelClass = controlHelper.getPartClassName('panel-active');
            var panelHeaderClass = controlHelper.getPartClassName('header');
            var panelHeaderIconClass = controlHelper.getPartClassName('header-icon');

            $elements.each(function (idx, ele) {
                var $panel = $(ele);
                var $header = $panel.children('.' + panelHeaderClass);
                var $icon = $header.children('.' + panelHeaderIconClass);
                $panel.removeClass(activePanelClass);
                $icon.removeClass(activeIconClass);
                $icon.removeClass(iconClass);
                if (idx === index) {
                    $panel.addClass(activePanelClass);
                    $icon.addClass(activeIconClass);
                }
                else {
                    $icon.addClass(iconClass);
                }
            });
        }

        /**
         * 折叠处于激活状态的panel
         */
        function collapseAccordion() {
            var $elements = $(this.main).children();
            var $panel = $elements.eq(this.activeIndex);
            var controlHelper = this.helper;
            var panelContentIconClass = controlHelper.getPartClassName('content');
            var panelHiddenClass = controlHelper.getPartClassName('content-hidden');
            var activePanelClass = controlHelper.getPartClassName('panel-active');
            var $content = $panel.children('.' + panelContentIconClass);
            var panelHeaderIconClass = controlHelper.getPartClassName('header-icon');
            var activeIconClass = this.activeHeaderIcon;
            var iconClass = this.headerIcon;

            $panel.find('.' + panelHeaderIconClass).removeClass(activeIconClass).addClass(iconClass);

            if ($content.size() > 0) {
                $content.addClass(panelHiddenClass);
            }

            $panel.removeClass(activePanelClass);
        }

        esui.register(Accordion);
        return Accordion;
    }
);
