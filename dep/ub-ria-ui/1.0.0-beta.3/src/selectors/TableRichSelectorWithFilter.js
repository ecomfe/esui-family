/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 带选择框筛选功能的列表型富选择器
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui');
        var lib = require('esui/lib');
        var u = require('underscore');
        var eoo = require('eoo');
        var painters = require('esui/painters');

        require('esui/Select');
        require('esui/Panel');

        var TableRichSelector = require('./TableRichSelector');

        /**
         * 控件类
         *
         * @class ui.TableRichSelectorWithFilter
         * @extends ui.RichSelector
         */
        var TableRichSelectorWithFilter = eoo.create(
            TableRichSelector,
            {

                /**
                 * 控件类型，始终为`"TableRichSelectorWithFilter"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'TableRichSelectorWithFilter',

                /**
                 * @override
                 */
                styleType: 'RichSelector',


                /**
                 * 在搜索框的旁边增加筛选
                 * @override
                 */
                getSearchBoxHTML: function () {
                    var searchBoxHTML = [
                        // 搜索区
                        '<div data-ui="type:Panel;childName:searchBoxArea"',
                        ' class="' + this.helper.getPartClassName('search-wrapper') + '">',
                        '   <div style="float:left" data-ui="type:Select;childName:filter;"></div>',
                        '   <div',
                        '   data-ui="buttonPosition:right;buttonVariants:bordered icon;',
                        '   type:SearchBox;childName:itemSearch;variants:clear-border',
                        '   hide-searched-button;searchMode:instant;">',
                        '   </div>',
                        '</div>'
                    ].join('');

                    return searchBoxHTML;
                },

                /**
                 * 刷新筛选区
                 * @public
                 */
                refreshFilter: function () {
                    var filter = this.getFilter();

                    if (filter) {
                        filter.setProperties({datasource: this.filterDatasource});
                        filter.on('change', u.bind(this.search, this));
                    }
                },

                /**
                 * 重新渲染视图
                 * 仅当生命周期处于RENDER时，该方法才重新渲染
                 *
                 * @param {Array=} 变更过的属性的集合
                 * @override
                 */
                repaint: painters.createRepaint(
                    TableRichSelector.prototype.repaint,
                    {
                        name: 'filterDatasource',
                        paint: function (control, filterDatasource) {
                            control.refreshFilter();
                        }
                    }
                ),

                /**
                 * @override
                 */
                initStructure: function () {
                    this.$super(arguments);
                    // 状态筛选，最终调用search函数
                    var filter = this.getFilter();
                    filter.extensions[0].activate();

                    this.addState('with-filter');
                },

                /**
                 * @override
                 */
                search: function (args) {
                    var filterData = [];
                    // 取自带搜索框的值
                    var searchBox = this.getSearchBox();
                    if (searchBox) {
                        filterData.push({value: lib.trim(searchBox.getValue())});
                    }

                    var filterSelect = this.getFilter();
                    if (filterSelect) {
                        var value = filterSelect.getValue();
                        if (value && value !== '') {
                            filterData.push({keys: [this.filterField], value: filterSelect.getRawValue()});
                        }
                    }

                    if (filterData.length) {
                        // 查询，更新数据源
                        this.queryItem(filterData);
                        // 更新腿部总结果
                        this.refreshFoot();
                        // 更新头部总结果
                        this.refreshHead();
                        // 更新状态
                        this.addState('queried');
                    }
                    // 相当于执行清空操作
                    else {
                        this.clearQuery();
                    }
                },

                /**
                 * 获取筛选区Panel
                 * @return {esui.Panel}
                 */
                getFilter: function () {
                    return this.getChild('body').getChild('searchBoxArea').getChild('filter');
                }
            }
        );

        esui.register(TableRichSelectorWithFilter);
        return TableRichSelectorWithFilter;
    }
);
