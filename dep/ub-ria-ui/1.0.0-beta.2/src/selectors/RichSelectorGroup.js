/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 富选择控件组合
 * @exports RichSelectorGroup
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var eoo = require('eoo');
        var InputControl = require('esui/InputControl');
        var esui = require('esui');
        var painters = require('esui/painters');

        function traverseList(tree, getter) {
            var children = u.map(
                tree,
                function (node) {
                    return traverseTree(node, getter);
                }
            );

            return children;
        }

        function traverseTree(tree, getter) {
            if (u.isArray(tree)) {
                tree = traverseList(tree, getter);
            }
            else if (u.isObject(tree) && tree) {
                tree = getter(tree);

                if (tree && tree.children) {
                    tree.children = traverseList(tree.children, getter);
                }
            }

            return tree;
        }

        /**
         * 富选择控件组合一或两个富选择控件组成，支持单控件选择或左右控件互选
         *
         * 左右选择控件的类型以及配置由使用者通过模板自行定义
         *
         * ```
         * <div
         *   data-ui-type="CascadingRichSelector"
         *   data-ui-id="cas-slots"
         *   data-ui-name="cas-slots">
         *   <esui-table-rich-selector
         *       data-ui-child-name="source"
         *       data-ui-title="全部有效代码位"
         *       data-ui-has-head="true"
         *       data-ui-has-search-box="true"
         *       data-ui-need-batch-action="true"
         *      data-ui-batch-action-label="选择全部">
         *   </esui-table-rich-selector>
         *   <esui-table-rich-selector
         *       data-ui-child-name="target"
         *       data-ui-title="已选择代码位"
         *       data-ui-mode="delete"
         *       data-ui-need-batch-action="true"
         *       data-ui-batch-action-label="删除全部"
         *       data-ui-empty-text="请从左侧选择要添加的代码位">
         *   </esui-table-rich-selector>
         * </div>
         *
         * ```
         * 选择控件必须配置childName，'source'代表源选择器，'target'代表目标选择器
         *
         * @class RichSelectorGroup
         * @extends esui.InputContro;
         */
        var RichSelectorGroup = eoo.create(
            InputControl,
            {

                /**
                 * @override
                 */
                type: 'RichSelectorGroup',

                getCategory: function () {
                    return 'input';
                },

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 取值时，如果父节点选中，是否向下展开取子孙节点的值
                        isValueExpand: true
                    };

                    u.extend(properties, options);
                    this.$super([properties]);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    this.helper.initChildren();
                },

                /**
                 * @override
                 */
                initEvents: function () {

                    var filter = this.getChild('filter');
                    var source = this.getChild('source');
                    var target = this.getChild('target');

                    // 绑事件
                    filter && filter.on('load', this.fire.bind(this, 'load'));

                    source && source.on(
                        'add',
                        function (e) {
                            syncLeftRight.call(this);
                        },
                        this
                    );

                    target && target.on(
                        'delete',
                        function (e) {
                            source && source.selectItems(e.items, false);
                            this.fire('delete');
                            this.fire('change');
                        },
                        this
                    );
                },

                /**
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'rawValue',
                        paint: function (me, rawValue) {
                            if (!u.isEmpty(rawValue)) {
                                var source = me.getChild('source');
                                var target = me.getChild('target');
                                // 先设置左边，再同步右边
                                source.setProperties({selectedData: rawValue});
                                syncLeftRight.call(me);
                            }
                        }
                    },
                    {
                        name: 'disabled',
                        paint: function (me, disabled) {
                            if (disabled) {
                                me.helper.disableChildren();
                            }
                            else {
                                me.helper.enableChildren();
                            }
                        }
                    }
                ),

                getRealTargetSelector: function () {
                    var source = this.getChild('source');
                    var target = this.getChild('target');
                    if (target) {
                        return target;
                    }
                    return source;
                },

                getValue: function () {
                    return this.getRealTargetSelector().getValue();
                },

                getRawValue: function () {
                    var rawValue = [];
                    var source = this.getChild('source');

                    // 如果是树控件，要根据this.isValueExpand来取值
                    if (/^Tree/.test(source.type) && u.isFunction(source.getSelectedTree)) {
                        var selectedTree = source.getSelectedTree();
                        var me = this;
                        traverseTree(
                            selectedTree,
                            function (node) {
                                var isSelected = source.getItemState(node.id, 'isSelected');
                                var isSomeSelected = source.getItemState(node.id, 'isSomeSelected');
                                // 节点选中或者有子节点选中，否则没必要搞下去了
                                if (isSelected || isSomeSelected) {
                                    // 判断是否要展开处理
                                    var isValueExpand = me.isValueExpand;
                                    if (u.isFunction(isValueExpand)) {
                                        isValueExpand = isValueExpand(node);
                                    }
                                    // 如果当前节点非叶节点，且允许展开或部分选中
                                    // 则返回该节点继续递归
                                    if ((isValueExpand || isSomeSelected) && !u.isEmpty(node.children)) {
                                        return node;
                                    }
                                    // 否则只需要取当前节点值
                                    else if (isSelected) {
                                        rawValue.push(u.omit(node, 'children'));
                                    }
                                }
                            }
                        );
                    }
                    else {
                        var target = this.getRealTargetSelector();
                        rawValue = target.getRawValue();
                    }

                    return u.map(
                        rawValue,
                        function (item) {
                            return item.id || item.value;
                        }
                    );
                },

                /**
                 * 进行验证
                 *
                 * @return {boolean}
                 */
                validate: function () {
                    var target = this.getRealTargetSelector();

                    if (typeof target.validate === 'function') {
                        return target.validate();
                    }
                }
            }
        );

        function syncLeftRight() {
            var source = this.getChild('source');
            var target = this.getChild('target');

            var newdata = source.getSelectedItemsFullStructure();
            // 把所有节点的isSelected置false后传给另一个控件
            newdata = traverseTree(
                newdata,
                function (node) {
                    var newNode = u.clone(node);
                    newNode.isSelected = false;
                    return newNode;
                }
            );
            target && target.setProperties({datasource: newdata});
            this.fire('add');
            this.fire('change');
        }

        esui.register(RichSelectorGroup);
        return RichSelectorGroup;
    }
);
