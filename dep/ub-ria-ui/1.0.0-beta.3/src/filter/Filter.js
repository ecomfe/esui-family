/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 过滤器
 * @author yaofeifei@baidu.com; liwei47@baidu.com; lixiang05@baidu.com
 */

define(
    function (require) {
        var u = require('underscore');
        var InputControl = require('esui/InputControl');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var esui = require('esui');
        var $ = require('jquery');

        /**
         * Filter
         *
         * @class filter.Filter
         * @extends esui.InputControl
         */
        var Filter = eoo.create(
            InputControl,
            {

                /**
                 * @override
                 */
                type: 'Filter',

                /**
                 * 初始化配置
                 *
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 默认单选
                        multiple: false,
                        // 是否支持自定义
                        custom: false,
                        // 自定义按钮Label
                        customBtnLabel: '自定义',
                        datasource: [],
                        value: null
                    };
                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    var controlHelper = this.helper;
                    var template = '<div id="${filterPanelId}" class="${filterPanelStyle}">'
                        + '<label id="${labelId}"></label>'
                        + '<div id="${contentPanelId}" class="${contentPanelStyle}"></div>'
                        + '</div>';
                    var data = {
                        filterPanelStyle: controlHelper.getPartClassName('panel'),
                        filterPanelId: controlHelper.getId('items-wrapper-panel'),
                        labelId: controlHelper.getId('items-label'),
                        contentPanelId: controlHelper.getId('items-panel'),
                        contentPanelStyle: controlHelper.getPartClassName('items-panel')
                    };

                    var mainElement = this.main;
                    mainElement.innerHTML = this.helper.render(template, data);

                    // 创建控件树
                    this.initChildren(mainElement);
                },

                /**
                 * 重渲染
                 *
                 * @method
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: ['datasource', 'rawValue'],
                        paint: function (filter, datasource, rawValue) {
                            if (!u.isArray(rawValue)) {
                                rawValue = [rawValue];
                            }

                            u.each(filter.datasource, function (item, index) {
                                if (u.indexOf(rawValue, item.value) > -1) {
                                    item.selected = true;
                                }
                            });

                            filter.buildItems();
                        }
                    },
                    {
                        name: ['label'],
                        paint: function (filter, label) {
                            $(filter.helper.getPart('items-label')).text(label);
                        }
                    }
                ),

                /**
                 * 初始化事件交互
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    var itemMainClass = this.helper.getPartClasses('item')[0];
                    var itemCmdClass = this.helper.getPartClasses('item-cmd')[0];
                    this.helper.addDOMEvent(
                        this.main,
                        'click',
                        '.' + itemMainClass + ', .' + itemCmdClass,
                        function (e) {
                            e.preventDefault();
                            this.changeItemStatus(e.target);
                        }
                    );
                },

                /**
                 * 改变选择项的选中状态
                 *
                 * @protected
                 * @method filter.Filter#changeItemStatus
                 * @param {HTMLElement} target 目标元素
                 */
                changeItemStatus: function (target) {
                    var helper = this.helper;
                    var itemRemoveClass = helper.getPartClassName('item-remove');
                    var itemCommonClass = helper.getPartClasses('item')[0];
                    var itemCmdClass = this.helper.getPartClasses('item-cmd')[0];

                    var clickItem = $(target);
                    var selectedItem = clickItem.closest('.' + itemCommonClass + ', .' + itemCmdClass);
                    var itemIndex = selectedItem.data('index');
                    var item = u.clone(this.datasource[itemIndex]);

                    if (clickItem.hasClass(itemRemoveClass)) {
                        this.selectItem(item);
                        this.removeItem(item);

                        this.fire('customitemremove', {item: item});
                    }
                    else {
                        var itemClass = helper.getPartClassName('item');
                        var cmdItemClass = helper.getPartClassName('item-cmd');

                        if (selectedItem.hasClass(itemClass)) {
                            this.selectItem(item);
                        }
                        else if (selectedItem.hasClass(cmdItemClass)) {
                            this.fire('customlinkclick', {element: target});
                        }
                    }
                },

                /**
                 * 根据datasource生成选择项
                 *
                 * @param {Array} datasource 选项列表数据源
                 * @private
                 */
                buildItems: function () {
                    var helper = this.helper;
                    var htmls = u.map(
                        this.datasource,
                        function (item, index) {
                            var active = item.selected ? helper.getPartClassName('item-active') : '';
                            return buildItem.call(this, item, active, index);
                        },
                        this
                    );

                    helper.getPart('items-panel').innerHTML = htmls.join('');
                    this.custom && buildCustomItem.call(this);
                },

                /**
                 * 新增选择项
                 *
                 * @public
                 * @param {Object} item 新增的选择项
                 */
                addItem: function (item) {
                    this.datasource.push(item);
                    this.buildItems();
                },

                /**
                 * 移除选择项
                 *
                 * @param {Object} item 待移除的项
                 */
                removeItem: function (item) {
                    var removeItem = this.getItemByValue(item.value);
                    this.datasource = u.without(this.datasource, removeItem);
                    this.buildItems();
                },

                /**
                 * 设置选择项
                 *
                 * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
                 * @public
                 */
                unselectItem: function (item) {
                    if (!item || !this.getItemByValue(item.value)) {
                        return;
                    }
                    var targetItem = this.getItemByValue(item.value);
                    targetItem.selected = false;

                    this.buildItems();
                },

                /**
                 * 选择项
                 *
                 * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
                 * @param {HtmlElement} target 选中的元素
                 * @private
                 */
                selectItem: function (item) {
                    var selectedItem = this.getItemByValue(item.value);
                    var lastItem;
                    var oldSelected = selectedItem.selected;

                    // 需要移除前一个单选
                    if (!this.multiple && !oldSelected) {
                        var selectedItems = this.getSelectedItems();
                        if (selectedItems.length > 0) {
                            lastItem = selectedItems[0];
                            lastItem.selected = false;
                        }
                    }

                    selectedItem.selected = !selectedItem.selected;

                    /**
                     * @event select
                     *
                     * 选择时触发
                     */
                    this.fire('change', {
                        item: item,
                        lastItem: lastItem,
                        action: oldSelected ? 'unselect' : 'select'
                    });
                    this.buildItems();
                },

                /**
                 * 根据值获取整个选择项的数据
                 *
                 * @param {string} value 值
                 * @param {Object=} datasource 数据源
                 * @return {Object} item 选中项的数据 格式如: {value: '', text: ''}
                 * @public
                 */
                getItemByValue: function (value, datasource) {
                    datasource = datasource || this.datasource;
                    return u.find(
                        datasource,
                        function (single, index) {
                            return single.value === value;
                        }
                    );
                },

                /**
                 * 获取选中的项
                 *
                 * @return {Object} 选中项
                 */
                getSelectedItems: function () {
                    var items = [];
                    u.each(this.datasource, function (item, index) {
                        if (item.selected) {
                            items.push(item);
                        }
                    });
                    return items;
                },

                /**
                 * 获取选中的值
                 *
                 * @return {Object} 选中项
                 */
                getValue: function () {
                    var items = this.getSelectedItems();
                    var valueArr = [];
                    u.each(items, function (item, index) {
                        valueArr.push(item.value);
                    });
                    return valueArr;
                }
            }
        );

        /**
         * 根据选项数据生成选择项
         *
         * @param {Object} item 选项数据
         * @param {string} style 额外的样式
         * @param {number} index 数据源中的索引
         * @return {HtmlElement} 生成的选择项元素
         */
        function buildItem(item, style, index) {
            var template = ''
                + '<div class="${.item} ${style}"'
                + '  data-value="${value}" data-index="${index}" data-allow-delete="${allowDelete}">'
                + '<span>${text | raw}</span>'
                + '<!-- if: ${allowDelete}-->'
                + '<span class="ui-icon ui-filter-remove ui-filter-item-remove"></span>'
                + '<!-- /if -->'
                + '</div>';
            var data = {
                style: style || '',
                value: item.value,
                index: index,
                text: item.text,
                allowDelete: item.allowDelete
            };

            return this.helper.render(template, data);
        }

        /**
         * 生成自定义项
         */
        function buildCustomItem() {
            var controlHelper = this.helper;
            var template = '<div id="${#custom-link}" class="${.item-cmd}"><span>${text}</span></div>';
            var data = {
                text: this.customBtnLabel
            };
            var html = this.helper.render(template, data);

            $(controlHelper.getPart('items-panel')).append(html);
        }

        esui.register(Filter);
        return Filter;
    }
);
