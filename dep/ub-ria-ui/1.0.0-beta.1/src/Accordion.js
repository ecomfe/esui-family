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
        var u = require('underscore');
        var lib = require('esui/lib');
        var Control = require('esui/Control');

        /**
         * 手风琴控件
         *
         * @extends Control
         * @constructor
         */
        function Accordion() {
            Control.apply(this, arguments);
        }

        /**
         * 控件类型，始终为`"Accordion"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        Accordion.prototype.type = 'Accordion';

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
        Accordion.prototype.initOptions = function (options) {
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
                fixHeight: null,
            };

            properties.headerIcon = this.helper.getIconClass(properties.headerIcon);
            properties.activeHeaderIcon = this.helper.getIconClass(properties.activeHeaderIcon);
            u.extend(properties, options);

            if (typeof properties.activeIndex === 'string') {
                properties.activeIndex = +properties.activeIndex;
            }

            // -1标记为所有元素折叠
            if (properties.activeIndex < 0 || properties.activeIndex === null) {
                properties.activeIndex = -1;
            }

            this.setProperties(properties);
        };

        /**
         * 重渲染
         *
         * @method
         * @protected
         * @override
         */
        Accordion.prototype.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                // 激活的panel下标
                name: 'activeIndex',
                paint: activateAccordion
            }
        );

        /**
         * 骨架构造
         *
         * @protected
         * @override
         */
        Accordion.prototype.initStructure = function () {
            renderAccordionEl(this);
        };

        /**
         * 渲染手风琴元素
         *
         * @param {Accordion} accordion accordion控件实例
         * @ignore
         */
        function renderAccordionEl(accordion) {
            var elements = lib.getChildren(accordion.main);
            var len = elements.length;
            var controlHelper = accordion.helper;

            for (var i = 0; i < len; i++) {
                var panel = elements[i];
                controlHelper.addPartClasses('panel', panel);

                var isActive = accordion.activeIndex === i;
                if (isActive) {
                    controlHelper.addPartClasses('panel-active', panel);
                }

                renderPanelEl(accordion, panel);
            }
        }

        /**
         * 渲染panel元素
         *
         * @param {accordion} accordion 控件实例
         * @param {meta.panel} panel panel的配置数据项
         */
        function renderPanelEl(accordion, panel) {

            var controlHelper = accordion.helper;
            // 获取头部元素，增加样式属性
            var header = lib.dom.first(panel);
            if (header) {
                controlHelper.addPartClasses('header', header);
                // 获取内容元素，增加样式属性
                var content = lib.dom.next(header);
                if (content) {
                    controlHelper.addPartClasses('content', content);

                    // 内容元素是否固定高度
                    if (accordion.fixHeight) {
                        content.style.cssText = ''
                            + 'height: ' + parseInt(accordion.fixHeight, 10) + 'px;'
                            + 'overflow: auto';
                    }
                }
                var icon = document.createElement('span');
                lib.addClass(icon, controlHelper.getPartClassName('header-icon'));
                lib.addClass(icon, accordion.headerIcon);
                header.appendChild(icon);
            }
        }

        /*
         * 点击时的切换逻辑
         *
         * @param {Event} e 触发事件的事件对象
         * @fires collapse
         * @ignore
         */
        function clickAccordion(e) {
            var target = e.target;
            while (target && !this.helper.isPart(target, 'header')) {
                target = target.parentNode;
            }
            if (this.helper.isPart(target, 'header')) {
                var panel = target.parentNode;

                var accordion = panel.parentNode;
                var activeIndex = 0;
                for (var i = 0; i < accordion.children.length; i++) {
                    if (accordion.children[i] === panel) {
                        activeIndex = i;
                        break;
                    }
                }

                // 非互斥折叠
                if (this.collapsible) {
                    // 该元素内容已展开，折叠收缩
                    if (this.helper.isPart(panel, 'panel-active')) {
                        collapseAccordion.call(this);
                        this.activeIndex = -1;
                    }
                    else {
                        // 只激活当前元素
                        this.set('activeIndex', activeIndex);
                    }
                }
                // 互斥折叠
                else {
                    // 该元素内容已展开，什么都不做
                    if (this.helper.isPart(panel, 'panel-active')) {
                        return;
                    }
                    // 只激活当前元素
                    this.set('activeIndex', activeIndex);
                }
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
            var elements = lib.getChildren(accordion.main);
            var len = elements.length;
            var controlHelper = accordion.helper;
            var activeIconClass = accordion.activeHeaderIcon;
            var iconClass = accordion.headerIcon;

            for (var i = 0; i < len; i++) {
                var panel = elements[i];
                var header = lib.getChildren(panel)[0];
                var content = lib.getChildren(panel)[1];
                var icon = lib.dom.last(header);
                var isCurrent = i === index;
                methodName =
                    isCurrent ? 'addPartClasses' : 'removePartClasses';
                controlHelper[methodName]('panel-active', panel);
                lib.removeClass(icon, activeIconClass);
                lib.removeClass(icon, iconClass);
                if (isCurrent) {
                    lib.addClass(icon, activeIconClass);
                }
                else {
                    lib.addClass(icon, iconClass);
                }
            }
        }

        /**
         * 折叠处于激活状态的panel
         *
         *
         */
        function collapseAccordion() {
            var elements = lib.getChildren(this.main);
            var controlHelper = this.helper;
            var panel = elements[this.activeIndex];
            var content = lib.getChildren(panel)[1];

            if (content) {
                controlHelper.addPartClasses('content-hidden', content);
            }
            controlHelper.removePartClasses('panel-active', panel);
        }

        /**
         * 初始化事件类型
         *
         * @protected
         * @override
         */
        Accordion.prototype.initEvents = function () {
            var type = this.hoverable ? 'mouseover' : 'click';
            this.helper.addDOMEvent(this.main, type, clickAccordion);
        };

        /**
         * 获取当前激活的{@link meta.panel}对象
         *
         * @return {meta.panel}
         */
        Accordion.prototype.getActivePanel = function () {
            var elements = lib.getChildren(this.main);
            return elements[this.get('activeIndex')];
        };

        lib.inherits(Accordion, Control);
        require('esui/main').register(Accordion);
        return Accordion;
    }
);
