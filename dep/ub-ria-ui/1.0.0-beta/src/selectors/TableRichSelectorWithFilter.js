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
        var lib = require('esui/lib');

        require('esui/Select');
        require('esui/Panel');

        var TableRichSelector = require('./TableRichSelector');

        /**
         * 控件类
         *
         * @class ui.TableRichSelectorWithFilter
         * @extends ui.RichSelector
         */
        var exports = {};

        /**
         * 控件类型，始终为`"TableRichSelectorWithFilter"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'TableRichSelectorWithFilter';

        /**
         * @override
         */
        exports.styleType = 'RichSelector';

        /**
         * 创建表头
         *
         * @override
         */
        exports.createTableHead = function () {
            var tableClass = this.helper.getPartClassName('head-table');
            var tpl = ['<table border=0 class="' + tableClass + '"><tr>'];
            var colmNum = this.fields.length;
            // 绘制表头th
            for (var i = 0; i < colmNum; i++) {
                var field = this.fields[i];
                if (field.field !== this.filterField) {
                    tpl.push(''
                        + '<th class="th' + i + '"'
                        + ' style="width:' + field.width + 'px;">'
                        + field.title || ''
                        + '</th>'
                    );
                }
                else {
                    tpl.push(''
                        + '<th class="th' + i + '" style="width:' + field.width + 'px;">'
                        + '    <div data-ui="type:Select;childName:filterSel;variants:compact;"></div>'
                        + '</th>'
                    );
                }
            }
            // 最后一列用来装箭头
            tpl.push('<th></th>');
            tpl.push('</tr></table>');
            return tpl.join(' ');
        };

        /**
         * @override
         */
        exports.getSearchBoxHTML = function () {
            var searchBoxHTML = this.$super(arguments);

            var filterHTML = '<div class="${queryListClass}" data-ui-type="Panel" data-ui-child-name="filter"></div>';

            filterHTML = lib.format(
                filterHTML,
                {
                    queryListClass:
                        this.helper.getPrefixClass('richselector-query-list')
                }
            );
            return searchBoxHTML + filterHTML;
        };

        /**
         * 刷新筛选区
         * @public
         */
        exports.refreshFilter = function () {
            var filter = this.getFilter();
            filter.setContent(this.createTableHead());

            var filterSelect = filter.getChild('filterSel');

            if (filterSelect) {
                filterSelect.setProperties({datasource: this.filterDatasource});
                filterSelect.on('change', this.search, this);
            }
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        exports.repaint = require('esui/painters').createRepaint(
            TableRichSelector.prototype.repaint,
            {
                name: 'fields',
                paint: function (control, fields) {
                    control.refreshFilter();
                }
            }
        );

        /**
         * @override
         */
        exports.initStructure = function () {
            this.$super(arguments);

            var controlHelper = this.helper;
            var cls = [
                controlHelper.getPrefixClass('table-richselector-with-filter'),
                controlHelper.getPrefixClass('table-richselector')
            ];
            lib.addClasses(
                this.main,
                cls
            );
        };

        /**
         * @override
         */
        exports.refreshContent = function () {
            // 带筛选功能的控件表头放在搜索框下面，所以要取消原始的表头创建
            this.hasRowHead = false;
            this.$super(arguments);
        };

        /**
         * @override
         */
        exports.search = function (args) {
            var filterData = [];
            // 取自带搜索框的值
            var searchBox = this.getSearchBox();
            if (searchBox) {
                filterData.push({value: lib.trim(searchBox.getValue())});
            }

            var filterSelect = this.getFilter().getChild('filterSel');
            if (filterSelect) {
                var value = filterSelect.getValue();
                if (value && value !== '') {
                    filterData.push({keys: [this.filterField], value: filterSelect.getValue()});
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
        };

        /**
         * 获取筛选区Panel
         * @return {esui.Panel}
         */
        exports.getFilter = function () {
            return this.getChild('body').getChild('filter');
        };

        var TableRichSelectorWithFilter = require('eoo').create(TableRichSelector, exports);

        require('esui').register(TableRichSelectorWithFilter);

        return TableRichSelectorWithFilter;
    }
);
