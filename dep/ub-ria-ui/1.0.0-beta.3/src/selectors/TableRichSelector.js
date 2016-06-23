/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 选择控件中所用到的列表形结构
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui');
        var lib = require('esui/lib');
        var util = require('../helper/util');
        var u = require('underscore');
        var eoo = require('eoo');
        var painters = require('esui/painters');

        var RichSelector = require('./RichSelector');

        /**
         * 控件类
         *
         * @class ui.TableRichSelector
         * @extends ui.RichSelector
         */
        var TableRichSelector = eoo.create(
            RichSelector,
            {

                /**
                 * 控件类型，始终为`"TableRichSelector"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'TableRichSelector',

                /**
                 * @override
                 */
                styleType: 'RichSelector',

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 事件是否只触发在图标上
                        firedOnIcon: false,
                        // 数据源，全集数据
                        datasource: [],
                        // 已选的数据
                        selectedData: [],
                        // 字段，含义与Table相同，searchScope表示这个字段对搜索关键词是全击中还是部分击中
                        // caseSensitive表示大小写敏感，默认不敏感
                        fields: [
                            {
                                field: 'name',
                                title: '名称',
                                content: 'name',
                                searchScope: 'partial',
                                caseSensitive: false,
                                isDefaultSearchField: true
                            }
                        ],
                        // 是否展示表格属性栏
                        hasRowHead: true
                    };

                    u.extend(properties, options);
                    this.$super([properties]);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    this.$super(arguments);

                    lib.addClass(
                        this.main,
                        this.helper.getPrefixClass('tablerichselector')
                    );
                },

                /**
                 * 重新渲染视图
                 * 仅当生命周期处于RENDER时，该方法才重新渲染
                 *
                 * @param {Array=} 变更过的属性的集合
                 * @override
                 */
                repaint: painters.createRepaint(
                    RichSelector.prototype.repaint,
                    {
                        name: ['datasource', 'selectedData', 'disabledData', 'fields'],
                        paint: function (control, datasource, selectedData, disabledData, fields) {
                            control.refresh();
                            control.fire('change');
                        }
                    }
                ),

                /**
                 * 构建List可以使用的数据结构
                 * 把用户传入数据制作成一个副本allData：
                 * —— allData
                 * [{id: 1, name: xxx}, {id: 2, name: yyy}...]
                 *
                 * 把allData转换成索引表，方便查找，并附加状态信息
                 * —— indexData
                 * {1: {index: 1, isSelected: true}, 2: {index: 2, isDisabled: true}}
                 *
                 * @override
                 */
                adaptData: function () {
                    // 适配id/value的值
                    u.each(
                        this.datasource,
                        function (item) {
                            item.id = item.id || item.value;
                        }
                    );
                    this.allData = lib.deepClone(this.datasource);
                    // 先构建indexData，把数据源里的选择状态清除
                    var indexData = {};
                    u.each(this.allData, function (item, index) {
                        indexData[item.id] = {index: index, isSelected: item.isSelected};
                    });

                    // 把选择状态merge进indexData的数据项中
                    var selectedData = this.selectedData || [];
                    // 单选模式
                    if (!this.multi) {
                        // 如果不是数组，这个值就是id
                        if (!u.isArray(selectedData)) {
                            this.currentSelectedId = selectedData;
                            selectedData = [{id: selectedData}];
                        }
                        // 如果是数组，保存第一个值为当前选值
                        else if (selectedData.length) {
                            this.currentSelectedId = selectedData[0].id || selectedData[0];
                        }
                    }

                    u.each(selectedData, function (item, index) {
                        var id = item.id !== undefined ? item.id : item;
                        // 有可能出现已选的数据在备选中已经被删除的情况
                        if (indexData[id] !== undefined) {
                            indexData[id].isSelected = true;
                        }
                    });

                    var disabledData = this.disabledData || [];
                    u.each(disabledData, function (item, index) {
                        var id = item.id !== undefined ? item.id : item;
                        if (indexData[id] !== undefined) {
                            indexData[id].isDisabled = true;
                        }
                    });

                    this.indexData = indexData;

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

                    return {
                        allData: this.allData,
                        indexData: this.indexData
                    };
                },

                /**
                 * 更新备选区
                 *
                 * @override
                 */
                refreshContent: function () {
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
                        htmlArray.push(this.createTableHead());
                    }
                    htmlArray.push(this.createTableContent(data));

                    var queryList = this.getQueryList();
                    // 选择状态当使用手动触发时，panel的content属性并不会同步更改，
                    // 如果此时新的content恰好与初始的content相同，则panel不会重置
                    // 因此现执行一下置空
                    queryList.setContent('');
                    queryList.setContent(htmlArray.join(''));
                },

                /**
                 * 创建表头
                 *
                 * @public
                 * @return {string} 表头html
                 */
                createTableHead: function () {
                    var tableClass = this.helper.getPartClassName('head-table');
                    var tableId = this.helper.getId('head-table');
                    var tpl = ['<table border=0 class="' + tableClass + '" id="' + tableId + '"><tr>'];
                    var colmNum = this.fields.length;
                    // 绘制表头th
                    for (var i = 0; i < colmNum; i++) {
                        var field = this.fields[i];
                        tpl.push(''
                            + '<th class="th' + i + '"'
                            + ' style="width:' + field.width + 'px;">'
                            + field.title || ''
                            + '</th>'
                        );
                    }
                    // 最后一列用来装箭头
                    tpl.push('<th></th>');
                    tpl.push('</tr></table>');
                    return tpl.join(' ');
                },

                rowTpl: '<tr id="${rowId}" class="${rowClass}" index="${index}">${content}</tr>',

                /**
                 * 创建表格体
                 *
                 * @param {Object} data 绘制的内容
                 * @return {string}
                 * @ignore
                 */
                createTableContent: function (data) {
                    var indexData = this.indexData;
                    var helper = this.helper;

                    var tableClasses = helper.getPartClassName('content-table');
                    var tableId = helper.getId('content-table');
                    var tpl = ['<table border=0 class="' + tableClasses + '" id="' + tableId + '">'];
                    var baseRowClasses = helper.getPartClassName('row');
                    var selectedRowClasses = helper.getPartClassName('row-selected');
                    var disabledRowClasses = helper.getPartClassName('row-disabled');

                    // 绘制内容
                    u.each(
                        data,
                        function (item, index) {
                            var rowClasses = [baseRowClasses];
                            var indexItem = indexData[item.id];
                            if (indexItem.isSelected) {
                                rowClasses.push(selectedRowClasses);
                            }
                            if (indexItem.isDisabled) {
                                rowClasses.push(disabledRowClasses);
                            }
                            tpl.push(
                                lib.format(
                                    this.rowTpl,
                                    {
                                        rowId: this.helper.getId('row-' + item.id),
                                        rowClass: rowClasses.join(' '),
                                        index: indexItem.index,
                                        content: createRow(this, item, index)
                                    }
                                )
                            );
                        },
                        this
                    );
                    tpl.push('</table>');
                    return tpl.join(' ');
                },

                /**
                 * 点击行为分发器
                 *
                 * @param {Event} e 事件对象
                 * @ignore
                 */
                eventDispatcher: function (e) {
                    var tar = e.target;
                    var helper = this.helper;
                    var rowClasses = helper.getPartClassName('row');
                    var actionClasses = helper.getPartClassName('row-action-icon');

                    while (tar && tar !== document.body) {
                        var rowDOM;
                        // 有图标的事件触发在图标上
                        if (this.hasIcon
                            && this.fireOnIcon
                            && lib.hasClass(tar, actionClasses)) {
                            rowDOM = tar.parentNode;
                        }
                        else {
                            if (lib.hasClass(tar, rowClasses)) {
                                rowDOM = tar;
                            }
                        }
                        if (rowDOM) {
                            this.operateRow(rowDOM);
                            return;
                        }

                        tar = tar.parentNode;
                    }
                },

                // 可重写
                operateRow: function (row) {
                    var disabledClasses = this.helper.getPartClassName('row-disabled');
                    if (lib.hasClass(row, disabledClasses)) {
                        return;
                    }
                    var index = parseInt(row.getAttribute('index'), 10);
                    var item = this.allData[index];
                    if (!item) {
                        return;
                    }

                    if (this.mode === 'add') {
                        actionForAdd(this, row, item);
                    }
                    else if (this.mode === 'delete') {
                        actionForDelete(this, row, item);
                    }
                    else if (this.mode === 'load') {
                        actionForLoad(this, row, item);
                    }
                },

                /**
                 * 选择全部
                 * 如果当前处于搜索状态，那么只把搜索结果中未选择的选过去
                 *
                 * @public
                 */
                selectAll: function () {
                    var data = this.isQuery() ? this.queriedData : this.allData;
                    var control = this;
                    u.each(data, function (item) {
                        selectItem(control, item.id, true);
                    });
                    this.fire('add');
                    this.fire('change');
                },

                /**
                 * 批量更新选择状态，
                 * 用于外部调用，因此不触发事件
                 *
                 * @param {Array} items 需要更新的对象集合或id集合
                 * @param {boolean} toBeSelected 要选择还是取消选择
                 * @override
                 */
                selectItems: function (items, toBeSelected) {
                    var indexData = this.indexData;
                    var control = this;
                    u.each(items, function (item) {
                        var id = item.id !== undefined ? item.id : item;
                        var itemIndex = indexData[id];
                        if (itemIndex !== null && itemIndex !== undefined) {
                            // 更新状态，但不触发事件
                            selectItem(control, id, toBeSelected);
                        }
                    });
                },

                /**
                 * 删除全部
                 *
                 * @FIXME 删除全部要区分搜索和非搜索状态么
                 * @override
                 */
                deleteAll: function () {
                    var items = u.clone(this.datasource);
                    this.set('datasource', []);
                    this.fire('delete', {items: items});
                    this.fire('change');
                },

                /**
                 * 搜索含有关键字的结果，更新显示区域内容
                 *
                 * 可重写
                 *
                 * @param {Array} filters 过滤参数
                 * @public
                 */
                queryItem: function (filters) {
                    // 查找过滤 [{ keys: ['xxx', 'yyy'], value: 'xxx' }]
                    filters = filters || [];

                    this.queriedData = this.findQueriedData(filters);

                    this.afterQueryHandler();
                },

                /**
                 * 搜索含有关键字的结果，默认以name为目标搜索
                 *
                 * @param {Array} filters 过滤参数
                 * @return {Array.<Object>}
                 * @protected
                 */
                findQueriedData: function (filters) {
                    // 判断数据的某个field是命中
                    function checkHitByFilterItem(field, expectValue, data) {
                        var hit = false;
                        // 只有字符串类去空格
                        if (typeof expectValue === 'string') {
                            expectValue = lib.trim(expectValue);
                        }

                        var config = {
                            isPartial: this.fieldsIndex[field].searchScope === 'partial',
                            caseSensitive: this.fieldsIndex[field].caseSensitive
                        };

                        if (util.compare(data[field], expectValue, config)) {
                            hit = true;
                        }
                        return hit;
                    }

                    // 判断行数据是否符合过滤要求
                    function checkRowHit(data, index) {
                        return !u.any(
                            filters,
                            function (filter) {
                                var searchFields = [];
                                // keys未定义，则默认选择通过field指定的并集
                                if (filter.keys === undefined) {
                                    searchFields = this.defaultSearchFields;
                                }
                                else {
                                    searchFields = filter.keys;
                                }
                                return !u.any(
                                    searchFields,
                                    function (searchField) {
                                        // 命中一个就算命中
                                        return checkHitByFilterItem.call(this, searchField, filter.value, data);
                                    },
                                    this
                                );
                            },
                            this
                        );
                    }

                    return u.filter(
                        this.allData,
                        checkRowHit,
                        this
                    );
                },

                afterQueryHandler: function () {
                    // 更新状态
                    this.addState('queried');
                    this.refreshContent();
                },

                /**
                 * 清空搜索的结果
                 *
                 */
                clearData: function () {
                    // 清空数据
                    this.queriedData = [];
                },

                /**
                 * add(load)型：或许当前选择状态的数据
                 * delete型：获取全部数据
                 *
                 * @return {Object}
                 * @public
                 */
                getSelectedItems: function () {
                    var rawData = this.datasource;
                    var indexData = this.indexData;
                    var mode = this.mode;
                    if (mode === 'delete') {
                        return this.allData;
                    }
                    var selectedData = u.filter(rawData, function (item, index) {
                        return indexData[item.id].isSelected;
                    });
                    return selectedData;
                },

                /**
                 * @override
                 */
                getSelectedItemsFullStructure: function () {
                    return this.getSelectedItems();
                },

                /**
                 * 获取当前状态的显示个数
                 *
                 * @return {number}
                 * @override
                 */
                getCurrentStateItemsCount: function () {
                    var data = this.isQuery() ? this.queriedData : this.allData;
                    data = data || [];
                    return data.length;
                }
            }
        );

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

                var textContent = field.textContent ? field.textContent.call(control, item, index, i) : innerHTML;

                // IE不支持tr.innerHTML，所以这里要使用insertCell
                if (tr) {
                    var td = tr.insertCell(i);
                    td.style.width = field.width + 'px';
                    td.title = textContent;
                    td.innerHTML = innerHTML;
                }
                else {
                    var contentHtml = ''
                        + '<td class="' + fieldClasses
                        + '" title="' + textContent
                        + '" style="width:' + field.width + 'px;">'
                        + innerHTML
                        + '</td>';
                    html.push(contentHtml);
                }
                cursor++;
            });

            // 最后一列添加箭头
            var arrowClasses = control.helper.getPartClassName('row-action-icon')
                + ' ' + control.helper.getIconClass();
            var arrowHTML = '<span class="' + arrowClasses + '"></span>';
            if (tr) {
                var td = tr.insertCell(cursor);
                td.innerHTML = arrowHTML;
            }
            else {
                html.push('<td>' + arrowHTML + '</td>');
                return html.join(' ');
            }
        }

        function actionForAdd(control, row, item) {
            var selectedClasses = control.helper.getPartClassName('row-selected');
            var fire = false;
            var eventArgs = {item: item, status: 1};
            // 点击已选中的，在单选模式下，执行取消选择
            if (lib.hasClass(row, selectedClasses)) {
                if (control.allowUnselectNode) {
                    selectItem(control, item.id, false);
                    fire = true;
                    eventArgs.status = -1;
                }
            }
            else {
                selectItem(control, item.id, true);
                fire = true;
            }

            if (fire) {
                // 需要增加上一个参数，因为有的时候需要了解当前操作的对象是什么
                control.fire('add', eventArgs);
                control.fire('change');
            }
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
            // 如果是单选，需要将其他的已选项置为未选
            if (!control.multi) {
                // 移除原有选项
                unselectCurrent(control);
                // 赋予新值
                control.currentSelectedId = toBeSelected ? id : null;
            }
            updateSingleItemStatus(control, id, toBeSelected);
        }

        // 撤销选择当前项
        function unselectCurrent(control) {
            var curId = control.currentSelectedId;
            // 撤销当前选中项
            updateSingleItemStatus(control, curId, false);
            control.currentSelectedId = null;
        }

        /**
         * 更新单个结点状态
         *
         * @param {ui.TableRichSelector} control 类实例
         * @param {string} id 结点数据id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @ignore
         */
        function updateSingleItemStatus(control, id, toBeSelected) {
            var indexItem = control.indexData[id];
            if (!indexItem) {
                return;
            }
            indexItem.isSelected = toBeSelected;
            var itemDOM = control.helper.getPart('row-' + id);
            var changeClass = toBeSelected ? lib.addClass : lib.removeClass;
            changeClass(
                itemDOM,
                control.helper.getPartClassName('row-selected')
            );
        }

        /**
         * 下面的方法专属delete型table
         *
         * @param {Object} control table
         * @param {DOMElement} row 行DOM
         * @param {Object} item 要删除的item
         */
        function actionForDelete(control, row, item) {
            deleteItem(control, item.id);
            // 外部需要知道什么数据被删除了
            control.fire('delete', {items: [item]});
            control.fire('change');
        }

        /**
         * 删除选择的节点
         *
         * @param {ui.TableRichSelector} control 类实例
         * @param {number} id 结点数据id
         *
         * @ignore
         */
        function deleteItem(control, id) {
            // 完整数据
            var indexData = control.indexData;
            var index = indexData[id].index;

            var newData = [].slice.call(control.datasource, 0);
            newData.splice(index, 1);

            control.set('datasource', newData);
        }

        function actionForLoad(control, row, item) {
            var selectedClasses = control.helper.getPartClassName('row-selected');
            // 点击未选中的，执行
            if (!lib.hasClass(row, selectedClasses)) {
                selectItem(control, item.id, true);
                control.fire('load', {item: item});
                control.fire('change');
            }
        }

        esui.register(TableRichSelector);
        return TableRichSelector;
    }
);
