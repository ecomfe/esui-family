/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 带load型选择器的富选择控件组合
 * @exports FilterRichSelectorGroup
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var Panel = require('esui/Panel');

        /**
         * 带load型选择器的富选择控件组合由：
         * --- 一个Load型富选择器（必选）
         * --- 一个Add型富选择器（必选）
         * --- 一个Delete型富选择器（可选）
         * 组成
         *
         * 支持根据Load型选择器的选择动态加载备选资源的交互
         *
         * 三个选择控件的类型以及配置由使用者通过模板自行定义，详情参见demo
         *
         * 选择控件必须配置data-ui-role，'filter'代表筛选器 'source'代表源选择器，'target'代表目标选择器
         *
         * @class FilterRichSelectorGroup
         * @extends esui.Panel
         */
        var exports = {};

        /**
         * @override
         */
        exports.type = 'FilterRichSelectorGroup';

        exports.getCategory = function () {
            return 'input';
        };

        exports.initOptions = function (options) {
            var properties = {
                multi: true,
                sourceData: [],
                sourceSelectedData: []
            };

            u.extend(properties, options);
            this.$super([properties]);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.helper.initChildren();

            // 获取children
            var selectors = this.children;
            u.each(
                selectors,
                function (selector) {
                    var role = selector.main.getAttribute('data-ui-role');
                    if (role) {
                        this[role] = selector;
                    }
                },
                this
            );

            // 绑事件
            this.filter && this.filter.on(
                'load',
                function (e) {
                    var event = this.fire('load', {item: e.item});
                    if (event.isDefaultPrevented()) {
                        return;
                    }
                    var data = event.data;
                    // 从data中筛选出已选择的，勾选上
                    var selectedItems = u.filter(
                        data,
                        function (item) {
                            return u.findWhere(this.getRawValue(), {id: item.id}) != null;
                        },
                        this
                    );

                    this.source.setProperties({datasource: data, selectedData: selectedItems});
                },
                this
            );

            this.source && this.source.on(
                'add',
                function (e) {
                    var items = e.target.getSelectedItems();
                    if (items.length) {
                        var event = this.fire('add', {items: items});
                        // 外部有自己的添加处理逻辑
                        if (event.isDefaultPrevented()) {
                            return;
                        }
                        // 默认的处理：
                        // 条件：默认source是TableRichSelector
                        // 情景1：有target，则分组多选，选择的结果要叠加
                        // 情景2：没有target，则分组单选，结果不叠加
                        var newSelecteItems;
                        // 情景1
                        if (this.target) {
                            // 获取原始的已选值
                            newSelecteItems = u.clone(this.getRawValue()) || [];
                            // 单选
                            if (e.item) {
                                // 添加
                                if (e.status) {
                                    var selectedItem = u.omit(e.item, e.item.isSelected);
                                    // 追加
                                    newSelecteItems.push(selectedItem);
                                }
                                // 反选删除
                                else {
                                    // 过滤
                                    newSelecteItems = u.filter(
                                        newSelecteItems,
                                        function (item) {
                                            item.id !== e.item.id;
                                        }
                                    );
                                }
                            }
                            // 批量添加
                            else {
                                // 选择源当前选择项
                                var selectedItems = e.target.getSelectedItems();
                                newSelecteItems = u.union(newSelecteItems, selectedItems);
                            }
                            this.target.setProperties({datasource: newSelecteItems});
                        }
                        // 情景2
                        else {
                            newSelecteItems = this.source.getSelectedItems();
                        }
                        this.rawValue = newSelecteItems;
                        this.fire('change');
                    }
                },
                this
            );

            this.target && this.target.on(
                'delete',
                function (arg) {
                    var items = arg.items;
                    var event = this.fire('delete', {items: items});
                    if (event.isDefaultPrevented()) {
                        return;
                    }
                    // 默认将source中的指定数据取消选择
                    this.source && this.source.selectItems(items, false);
                    this.fire('change');
                },
                this
            );
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        exports.repaint = require('esui/painters').createRepaint(
            Panel.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (control, rawValue) {
                    control.target && control.target.setProperties({datasource: rawValue});
                }
            },
            {
                name: 'filterData',
                paint: function (control, filterData) {
                    control.filter && control.filter.setProperties({datasource: filterData});
                }
            },
            {
                name: ['sourceData', 'sourceSelectedData'],
                paint: function (control, sourceData, sourceSelectedData) {
                    var properties = {datasource: sourceData, selectedData: sourceSelectedData};
                    control.source && control.source.setProperties(properties);
                }
            }
        );

        /**
         * 将value从原始格式转换成string
         *
         * @param {*} rawValue 原始值
         * @return {string}
         */
        exports.stringifyValue = function (rawValue) {
            var selectedIds = [];
            if (!u.isArray(rawValue)) {
                selectedIds = [rawValue];
            }
            else {
                u.each(rawValue, function (item) {
                    selectedIds.push(item.id);
                });
            }
            return selectedIds.join(',');
        };

        exports.getRawValue = function () {
            if (this.target) {
                return this.target.getRawValue();
            }
            return this.rawValue;
        };

        var FilterRichSelectorGroup = require('eoo').create(Panel, exports);
        require('esui').register(FilterRichSelectorGroup);

        return FilterRichSelectorGroup;
    }
);
