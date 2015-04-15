/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 树形选择控件
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        require('esui/Tree');
        var ui = require('esui/main');
        var lib = require('esui/lib');


        var u = require('../util');
        var RichSelector = require('./RichSelector');
        var TreeStrategy = require('./SelectorTreeStrategy');

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
        exports.type = 'TreeRichSelector';

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
                // 是否隐藏根节点
                hideRoot: true,
                // 节点状态切换时，父子节点是否需要同步状态
                // 有些需求场景是，父子节点除了概念上的从属关系外，交互上没有任何关联
                // 选择父节点不代表其下的子节点全被选中；选择全部子节点也不代表父节点选中
                needSyncParentChild: true,
                // 树样式
                treeVariants: 'icon angle hoverable'
            };

            lib.extend(properties, options);

            u.parseBoolean(properties);

            this.$super([properties]);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.$super(arguments);

            lib.addClass(
                this.main,
                this.helper.getPrefixClass('treerichselector')
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
            var selectedData = [];
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
            this.allData = u.deepClone(this.datasource);
            // 一个扁平化的索引
            // 其中包含父节点信息，以及节点选择状态
            var indexData = {};
            if (this.allData && this.allData.children) {
                this.walkTree(
                    this.allData,
                    this.allData.children,
                    function (parent, child) {
                        indexData[child.id] = {
                            parentId: parent.id,
                            node: child,
                            isSelected: false
                        };
                        if (child.hasOwnProperty('isSelected')) {
                            indexData[child.id].isSelected = child.isSelected;
                        }
                        if (indexData[child.id].isSelected === true) {
                            selectedData.push(child);
                        }
                    }
                );
            }
            this.indexData = indexData;

            return {
                indexData: indexData,
                selectedData: selectedData
            };
        };

        /**
         * @override
         */
        exports.processDataAfterRefresh = function (adaptedData) {
            // 用这个数据结构更新选择状态
            if (this.mode !== 'delete') {
                this.selectItems(adaptedData.selectedData, true);
            }
        };

        /**
         * 刷新备选区
         * @override
         */
        exports.refreshContent = function () {
            var treeData = this.isQuery() ? this.queriedData : this.allData;
            if (!treeData || !treeData.children || !treeData.children.length) {
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
                var options = {
                    childName: 'tree',
                    datasource: treeData,
                    allowUnselectNode: this.allowUnselectNode,
                    strategy:
                        new TreeStrategy(
                            {
                                mode: this.mode,
                                onlyLeafSelect: this.onlyLeafSelect,
                                orientExpand: this.orientExpand
                            }
                        ),
                    wideToggleArea: this.wideToggleArea,
                    hideRoot: this.hideRoot,
                    selectMode: this.multi ? 'multiple' : 'single',
                    variants: this.treeVariants
                };
                if (this.getItemHTML) {
                    options.getItemHTML = this.getItemHTML;
                }
                if (this.itemTemplate) {
                    options.itemTemplate = this.itemTemplate;
                }
                tree = ui.create('Tree', options);
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
                        // control.setItemState(e.node.id, 'isSelected', false);
                        control.handlerAfterClickNode(e.node);
                    }
                );
            }
            else {
                tree.setProperties({
                    'datasource': u.deepClone(treeData),
                    'keyword': this.getKeyword()
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
            var datasource = u.deepClone(this.datasource);
            var indexData = this.indexData;
            this.walkTree(datasource, datasource.children, function (parent, child) {
                child.isSelected = indexData[child.id].isSelected;
            });

            return datasource;
        };

        /**
         * 点击触发，选择或删除节点
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
            var stateNode = this.getStateNode(item.node.id);
            var toBeSelected = true;
            if (stateNode.isSelected && this.allowUnselectNode) {
                toBeSelected = false;
            }
            this.setItemState(item.node.id, 'isSelected', toBeSelected);
            // 如果是单选，需要将其他的已选项置为未选
            if (!this.multi) {
                // 如果以前选中了一个，要取消选择
                // 节点的状态切换Tree控件会完成，因此无需这里手动unselect
                if (this.currentSeletedId) {
                    this.setItemState(this.currentSeletedId, 'isSelected', !toBeSelected);
                }
                // 赋予新值
                if (toBeSelected) {
                    this.currentSeletedId = item.node.id;
                }
            }
            // 多选同步父子状态
            else {
                trySyncParentAndChildrenStates(this, item, toBeSelected);
            }
            this.fire('add', {item: item.node});
            this.fire('change');
        };

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
         * 撤销选择当前项
         * @param {ui.TreeRichSelector} control 类实例
         * @ignore
         */
        function unselectCurrent(control) {
            var curId = control.currentSeletedId;
            // 撤销当前选中项
            if (curId) {
                var treeList = control.getQueryList().getChild('tree');
                treeList.unselectNode(curId);
                control.currentSeletedId = null;
            }
        }

        /**
         * 添加全部
         *
         * @override
         */
        exports.selectAll = function () {
            var data = this.isQuery() ? this.queriedData : this.allData;
            var children = data.children;
            var control = this;
            this.walkTree(
                data,
                children,
                function (parent, child) {
                    selectItem(control, child.id, true);
                }
            );
            this.fire('add');
            this.fire('change');
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
         * 同步一个节点的父节点选择状态
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} item 保存在indexData中的item
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         */
        function trySyncChildrenStates(control, item, toBeSelected) {
            var indexData = control.indexData;
            var node = item.node;
            // 如果选的是父节点，子节点也要连带选上
            var children = node.children || [];
            u.each(children, function (child) {
                selectItem(control, child.id, toBeSelected);
                trySyncChildrenStates(control, indexData[child.id], toBeSelected);
            });
        }

        /**
         * 同步一个节点的子节点选择状态
         * @param {ui.TreeRichSelector} control 类实例
         * @param {Object} item 保存在indexData中的item
         * @param {boolean} toBeSelected 目标状态 true是选择，false是取消
         */
        function trySyncParentStates(control, item, toBeSelected) {
            var indexData = control.indexData;
            // 选的是子节点，判断一下是不是全部选择了，全部选择了，也要勾上父节点
            var parentId = item.parentId;
            var parentItem = indexData[parentId];

            if (parentItem) {
                var brothers = parentItem.node.children || [];
                var allSelected = !u.find(
                    brothers,
                    function (brother) {
                        return !control.getItemState(brother.id, 'isSelected');
                    }
                );
                selectItem(control, parentId, allSelected);
                trySyncParentStates(control, parentItem, allSelected);
            }
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
                control.setProperties({datasource: control.allData});
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
            if (!this.allData) {
                return [];
            }
            var selectedItems = [];
            var control = this;
            this.walkTree(
                this.allData,
                this.allData.children,
                function (parent, child) {
                    if (control.mode === 'delete' || control.getStateNode(child.id).isSelected) {
                        selectedItems.push(child);
                    }
                }
            );

            return selectedItems;
        };


        /**
         * 获取当前已选择的数据的树形结构
         *
         * @return {Object}
         * @public
         */
        exports.getSelectedTree = function () {
            var control = this;
            // clone完整数据，这个数据是原始的，不带最新选择状态的
            var copyData = u.deepClone(this.allData);
            // 遍历树，把各个节点的children更新成只包含已选状态节点的
            this.walkTree(
                copyData,
                copyData.children,
                function (parent, child) {
                    var selectedChildren = getSelectedNodesUnder(child, control);
                    if (selectedChildren.length) {
                        child.children = selectedChildren;
                    }
                    else {
                        child.children = null;
                    }
                }
            );
            // 最外层再处理一下
            copyData.children = u.filter(copyData.children, function (node) {
                // 可能是叶子节点
                return node.children || control.indexData[node.id].isSelected;
            });
            return copyData;
        };


        /**
         * @override
         */
        exports.getSelectedItemsFullStructure = function () {
            return this.getSelectedTree();
        };

        function getSelectedNodesUnder(parentNode, control) {
            var children = parentNode.children;
            return u.filter(
                children,
                function (node) {
                    return this.getItemState(node.id, 'isSelected');
                },
                control
            );

        }

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
            }
            return false;
        };

        /**
         * 清空搜索的结果
         *
         */
        exports.clearData = function () {
            // 清空数据
            this.queriedData = {};
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
            filteredTreeData = queryFromNode(keyword, this.allData);
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
                    if (data.text.indexOf(keyword) !== -1) {
                        filteredData = u.clone(data);
                    }

                    if (data.children && data.children.length) {
                        var filteredChildren = queryFromNode(keyword, data);
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
                }
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
                    this.walkTree(child, child.children, callback);
                },
                this
            );
        };

        function isLeaf(node) {
            return !node.children;
        }

        /**
         * 获取当前列表的结果个数
         *
         * @return {number}
         * @public
         */
        exports.getFilteredItemsCount = function () {
            var node = this.isQuery() ? this.queriedData : this.allData;
            var count = getChildrenCount(this, node, true);
            return count;
        };


        /**
         * 获取当前状态的显示个数
         *
         * @return {number}
         * @override
         */
        exports.getCurrentStateItemsCount = function () {
            var node = this.isQuery() ? this.queriedData : this.allData;
            if (!node) {
                return 0;
            }
            var count = getChildrenCount(this, node, true);
            return count;
        };

        function getChildrenCount(control, node, onlyLeaf) {
            var count = 1;
            // 是叶子节点，但不是root节点
            if (onlyLeaf) {
                if (isLeaf(node)) {
                    // FIXME: 这里感觉不应该hardcode，后期想想办法
                    if (!node.id || node.id === getTopId(control)) {
                        return 0;
                    }
                    return 1;
                }
                // 如果只算叶子节点，父节点那一个不算数，从0计数
                count = 0;
            }
            else {
                // 顶级节点不算
                if (node.id === getTopId(control)) {
                    count = 0;
                }
            }

            count += u.reduce(
                node.children,
                function (sum, child) {
                    return sum + getChildrenCount(control, child, onlyLeaf);
                },
                0
            );
            return count;
        }

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
