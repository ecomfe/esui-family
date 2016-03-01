/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 分页树的数据交互策略类
 * @author chenhaoyin(chenhaoyin@baidu.com)
 */

define(
    function (require) {
        var lib = require('esui/lib');

        /**
         * 树的数据交互策略
         *
         * @class ui.SelectorTreeStrategy
         */
        var exports = {};

        /**
         * @constructs ui.SelectorTreeStrategy
         * @override
         * @param {Object=} options 初始化参数
         * @param {boolean=} options.defaultExpand 节点是否展开，默认为`false`
         */
        exports.constructor = function (options) {
            var defaults = {
                defaultExpand: false
            };
            lib.extend(this, defaults, options);
        };

        /**
         * 判断一个节点是否叶子节点
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         */
        exports.isLeafNode = function (node) {
            return !node.children || !node.children.length;
        };

        exports.hasMoreFlag = function (node) {
            return node.children && node.children.moreFlag;
        };

        /**
         * 判断一个节点是否应该展开
         *
         * @param {Object} node 节点数据项
         * @return {boolean}
         */
        exports.shouldExpand = function (node) {
            return this.defaultExpand;
        };

        /**
         * 开启展开/收起相关的策略
         *
         * @param {Tree} tree 控件实例
         * @protected
         */
        exports.enableToggleStrategy = function (tree) {
            tree.on(
                'expand',
                function (e) {
                    if (e.remote) {
                        tree.fire('loadmoredata', e);
                    }
                    else {
                        this.expandNode(e.node.id);
                    }
                    return;
                }
            );
            tree.on(
                'collapse',
                function (e) {
                    this.collapseNode(e.node.id, false);
                }
            );
        };

        /**
         * 启用策略
         *
         * @param {esui.Tree} tree 控件实例
         */
        exports.enableSelectStrategy = function (tree) {
            var treeStrategy = this;
            tree.on(
                'select',
                function (e) {
                    var canSelect = true;
                    var isLeafNode = treeStrategy.isLeafNode(e.node);
                    if (treeStrategy.mode !== 'load') {
                        // 只有叶子节点可以点的时候，其余节点都别点了
                        if (treeStrategy.onlyLeafSelect && !isLeafNode) {
                            canSelect = false;
                        }
                    }
                    // 加载型Tree不管你设置的是啥，都只能是也子节点可以点
                    else {
                        if (!isLeafNode) {
                            canSelect = false;
                        }
                    }

                    if (canSelect) {
                        this.selectNode(e.node.id);
                    }
                }
            );
            tree.on(
                'unselect',
                function (e) {
                    if (tree.get('allowUnselectNode')) {
                        tree.unselectNode(e.node.id);
                    }
                }
            );
        };

        var TreeStrategy = require('esui/TreeStrategy');
        var SelectorTreeStrategy = require('eoo').create(TreeStrategy, exports);

        return SelectorTreeStrategy;
    }
);
