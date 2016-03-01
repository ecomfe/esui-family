/**
 * 过滤器
 * @file: FilterResult.js
 * @author: yaofeifei@baidu.com; liwei47@baidu.com
 *
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var InputControl = require('esui/InputControl');
    var eoo = require('eoo');
    var esui = require('esui/main');
    var painters = require('esui/painters');
    var $ = require('jquery');

    require('esui/Label');

    /**
     * FilterResult
     *
     * @extends Panel
     * @constructor
     */
    var FilterResult = eoo.create(
        InputControl,
        {
            type: 'FilterResult',

            /**
             * 初始化配置
             *
             * @protected
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    datasource: []
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
                var mainEle = this.main;
                var html
                        = '<div id="${filterPanelId}" class="${filterPanelStyle}">'
                        + '<label id="${labelId}"></label>'
                        + '<div id="${contentPanelId}" class="${contentPanelStyle}"></div>'
                        + '</div>';
                mainEle.innerHTML = lib.format(
                    html,
                    {
                        filterPanelStyle: controlHelper.getPartClassName('panel'),
                        filterPanelId: controlHelper.getId('items-wrapper-panel'),
                        labelId: controlHelper.getId('items-label'),
                        contentPanelId: controlHelper.getId('items-panel'),
                        contentPanelStyle: controlHelper.getPartClassName('items-panel')
                    }
                );

                // 创建控件树
                this.initChildren(mainEle);
            },

            /**
             * 增加项
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @public
             */
            addItem: function (item) {
                if (this.getItemByValue(item.value)) {
                    return;
                }
                this.datasource.push(item);
                this.buildItems();
            },

            /**
             * 获取提示已选项Panel
             * @return {Panel} 提示已选项Panel
             * @private
             */
            getSelectedItemsPanel: function () {
                var selectedPanelId = this.helper.getId('items-panel');
                return this.viewContext.get(selectedPanelId);
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                var me = this;
                this.helper.addDOMEvent(
                    me.main,
                    'click',
                    'a',
                    function (e) {
                        e.preventDefault();

                        var $target = $(e.currentTarget);

                        var value = $target.attr('data-value');
                        var text = $target.children(':first-child').text();
                        var item = {
                            value: value,
                            text: text
                        };

                        me.removeItem(item);
                    }
                );
            },

            /**
             * 移除选中项
             * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @param {HtmlElement} target 取消选中的元素
             * @private
             */
            removeItem: function (item) {
                if (!item) {
                    return;
                }
                var selectedItem = this.getItemByValue(item.value);
                this.datasource = u.without(this.datasource, selectedItem);
                /**
                 * @event select
                 *
                 * 移除时触发
                 */
                this.fire('change', {
                    item: item
                });
                this.buildItems();
            },

            /**
             * 根据值获取整个选择项的数据
             * @param {string} value 值
             * @param {Object=} datasource 数据源
             * @return {Object} item 选中项的数据 格式如: {value: '', text: ''}
             * @public
             */
            getItemByValue: function (value) {
                var item;

                u.each(this.datasource, function (single, index) {
                    if (single.value === value) {
                        item = single;
                    }
                });
                return item;
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
                    name: ['datasource'],
                    paint: function (resultPanel, datasource) {
                        resultPanel.buildItems();
                    }
                },
                {
                    name: ['label'],
                    paint: function (resultPanel, selectedLabel) {
                        $(resultPanel.helper.getPart('items-label')).text(selectedLabel);
                    }
                }
            ),

            /**
             * 根据datasource生成选择项
             * @param {Array} datasource 选项列表数据源
             * @private
             */
            buildItems: function () {
                var html
                    = '<a href="#" class="${style}" data-value="${value}">'
                    + '<span>${text}</span>'
                    + '<span class="${iconClass} ${removeClass}"></span>'
                    + '</a>';
                var s = '';
                var helper = this.helper;

                u.forEach(this.datasource, function (item) {
                    s += lib.format(
                        html,
                        {
                            value: item.value,
                            text: item.text,
                            style: helper.getPartClassName('item'),
                            iconClass: helper.getIconClass(),
                            removeClass: helper.getPartClassName('remove')
                        }
                    );
                });
                var selectedItemsPanel = helper.getPart('items-panel');
                $(selectedItemsPanel).html(s);
            },

            /**
             * 获取选中的
             * @return {Object} 选中的条件
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

    esui.register(FilterResult);
    return FilterResult;
});
