/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 带加载更多的树选择控件
 * @author chenhaoyin(chenhaoyin@baidu.com)
 */

define(
    function (require) {
        require('./PagingTree');
        var ui = require('esui/main');
        var lib = require('esui/lib');

        var u = require('underscore');
        var util = require('../helper/util');
        var RichSelector = require('./RichSelector');
        var TreeStrategy = require('./PagingSelectorTreeStrategy');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        var exports = {};

        /**
         * 控件类型，始终为`"TreeRichSelector"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'PagingTreeRichSelector';

        /**
         * @override
         */
        exports.styleType = 'RichSelector';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {
                // 数据源
                datasource: null,
                // 定向展开配置开关，true则可以根据需要默认展开指定的节点
                orientExpand: false,
                // 全节点点击触发展开的配置开关
                wideToggleArea: false,
                // 是否只允许选择叶子节点
                onlyLeafSelect: true,
                // 是否允许反选
                allowUnselectNode: false,
                // 是否隐藏根节点
                hideRoot: true,
                // 节点状态切换时，父子节点是否需要同步状态
                needSyncParentChild: true
            };

            lib.extend(properties, options);

            if (properties.onlyLeafSelect === 'false') {
                properties.onlyLeafSelect  = false;
            }

            if (properties.orientExpand === 'false') {
                properties.orientExpand  = false;
            }

            if (properties.hideRoot === 'false') {
                properties.hideRoot  = false;
            }

            if (properties.wideToggleArea === 'false') {
                properties.wideToggleArea  = false;
            }

            // multi 这东西本来是在基类里面定义的，但是因为有特殊处理情境，这里先处理下
            // 如果是单选的，那一定只能选择叶子节点
            // (也可能遇到那种选了父节点并不代表叶子节点全选的奇葩需求，那就请自行创建一个控件吧。。。)
            if (properties.multi === 'false') {
                properties.multi = false;
            }

            /*
            if (properties.multi === false) {
                properties.onlyLeafSelect = true;
            }
            */

            if (properties.needSyncParentChild === 'false') {
                properties.needSyncParentChild  = false;
            }

            if (properties.caseSensitive === 'false') {
                properties.caseSensitive = false;
            }

            this.$super([properties]);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.$super(arguments);

            lib.addClasses(
                this.main,
                ['ui-paging-tree-richselector', 'ui-tree-richselector']
            );

            if (this.onlyLeafSelect) {
                this.addState('only-leaf-selectable');
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
            RichSelector.prototype.repaint,
            {
                name: 'datasource',
                paint: function (control, datasource) {
                    control.refresh();
                }
            },
            {
                name: 'selectedTree',
                paint: function (control, selectedTree) {
                    // 带加载更多的树，多选情况下，已选数据只有叶子的话不足以构建selectedTree
                    if (selectedTree) {
                        control.walkTree(selectedTree, selectedTree.children, function (parent, child) {
                            control.indexData[child.id] = {
                                parentId: parent.id,
                                node: child
                            };
                            if (!child.children || child.children.length === 0) {
                                control.selectedData.push(child);
                            }
                        });
                    }
                }
            },
            {
                name: 'selectedData',
                paint: function (control, selectedData) {
                    // 如果没有传selectedData，就别取消了。
                    if (selectedData == null) {
                        return;
                    }
                    // 先取消选择
                    var allData = control.allData;
                    if (allData && allData.children) {
                        var oldSelectedData = control.getSelectedItems();
                        control.selectItems(oldSelectedData, false);
                        control.selectItems(selectedData, true);
                        control.fire('add');
                        control.fire('change');
                    }
                }
            }
        );

        /**
         * 适配数据，创建一个全集扁平索引
         *
         * @param {ui.TreeRichSelector} treeForSelector 类实例
         * @return {Object} 包含`indexData`和`selectedData`两个属性
         * @ignore
         */
        exports.adaptData = function () {
            this.selectedData = this.selectedData || [];
            var isQuery = this.isQuery();
            /**
             * datasource的数据结构：
             * {
             *     id: -1,
             *     text: '全部',
             *     children: [
             *         {
             *             id: 1,
             *             text: '节点1',
             *             children: [],
             *             // 以下属性都可以自定义
             *             isSelected: true,
             *             ...
             *         }
             *         ...
             *     ]
             * }
             */
            var allData = this[isQuery ? 'queriedDatasource' : 'datasource'];
            this[isQuery ? 'queriedData' : 'allData'] = allData;
            this[isQuery ? 'queriedDataCount' : 'allDataCount'] = allData.children.totalCount;
            // 一个扁平化的索引
            // 其中包含父节点信息，以及节点选择状态
            var indexData = this.indexData || {};
            if (allData && allData.children) {
                u.each(
                    allData.children.results,
                    function (item) {
                        indexData[item.id] = {
                            parentId: allData.id,
                            node: item
                        };
                        if (item.hasOwnProperty('isSelected')) {
                            this.selectedData.push(item);
                        }
                    },
                    this
                );
            }
            this.indexData = indexData;

            return {
                indexData: indexData
            };
        };

        /**
         * @override
         */
        exports.processDataAfterRefresh = function (adaptedData) {
            // 用这个数据结构更新选择状态
            if (this.mode !== 'delete') {
                this.selectItems(this.selectedData, true);
            }
        };

        /**
         * 按条件搜索
         * 清空上次搜索结果，进行搜索
         *
         * @override
         */
        exports.search = function () {
            var searchBox = this.getSearchBox();
            this.keyword = lib.trim(searchBox.getValue());

            this.queriedData = [];
            this.queriedDatasource = {results: []};

            this.addState('queried');
            this.fire('search');
        };

        /**
         * 刷新备选区
         *
         * @override
         */
        exports.refreshContent = function () {
            var treeData = this.isQuery() ? this.queriedData : this.allData;
            if (!treeData
                || !treeData.children
                || !treeData.children.results.length) {
                this.addState('empty');
            }
            else {
                this.removeState('empty');
            }

            if (!treeData || !treeData.children) {
                return;
            }

            var queryList = this.getQueryList();
            var tree = queryList.getChild('tree');
            if (!tree) {
                var strategyConfig = {
                    mode: this.mode,
                    onlyLeafSelect: this.onlyLeafSelect,
                    orientExpand: this.orientExpand
                };

                if (this.isLeafNode) {
                    strategyConfig.isLeafNode = this.isLeafNode;
                }

                var options = {
                    childName: 'tree',
                    datasource: treeData,
                    allowUnselectNode: this.allowUnselectNode,
                    strategy: new TreeStrategy(strategyConfig),
                    wideToggleArea: this.wideToggleArea,
                    hideRoot: this.hideRoot,
                    selectMode: this.multi ? 'multiple' : 'single'
                };
                if (this.getItemHTML) {
                    options.getItemHTML = this.getItemHTML;
                }
                if (this.itemTemplate) {
                    options.itemTemplate = this.itemTemplate;
                }
                tree = ui.create('PagingTree', options);
                queryList.addChild(tree);
                tree.appendTo(queryList.main);

                var control = this;
                tree.on(
                    'selectnode',
                    function (e) {
                        var node = e.node;
                        control.handlerAfterClickNode(node);
                    }
                );

                tree.on(
                    'unselectnode',
                    function (e) {
                        control.setItemState(e.node.id, 'isSelected', false);
                    }
                );

                tree.on(
                    'loadmoredata',
                    function (e) {
                        control.fire('loadmoredata', e);
                    }
                );
            }
            else {
                tree.setProperties({
                    datasource: lib.deepClone(treeData),
                    keyword: this.getKeyword()
                });
            }
        };

        exports.getStateNode = function (id) {
            return this.indexData[id];
        };

        exports.getItemState = function (id, stateName) {
            if (this.indexData[id]) {
                var stateNode = this.getStateNode(id);
                return stateNode[stateName];
            }
            return null;
        };

        exports.setItemState = function (id, stateName, stateValue) {
            if (this.indexData[id]) {
                var stateNode = this.getStateNode(id);
                stateNode[stateName] = stateValue;
            }
        };

        exports.getDatasourceWithState = function () {
            var datasource = lib.deepClone(this.datasource);
            var indexData = this.indexData;
            this.walkTree(datasource, datasource.children.results, function (parent, child) {
                child.isSelected = indexData[child.id].isSelected;
            });

            return datasource;
        };

        /**
         * 点击触发，选择或删除节点
         *
         * @param {Object} node 节点对象
         * @ignore
         */
        exports.handlerAfterClickNode = function (node) {
            // 这个item不一定是源数据元，为了连锁同步，再取一遍
            var item = this.indexData[node.id];
            if (!item) {
                return;
            }

            if (this.mode === 'add') {
                this.actionForAdd(item);
            }
            else if (this.mode === 'delete') {
                this.actionForDelete(item);
            }
            else if (this.mode === 'load') {
                this.actionForLoad(item);
            }
        };

        /**
         * 添加动作
         *
         * @param {Object} item 保存在indexData中的item
         *
         */
        exports.actionForAdd = function (item) {
            var needFire = false;
            // 如果是单选，需要将其他的已选项置为未选
            if (!this.multi) {
                this.setItemState(item.node.id, 'isSelected', true);

                // 如果以前选中了一个，要取消选择
                // 节点的状态切换Tree控件会完成，因此无需这里手动unselect
                if (this.currentSeletedId != null) {
                    this.setItemState(this.currentSeletedId, 'isSelected', false);
                }
                // 赋予新值
                this.currentSeletedId = item.node.id;

                needFire = true;
            }
            // 多选同步父子状态
            else {
                // 多选情况下，如果该节点任意一个父节点为选中状态，该节点不可选
                var parentSelected = checkParentSelected.call(this, item);

                if (!parentSelected) {
                    this.setItemState(item.node.id, 'isSelected', true);
                    trySyncParentAndChildrenStates(this, item, true);
                    needFire = true;
                }
                else {
                    var tree = this.getQueryList().getChild('tree');
                    tree.unselectNode(item.node.id, true);
                }
            }

            if (needFire) {
                selectItem(this, item.node.id, true);
                this.fire('add', {item: item.node});
                this.fire('change');
            }
        };

        function checkParentSelected(node) {
            var parentNode = this.indexData[node.parentId];
            if (!parentNode) {
                return false;
            }
            if (this.getItemState(node.parentId, 'isSelected')) {
                return true;
            }
            if (!this.indexData[parentNode.parentId]) {
                return false;
            }
            return checkParentSelected.call(this, parentNode);
        }

        function addExpandedStatus(control, id) {
            var isQuery = control.isQuery();
            if (!isQuery) {
                control.expandedNode = control.expandedNode || [];
                control.expandedNode.push(id);
            }
        }

        exports.getExpandedNodes = function () {
            return this.expandedNode;
        };

        function addExpandedNodeStatus(control, id) {
            var tree = control.getQueryList().getChild('tree');
            tree.addExpandedNodeStatus(id);
        }

        /**
         * 选择或取消选择
         *   如果控件是单选的，则将自己置灰且将其他节点恢复可选
         *   如果控件是多选的，则仅将自己置灰
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} id 结点对象id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @ignore
         */
        function selectItem(control, id, toBeSelected) {
            var tree = control.getQueryList().getChild('tree');
            // 完整数据
            var indexData = control.indexData;
            var item = indexData[id];

            if (!item) {
                return;
            }

            // 如果是单选，需要将其他的已选项置为未选
            if (!control.multi && toBeSelected) {
                unselectCurrent(control);
                // 赋予新值
                control.currentSeletedId = id;

                control.selectedData = [item.node];
            }
            else {
                if (toBeSelected) {
                    if (!u.findWhere(control.selectedData, {id: item.node.id})) {
                        control.selectedData.push(item.node);
                    }
                }
                else {
                    control.selectedData = u.filter(control.selectedData, function (item) {
                        return item.id !== id;
                    });
                }
            }

            control.setItemState(id, 'isSelected', toBeSelected);

            if (toBeSelected) {
                tree.selectNode(id, true);
            }
            else {
                tree.unselectNode(id, true);
            }
        }

        /**
         * 展开结点数据
         *
         * @param {Object} datasource 节点下的数据
         * @param {string} targetId 结点id
         * @ignore
         */
        exports.expandDatasource = function (datasource, targetId) {
            this.adaptAppendData(datasource, targetId, 1);
            var queryList = this.getQueryList();
            var tree = queryList.getChild('tree');
            if (tree) {
                addExpandedStatus(this, targetId);
                tree.expandNode(targetId, datasource);
            }
            this.processDataAfterRefresh();
        };

        /**
         * 追加数据
         *
         * @param {Object} datasource 追加的数据
         * @param {string | undefined} targetId 追加的基准id，没有的话就是新的一次查询
         * @ignore
         */
        exports.appendDatasource = function (datasource, targetId) {
            // 追加
            if (targetId) {
                this.adaptAppendData(datasource, targetId, 0);

                var queryList = this.getQueryList();
                var tree = queryList.getChild('tree');
                if (tree) {
                    tree.appendDatasource(datasource, targetId);
                }
            }
            // 点击查询进来
            else {
                this.queriedDatasource = datasource;
                this.adaptData();
                this.refreshContent();
                this.refreshResult();
            }

            this.refreshHead();
            this.refreshFoot();
            this.processDataAfterRefresh();
        };

        /**
         * 适配追加的数据
         *
         * @param {Object} datasource 追加的数据
         * @param {number} targetId 标识结点Id
         * @param {number} searchType 0 标识结点后的数据。1 标识结点的子数据。
         * @ignore
         */
        exports.adaptAppendData = function (datasource, targetId, searchType) {
            var isQuery = this.isQuery();

            var indexData = this.indexData;

            u.each(datasource.results, function (item, index) {
                indexData[item.id] = {
                    isSelected: item.isSelected,
                    node: item,
                    parentId: searchType === 1 ? targetId : indexData[targetId].parentId
                };
            });

            var allData = this[isQuery ? 'queriedData' : 'allData'];

            this[isQuery ? 'queriedDataCount' : 'allDataCount'] = datasource.totalCount;

            // 追加情况
            if (targetId && allData && allData.children) {
                this.walkTree(
                    allData,
                    allData.children.results,
                    function (parent, child) {
                        if (child.id === targetId) {
                            if (searchType === 1) {
                                child.children = datasource;
                            }
                            else {
                                parent.children.moreFlag = datasource.moreFlag;
                                parent.children.results = parent.children.results.concat(datasource.results);
                                return false;
                            }
                        }
                    }
                );
            }

            // 关键字查询
            if (!targetId) {
                this.queriedData = datasource;
            }

            this.indexData = indexData;
        };

        /**
         * 撤销选择当前项
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @ignore
         */
        function unselectCurrent(control) {
            var curId = control.currentSeletedId;
            // 撤销当前选中项
            var treeList = control.getQueryList().getChild('tree');
            treeList.unselectNode(curId);
            control.currentSeletedId = null;
        }

        /**
         * 添加全部
         * 全选应该选中当前显示的所有根节点
         * 当这个节点是`disabled`的时候，选中该节点下所有子节点
         *
         * @override
         */
        exports.selectAll = function () {
            var data = this.isQuery() ? this.queriedData : this.allData;

            var toBeSelectItems = [];

            function selectItemsWithoutDisabled (nodes) {
                u.each(nodes, function (node) {
                    if (!node.disabled) {
                        toBeSelectItems.push(node);
                    }
                    else if (node.children) {
                        selectItemsWithoutDisabled(node.children.results);
                    }
                });
            }

            selectItemsWithoutDisabled(data.children.results);

            this.selectItems(toBeSelectItems, true);
            this.fire('add');
            this.fire('change');
        };

        exports.addExpandedNodesStatus = function (nodes) {
            u.each(
                nodes,
                function (item) {
                    addExpandedNodeStatus(this, item);
                },
                this
            );
        };

        /**
         * 批量选择或取消选择，供外部调用，不提供fire事件
         *
         * @param {Array} nodes 要改变状态的节点集合
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         * @override
         */
        exports.selectItems = function (nodes, toBeSelected) {
            var indexData = this.indexData;
            if (!indexData) {
                return;
            }
            var control = this;
            u.each(
                nodes,
                function (node) {
                    var id = node.id !== undefined ? node.id : node;
                    var item = indexData[id];
                    if (item != null && item !== undefined) {
                        // 更新状态，但不触发事件
                        selectItem(control, id, toBeSelected);
                        trySyncParentAndChildrenStates(control, item, toBeSelected);
                    }
                }
            );
        };

        /**
         * 同步一个节点的父节点和子节点选择状态
         * 比如：父节点选中与子节点全部选中的状态同步
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} item 保存在indexData中的item
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         */
        function trySyncParentAndChildrenStates(control, item, toBeSelected) {
            if (!control.needSyncParentChild) {
                return;
            }
            trySyncParentStates(control, item, toBeSelected);
            trySyncChildrenStates(control, item, toBeSelected);
        }

        /**
         * 同步一个节点的孩子节点选择状态
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} item 保存在indexData中的item
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         */
        function trySyncChildrenStates(control, item, toBeSelected) {
            var indexData = control.indexData;
            var selectedData = control.selectedData;

            // 如果选的是父节点，子节点要全部去掉
            u.each(selectedData, function (node) {
                var id = node.id;
                while (indexData[id] != null) {
                    if (indexData[id].parentId === item.node.id) {
                        selectItem(control, node.id, false);
                        return;
                    }
                    id = indexData[id].parentId;
                }
            });
        }

        /**
         * 同步一个节点的父节点选择状态
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} item 保存在indexData中的item
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         */
        function trySyncParentStates(control, item, toBeSelected) {
            // 分页控件子节点不会影响父节点
            return;
        }

        /**
         * 删除动作
         *
         * @param {Object} item 保存在indexData中的item
         *
         */
        exports.actionForDelete = function (item) {
            // 外部需要知道什么数据被删除了
            var event = this.fire('delete', {items: [item.node]});
            // 如果外面阻止了默认行为（比如自己控制了Tree的删除），就不自己删除了
            if (!event.isDefaultPrevented()) {
                deleteItem(this, item.node.id);
                this.fire('change');
            }
        };

        /**
         * 删除选择的节点
         *
         * @param {ui.TreeRichSelector} control 类实例
         * @param {number} id 结点数据id
         *
         * @ignore
         */
        function deleteItem(control, id) {
            // 完整数据
            var indexData = control.indexData;
            var item = indexData[id];

            var parentId = item.parentId;
            var parentItem = indexData[parentId];
            var node;
            if (!parentItem) {
                node = control.allData;
            }
            else {
                node = parentItem.node;
            }

            var children = node.children || [];

            // 从parentNode的children里删除
            var newChildren = u.without(children, item.node);
            // 没有孩子了，父节点也删了吧，遇到顶级父节点就不要往上走了，直接删掉
            if (newChildren.length === 0 && parentId !== getTopId(control)) {
                deleteItem(control, parentId);
            }
            else {
                node.children = newChildren;
                // datasource以引用形式分布下来，因此无需重新set了
                control.refresh();
            }
        }


        /**
         * 删除全部
         *
         * @FIXME 删除全部要区分搜索和非搜索状态么
         * @override
         */
        exports.deleteAll = function () {
            var event = this.fire('delete', {items: this.getSelectedItems()});
            // 如果外面阻止了默认行为（比如自己控制了Tree的删除），就不自己删除了
            if (!event.isDefaultPrevented()) {
                this.set('datasource', null);
                this.fire('change');
            }
        };

        /**
         * 加载动作
         *
         * @param {Object} item 保存在indexData中的item
         */
        exports.actionForLoad = function (item) {
            this.setItemState(item.node.id, 'isActive', true);
            // 如果以前选中了一个，要取消选择
            if (this.currentActiveId) {
                this.setItemState(this.currentActiveId, 'isActive', false);

                // load型树节点状态不是简单的“已选择”和“未选择”，还包含已激活和未激活
                // -- 选择状态中的节点不可以激活
                // -- 未选择状态的节点可以激活，激活后变成“已激活”状态，而不是“已选择”
                // -- 激活某节点时，其余“已激活”节点要变成“未激活”状态
                // 说了这么多，就是想说，我要自己把“已激活”节点要变成“未激活”状态。。。
                // 然后如果这个节点恰好是isSelected状态的，那则不许执行unselect操作
                if (!this.getStateNode(this.currentActiveId).isSelected) {
                    var tree = this.getQueryList().getChild('tree');
                    tree.unselectNode(this.currentActiveId, true);
                }
            }
            // 赋予新值
            this.currentActiveId = item.node.id;

            this.fire('load', {item: item.node});
            this.fire('change');
        };


        /**
         * 获取指定状态的叶子节点，递归
         *
         * @param {Array} data 检测的数据源
         * @param {boolean} isSelected 选择状态还是未选状态
         * @return {Array} 叶子节点
         * @ignore
         */
        exports.getLeafItems = function (data, isSelected) {
            data = data || (this.allData && this.allData.children) || [];
            var leafItems = [];
            var me = this;
            u.each(
                data,
                function (item) {
                    if (isLeaf(item)) {
                        var valid = (isSelected === this.getItemState(item.id, 'isSelected'));
                        // delete型的树没有“选择”和“未选择”的状态区别，所以特殊处理
                        if (me.mode === 'delete' || valid) {
                            leafItems.push(item);
                        }
                    }
                    else {
                        leafItems = u.union(
                            leafItems,
                            me.getLeafItems(item.children, isSelected)
                        );
                    }
                },
                this
            );

            return leafItems;
        };

        /**
         * 获取当前已选择数据的扁平数组结构
         *
         * @return {Array}
         * @public
         */
        exports.getSelectedItems = function () {
            return this.selectedData;
        };


        /**
         * 获取当前已选择的数据的树形结构
         *
         * @return {Object}
         * @public
         */
        exports.getSelectedTree = function () {
            var indexData = lib.deepClone(this.indexData);
            var selectedData = lib.deepClone(this.selectedData);

            var result = [];

            u.each(selectedData, function (item) {
                var nodeArray = [];
                nodeArray.unshift(indexData[item.id].node);

                var nodeItem = indexData[item.id];
                var parentNode = indexData[nodeItem.parentId];
                while (parentNode) {
                    nodeArray.unshift(parentNode.node);
                    parentNode = indexData[parentNode.parentId];
                }

                var parent = result;
                for (var i = 0; i < nodeArray.length; i++) {
                    var node = u.findWhere(parent, {id: nodeArray[i].id});
                    if (!node) {
                        nodeArray[i].children = (nodeArray[i].type === 1) ? null : [];
                        parent.push(nodeArray[i]);
                    }
                    parent = nodeArray[i].children;
                }
            });

            return {
                id: this.datasource.id,
                name: this.datasource.name,
                children: result
            };
        };

        /**
         * 清除搜索结果
         *
         * @return {boolean}
         * @ignore
         */
        exports.clearQuery = function () {
            this.$super(arguments);

            if (this.mode !== 'delete') {
                var selectedData = this.getSelectedItems();
                this.selectItems(selectedData, true);

                var expandedNodes = this.getExpandedNodes();
                this.addExpandedNodesStatus(expandedNodes);
            }
            return false;
        };

        /**
         * 清空搜索的结果
         *
         */
        exports.clearData = function () {
            // 清空数据
            this.queriedData = [];
            this.queriedDatasource = {results: []};
        };

        /**
         * 搜索含有关键字的结果
         *
         * @param {Array} filters 过滤参数
         */
        exports.queryItem = function (filters) {
            // Tree就只定位一个关键词字段
            var keyword = filters[0].value;
            var filteredTreeData = [];
            filteredTreeData = queryFromNode.call(this, keyword, this.allData);
            // 更新状态
            this.queriedData = {
                id: getTopId(this), text: '符合条件的结果', children: filteredTreeData
            };
            this.addState('queried');
            this.refreshContent();
            var selectedData = this.getSelectedItems();
            // 删除型的不用设置
            if (this.mode !== 'delete') {
                this.selectItems(selectedData, true);
            }
        };

        /**
         * 供递归调用的搜索方法
         *
         * @param {string} keyword 关键字
         * @param {Object} node 节点对象
         * @return {Array} 结果集
         */
        function queryFromNode(keyword, node) {
            var filteredTreeData = [];
            var treeData = node.children;
            u.each(
                treeData,
                function (data, key) {
                    var filteredData;
                    // 命中节点，先保存副本，之后要修改children

                    var config = {
                        caseSensitive: this.caseSensitive,
                        isPartial: true
                    };

                    if (util.compare(data.text, keyword, config)) {
                        filteredData = u.clone(data);
                    }

                    if (data.children && data.children.length) {
                        var filteredChildren = queryFromNode.call(this, keyword, data);
                        // 如果子节点有符合条件的，那么只把符合条件的子结点放进去
                        if (filteredChildren.length > 0) {
                            if (!filteredData) {
                                filteredData = u.clone(data);
                            }
                            filteredData.children = filteredChildren;
                        }
                        // 这段逻辑我还是留着吧，以防哪天又改回来。。。
                        // else {
                        //     // 如果命中了父节点，又没有命中子节点，则只展示父节点
                        //     if (filteredData) {
                        //         filteredData.children = [];
                        //     }
                        // }
                    }

                    if (filteredData) {
                        filteredTreeData.push(filteredData);
                    }
                },
                this
            );
            return filteredTreeData;
        }

        /**
         * 一个遍历树的方法
         *
         * @param {Object} parent 父节点
         * @param {Array} children 需要遍历的树的孩子节点
         * @param {Function} callback 遍历时执行的函数
         */
        exports.walkTree = function (parent, children, callback) {
            u.each(
                children,
                function (child, key) {
                    callback(parent, child);
                    var childrenCollection = child.children;
                    if (childrenCollection && childrenCollection.results) {
                        childrenCollection = childrenCollection.results;
                    }
                    this.walkTree(child, childrenCollection, callback);
                },
                this
            );
        };

        function isLeaf(node) {
            return !node.children;
        }

        /**
         * 获取当前状态的显示个数
         *
         * @return {number}
         * @override
         */
        exports.getCurrentStateItemsCount = function () {
            return this.isQuery() ? this.queriedDataCount : this.allDataCount;
        };

        /**
         * 获取顶级节点id
         *
         * @param {ui.TreeRichSelector} control 当前的控件实例
         * @return {number}
         */
        function getTopId(control) {
            return control.datasource.id;
        }

        var TreeRichSelector = require('eoo').create(RichSelector, exports);

        require('esui').register(TreeRichSelector);

        return TreeRichSelector;
    }
);
