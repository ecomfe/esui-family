/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 带加载更多的TableRichSelector
 * @author chenhaoyin(chenhaoyin@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');

        var TableRichSelector = require('./TableRichSelector');


        /**
         * 控件类
         *
         * @class ui.PagingTableRichSelector
         * @extends ui.TableRichSelector
         */
        var exports = {};

        /**
         * 控件类型，始终为`"PagingTableRichSelector"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'PagingTableRichSelector';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {
                hasRowHead: true,
                hasIcon: true,
                // 是否触发在图标上
                firedOnIcon: false,
                // 数据源
                datasource: {},
                // 选择数据
                selectedData: [],
                // 字段，含义与Table相同
                fields: [
                    {
                        field: 'name',
                        content: 'name',
                        title: '名称'
                    }
                ],
                allowUnselectNode: false
            };

            lib.extend(properties, options);

            if (properties.hasRowHead === 'false') {
                properties.hasRowHead = false;
            }

            if (properties.hasIcon === 'false') {
                properties.hasIcon = false;
            }

            if (properties.firedOnIcon === 'false') {
                properties.firedOnIcon = false;
            }

            if (properties.allowUnselectNode === 'false') {
                properties.allowUnselectNode = false;
            }

            this.$super([properties]);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.$super(arguments);

            lib.addClass(
                this.main,
                'ui-paging-table-richselector'
            );
        };

        /**
         * 构建List可以使用的数据结构
         * 用户传入数据：
         * —— datasource
         * {
         *     results: [
         *         {id: xxx, name: xxx},
         *         {id: yyy, name: yyy, isSelected: xxx},
         *         ...
         *     ],
         *     totalCount: xxx,
         *     moreFlag: true
         * }
         * 将allData和SelectedData映射转换后
         * —— mixedDatasource
         * [
         *    {id: xxx, name: xxx, isSelected: false},
         *    {id: yyy, name: yyyy, isSelected: false}
         *    ...
         * ]
         * —— indexData （就是一个以id为key，index做value的映射表）
         *
         * @override
         */
        exports.adaptData = function () {
            var allData = lib.deepClone(this.datasource.results);
            // 先构建indexData
            var indexData = u.reduce(
                allData,
                function (memo, item, index) {
                    memo[item.id] = index;
                    return memo;
                },
                {}
            );

            this.indexData = indexData;

            // 把选择状态merge进allData的数据项中
            this.selectedData = this.selectedData || [];
            // 单选模式
            if (!this.multi) {
                // 如果不是数组，这个值就是id
                if (!u.isArray(this.selectedData)) {
                    this.currentSelectedId = this.selectedData.id;
                    this.selectedData = [this.selectedData];
                }
                // 如果是数组，保存第一个值为当前选值
                else if (this.selectedData.length) {
                    this.currentSelectedId = this.selectedData[0].id;
                }
            }

            u.each(this.selectedData, function (item, index) {
                var selectedIndex = indexData[item.id];
                // 有可能出现已选的数据在备选中已经被删除的情况
                // 此时selectedIndex会取到undefined，不做加标记处理
                if (selectedIndex !== undefined) {
                    allData[selectedIndex].isSelected = true;
                }
            });

            var disabledData = this.disabledData || [];
            u.each(disabledData, function (item, index) {
                var selectedIndex = indexData[item.id];
                if (selectedIndex !== undefined) {
                    allData[selectedIndex].isDisabled = true;
                }
            });
            this.allData = allData;

            // 处理fields，把fields也保存到一个索引中
            this.fieldsIndex = {};
            this.defaultSearchFields = [];
            u.each(
                this.fields,
                function (field) {
                    this.fieldsIndex[field.field] = field;
                    if (field.isDefaultSearchField) {
                        this.defaultSearchFields.push(field.field);
                    }
                },
                this
            );
        };

        /**
         * 更新备选区
         *
         * @override
         */
        exports.refreshContent = function () {
            var data = this.isQuery() ? this.queriedData : this.allData;
            if (!data || data.length === 0) {
                this.addState('empty');
            }
            else {
                this.removeState('empty');
            }

            // 开始构建
            var htmlArray = [];
            if (this.hasRowHead) {
                htmlArray.push(createTableHead(this));
            }
            htmlArray.push(createTable(this, data));

            var queryList = this.getQueryList();
            queryList.setContent(htmlArray.join(''));
        };

        /**
         * 创建表头
         *
         * @public
         * @param {ui.TableRichSelector} control 当前控件实例
         * @return {string} 表头html
         */
        function createTableHead(control) {
            var tableClass = control.helper.getPartClassName('head-table');
            var tpl = ['<table border=0 class="' + tableClass + '"><tr>'];
            var colmNum = control.fields.length;
            // 绘制表头th
            var thTpl = '<th class="th${i}" style="width:${width}px;">${title}</th>';
            for (var i = 0; i < colmNum; i++) {
                var field = control.fields[i];
                var data = {
                    i: i,
                    width: field.width,
                    title: field.title
                };
                tpl.push(lib.format(thTpl, data));
            }
            // 最后一列用来装箭头
            tpl.push('<th style="width:30px;"></th>');
            tpl.push('</tr></table>');
            return tpl.join(' ');
        }

        /**
         * 创建表格容器
         *
         * @param {ui.TableForSelector} control 类实例
         * @param {Object} data 绘制的内容
         * @return {string}
         * @ignore
         */
        function createTable(control, data) {
            var helper = control.helper;
            var tableClasses = helper.getPartClassName('content-table');
            var tpl = ['<table border=0 class="' + tableClasses + '">'];
            tpl.push(createTableContent(control, data));
            tpl.push(createMoreRow(control, data));
            tpl.push('</table>');
            return tpl.join(' ');
        }

        /**
         * 创建表格体
         *
         * @param {ui.TableForSelector} control 类实例
         * @param {Object} data 绘制的内容
         * @return {string}
         * @ignore
         */
        function createTableContent(control, data) {
            var isQuery = control.isQuery();
            var indexData = isQuery ? control.queriedIndexData : control.indexData;
            var helper = control.helper;

            var tpl = [];
            var baseRowClasses = helper.getPartClassName('row');
            var selectedRowClasses = helper.getPartClassName('row-selected');
            var disabledRowClasses = helper.getPartClassName('row-disabled');

            // 绘制内容
            u.each(data, function (item, index) {
                var rowClasses = [baseRowClasses];
                if (isNodeSelected(control, item)) {
                    rowClasses.push(selectedRowClasses);
                }
                if (item.isDisabled) {
                    rowClasses.push(disabledRowClasses);
                }
                tpl.push(
                    lib.format(
                        control.rowTpl,
                        {
                            rowId: control.helper.getId('row-' + item.id),
                            rowClass: rowClasses.join(' '),
                            index: indexData[item.id],
                            content: createRow(control, item, index)
                        }
                    )
                );
            });

            return tpl.join(' ');
        }

        function isNodeSelected(control, node) {
            return !!u.findWhere(control.selectedData, {id: node.id});
        }

        /**
         * 创建加载更多行
         *
         * @param {ui.TableForSelector} control 类实例
         * @param {Object} data 绘制的内容
         * @return {string}
         * @ignore
         */
        function createMoreRow(control, data) {
            var indexData = control.isQuery() ? control.queriedIndexData : control.indexData;
            var helper = control.helper;

            var tpl = [];
            var baseRowClasses = helper.getPartClassName('row');
            var moreRowClasses = helper.getPartClassName('row-more');

            if (control.datasource.moreFlag) {
                var lastRowId = data[data.length - 1].id;
                var moreArea = lib.format(
                    control.rowTpl,
                    {
                        rowId: control.helper.getId('more-row'),
                        rowClass: [baseRowClasses, moreRowClasses].join(' '),
                        index: indexData[lastRowId],
                        content: createMoreDataRow(control)
                    }
                );
                tpl.push(moreArea);
            }
            return tpl.join(' ');
        }

        /**
         * 创建加载更多行内容
         *
         * @param {ui.TableForSelector} control 类实例
         * @return {string}
         * @ignore
         */
        function createMoreDataRow(control) {
            var fieldClasses = control.helper.getPartClassName('row-field');
            var arrowClasses = control.helper.getPartClassName('row-loading-icon');
            var fields = control.fields.length;
            var contentHtml = '<td colspan="${fields}" class="${fieldClasses}">加载更多</td>'
                + '<td style="width:30px;"><span class="${arrowClasses}"></span></td>';

            var data = {
                fields: fields,
                fieldClasses: fieldClasses,
                arrowClasses: arrowClasses
            };

            return lib.format(contentHtml, data);
        }

        /**
         * 创建Table的每行
         *
         * @param {ui.TableForSelector} control 类实例
         * @param {Object} item 每行的数据
         * @param {number} index 行索引
         * @param {HTMLElement} tr 容器节点
         * @return {string}
         * @ignore
         */
        function createRow(control, item, index, tr) {
            var fields = control.fields;
            var html = [];
            var fieldClasses = control.helper.getPartClassName('row-field');
            var cursor = 0;
            u.each(fields, function (field, i) {
                var content = field.content;
                var innerHTML = ('function' === typeof content
                    ? content.call(control, item, index, i)
                    : u.escape(item[content]));

                // 有的时候，需要那种content的title提示效果，如果没提供，默认使用content
                var contentTitle = field.contentTitle || content;
                var titleHTML = ('function' === typeof contentTitle
                    ? u.escape(contentTitle.call(control, item, index, i))
                    : u.escape(item[contentTitle]));

                // IE不支持tr.innerHTML，所以这里要使用insertCell
                if (tr) {
                    var td = tr.insertCell(i);
                    td.style.width = field.width + 'px';
                    td.title = titleHTML;
                    td.innerHTML = innerHTML;
                }
                else {
                    var data = {
                        fieldClasses: fieldClasses,
                        titleHTML: titleHTML,
                        width: field.width,
                        innerHTML: innerHTML
                    };

                    var contentHtml = '<td class="${fieldClasses}" title="${titleHTML}" '
                        + 'style="width:${width}px;">${innerHTML}</td>';
                    html.push(lib.format(contentHtml, data));
                }
                cursor++;
            });

            // 最后一列添加箭头
            var arrowClasses = control.helper.getPartClassName('row-action-icon');
            var arrowHTML = '<span class="' + arrowClasses + '"></span>';
            if (tr) {
                var td = tr.insertCell(cursor);
                td.style.width = '30px';
                td.innerHTML = arrowHTML;
            }
            else {
                html.push('<td style="width:30px;">' + arrowHTML + '</td>');
                return html.join(' ');
            }
        }

        /**
         * 按条件搜索
         * 清空上次搜索结果，进行搜索
         *
         * @override
         */
        exports.search = function () {
            var event = {
                filterData: []
            };

            var searchBox = this.getSearchBox();
            this.keyword = lib.trim(searchBox.getValue());

            this.queriedData = [];
            this.queriedIndexData = {};
            this.queriedDatasource = {results: []};

            this.addState('queried');
            this.fire('search', event);
        };

        /**
         * 获取查询关键字
         *
         * @override
         */
        exports.getKeyword = function () {
            return this.keyword;
        };

        /**
         * 适配追加的数据
         *
         * @param {Object} datasource 追加的数据
         * @ignore
         */
        exports.adaptAppendData = function (datasource) {
            var isQuery = this.isQuery();

            var length = isQuery ? this.queriedData.length : this.allData.length;
            var indexData = isQuery ? this.queriedIndexData : this.indexData;

            u.each(datasource.results, function (item, index) {
                indexData[item.id] = index + length;
            });

            this[isQuery ? 'queriedIndexData' : 'indexData'] = indexData;

            var thisDatasource = this[isQuery ? 'queriedDatasource' : 'datasource'];

            thisDatasource.results =  thisDatasource.results.concat(datasource.results);
            thisDatasource.moreFlag = datasource.moreFlag;
            thisDatasource.totalCount = datasource.totalCount;

            this[isQuery ? 'queriedData' : 'allData']
                = this[isQuery ? 'queriedData' : 'allData'].concat(datasource.results);
        };

        /**
         * 追加数据
         *
         * @param {Object} datasource 追加的数据
         * @param {string | undefined} targetId 追加的基准id，没有的话就是新的一次查询
         * @ignore
         */
        exports.appendDatasource = function (datasource, targetId) {
            this.adaptAppendData(datasource);

            this.refreshHead();
            this.refreshFoot();

            // 追加
            if (targetId) {
                var content = createTableContent(this, datasource.results);
                var baseId = this.helper.getId('more-row');
                var moreControl = lib.g(baseId);

                var dom = document.createElement('tbody');
                dom.innerHTML = content;
                var appendNode = dom.childNodes;

                u.each(appendNode, function (node) {
                    node && lib.insertBefore(node, moreControl);
                });

                if (datasource.moreFlag) {
                    var lastDataId = datasource.results[datasource.results.length - 1].id;
                    lib.setAttribute(moreControl, 'index',
                        this.isQuery() ? this.queriedIndexData[lastDataId] : this.indexData[lastDataId]);
                    var loadMoreClasses = this.helper.getPartClassName('row-loading');
                    lib.removeClass(moreControl, loadMoreClasses);
                }
                else {
                    lib.removeNode(moreControl);
                }
            }
            // 点击查询进来
            else {
                this.refreshContent();
                this.refreshResult();
            }
        };

        // 可重写
        exports.operateRow = function (row) {
            var disabledClasses = this.helper.getPartClassName('row-disabled');
            if (lib.hasClass(row, disabledClasses)) {
                return;
            }

            var index = parseInt(row.getAttribute('index'), 10);
            var item = this.isQuery() ? this.queriedData[index] : this.allData[index];
            if (!item) {
                return;
            }

            // 正在加载中
            var rowLoadingClasses = this.helper.getPartClassName('row-loading');
            if (lib.hasClass(row, rowLoadingClasses)) {
                return;
            }

            var loadMoreClasses = this.helper.getPartClassName('row-more');
            if (lib.hasClass(row, loadMoreClasses)) {
                actionForLoadMoreData(this, row, item);
                return;
            }

            if (this.mode === 'add') {
                actionForAdd(this, row, item);
            }
            else if (this.mode === 'load') {
                actionForLoad(this, row, item);
            }
        };

        function actionForAdd(control, row, item) {
            var selectedClasses = control.helper.getPartClassName('row-selected');
            var fire = false;
            // 点击已选中的，在单选模式下，执行取消选择
            if (lib.hasClass(row, selectedClasses)) {
                if (!control.multi) {
                    if (control.allowUnselectNode) {
                        selectItem(control, item.id, false);
                        fire = true;
                    }
                }
            }
            else {
                selectItem(control, item.id, true);
                fire = true;
            }

            if (fire) {
                // 需要增加上一个参数，因为有的时候需要了解当前操作的对象是什么
                control.fire('add', {item: item});
                control.fire('change');
            }
        }

        function actionForLoadMoreData(control, row, item) {
            var loadMoreClasses = control.helper.getPartClassName('row-loading');
            lib.addClass(row, loadMoreClasses);
            var event = {
                item: item,
                filterData: []
            };
            control.fire('loadmoredata', event);
        }

        /**
         * 选择或取消选择
         *   如果控件是单选的，则将自己置灰且将其他节点恢复可选
         *   如果控件是多选的，则仅将自己置灰
         *
         * @param {ui.TableRichSelector} control 类实例
         * @param {Object} id 结点对象id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @ignore
         */
        function selectItem(control, id, toBeSelected) {
            // 完整数据
            var indexData = control.isQuery() ? control.queriedIndexData : control.indexData;
            var data = control.isQuery() ? control.queriedData : control.allData;

            var index = indexData[id];
            var item = data[index];

            // 如果是单选，需要将其他的已选项置为未选
            if (!control.multi) {
                // 移除原有选项
                unselectCurrent(control);
                // 赋予新值
                control.currentSelectedId = toBeSelected ? id : null;

                control.selectedData = [item];
            }
            else {
                if (toBeSelected) {
                    control.selectedData.push(item);
                }
                else {
                    control.selectedData = u.filter(control.selectedData, function (item) {
                        return item.id !== id;
                    });
                }
            }
            updateSingleItemStatus(control, item, toBeSelected);
        }

        // 撤销选择当前项
        function unselectCurrent(control) {
            var curId = control.currentSelectedId;

            // 撤销当前选中项
            // 要把两组数据的都撤销选中
            var index = control.indexData[curId];
            var item = control.allData[index];
            updateSingleItemStatus(control, item, false);

            if (control.isQuery()) {
                index = control.queriedIndexData[curId];
                item = control.queriedData[index];
                updateSingleItemStatus(control, item, false);
            }

            control.currentSelectedId = null;
        }

        /**
         * 更新单个结点状态
         *
         * @param {ui.TableRichSelector} control 类实例
         * @param {Object} item 结点数据对象
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @ignore
         */
        function updateSingleItemStatus(control, item, toBeSelected) {
            if (!item) {
                return;
            }
            item.isSelected = toBeSelected;
            var itemDOM = control.helper.getPart('row-' + item.id);
            var changeClass = toBeSelected ? lib.addClass : lib.removeClass;
            changeClass(
                itemDOM,
                control.helper.getPartClassName('row-selected')
            );
        }

        /**
         * 获取已经选择的数据项
         * 在查询状态下选过的东西，也应该保留。
         * 在查询状态下，删除非查询的选择结点，也应该删除
         * 所有数据都同步到这个节字段
         *
         * @return {Array}
         * @public
         */
        exports.getSelectedItems = function () {
            return this.selectedData;
        };

        /**
         * 手动刷新
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @override
         */
        exports.refresh = function () {
            // 重建数据，包括索引数据的创建
            var adaptedData = this.adaptData();

            // 重绘视图
            this.refreshContent();
            // 视图重绘后的一些额外数据处理
            this.processDataAfterRefresh(adaptedData);
            // 更新底部信息
            this.refreshFoot();
            // 更新头部总结果
            this.refreshHead();
            // 更新高度
            this.adjustHeight();
        };

        function actionForLoad(control, row, item) {
            var selectedClasses = control.helper.getPartClassName('row-selected');
            // 点击未选中的，执行
            if (!lib.hasClass(row, selectedClasses)) {
                selectItem(control, item.id, true);
                control.fire('load');
                control.fire('change');
            }
        }

        /**
         * 清空搜索的结果
         *
         * @override
         */
        exports.clearData = function () {
            // 清空数据
            this.queriedData = [];
            this.queriedIndexData = {};
            this.queriedDatasource = {results: []};
            this.keyword = '';
        };

        /**
         * 选择全部
         * 如果当前处于搜索状态，那么只把搜索结果中未选择的选过去
         *
         * @public
         */
        exports.selectAll = function () {
            var data = this.isQuery() ? this.queriedData : this.allData;
            var control = this;
            u.each(data, function (item) {
                selectItem(control, item.id, true);
            });
            this.fire('add');
            this.fire('change');
        };

        /**
         * @override
         */
        exports.selectItems = function (items, toBeSelected) {
            var allData = this.allData;
            var indexData = this.indexData;
            var control = this;
            u.each(
                items,
                function (item) {
                    var id = item.id !== undefined ? item.id : item;
                    var itemIndex = indexData[id];
                    if (itemIndex != null) {
                        var rawItem = allData[itemIndex];
                        // 更新状态，但不触发事件
                        selectItem(control, rawItem.id, toBeSelected);
                    }
                    else {
                        // 在结点列表里找不到，如果是删掉的话，到已选择的列表里去找
                        var selectedItem = u.findWhere(control.selectedData, {id: id});
                        selectItem(control, selectedItem.id, toBeSelected);
                    }
                }
            );
        };

        /**
         * 获取当前状态的显示个数
         *
         * @return {number}
         * @override
         */
        exports.getCurrentStateItemsCount = function () {
            return this.isQuery() ? this.queriedDatasource.totalCount : this.datasource.totalCount;
        };

        var PagingTableRichSelector = require('eoo').create(TableRichSelector, exports);

        require('esui').register(PagingTableRichSelector);

        return PagingTableRichSelector;
    }
);
