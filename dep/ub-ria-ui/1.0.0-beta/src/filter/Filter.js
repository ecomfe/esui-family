/**
 * 过滤器
 * @file: FilterItem.js
 * @author: yaofeifei@baidu.com; liwei47@baidu.com
 *
 */

define(function (require) {
    var lib = require('esui/lib');
    var u = require('underscore');
    var Panel = require('esui/Panel');
    var eoo = require('eoo');

    require('esui/Panel');
    require('esui/Label');

    var exports = {};


    /**
     * FilterItem
     *
     * @extends Panel
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
    };

    exports.type = 'Filter';
    
    exports.datasource = [];

    /**
     * 初始化配置
     *
     * @protected
     * @override
     */
    exports.initOptions = function (options) {
        var me = this;
        var properties = {
            multiple: false,// 默认单选
            defaultFirst: false, //单选时 默认选择第一个
            custom: false,// 是否支持自定义
            customBtnLabel: '自定义'// 自定义按钮Label
        };
        u.extend(properties, options);

        this.setProperties(properties);

        if (this.multiple === 'false' || this.multiple === '0' || this.multiple === '') {
            this.multiple = false;
        }
        if (this.defaultFirst === 'false' || this.defaultFirst === '0' || this.defaultFirst === '') {
            this.defaultFirst = false;
        }
        if (this.custom === 'false' || this.custom === '0' || this.custom === '') {
            this.custom = false;
        }

        this.customElements = [];
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    exports.initStructure = function () {
        if (this.custom) {
            var me = this;
            u.forEach(this.main.childNodes, function (node) {
                if (node.nodeType === 1) {
                    me.customElements.push(node);
                }
            });
            if (!this.customElements.length) {
                var customTpl = '<div style="display:inline-block"><input type="text" style="width:50px"/>'
                    + '<input type="button" data-role="ok" value="确定"/><input type="button" data-role="cancel" value="取消"/></div>';
                var div = document.createElement('div');
                div.innerHTML = customTpl;
                u.forEach(div.childNodes, function (node) {
                    if (node.nodeType === 1) {
                        me.customElements.push(node);
                    }
                });
            }
        }

        var html = '<div data-ui-type="Panel" data-ui-id="${filterPanelId}" class="${filterPanelStyle}">'
                + '<label data-ui-type="Label" data-ui-id="${labelId}"></label>'
                + '<div data-ui-type="Panel" data-ui-id="${contentPanelId}" class="${contentPanelStyle}"></div></div>';
        this.main.innerHTML = lib.format(
            html,
            {
                filterPanelStyle: this.helper.getPartClassName('panel'),
                filterPanelId: this.helper.getId('items-wrapper-panel'),
                labelId: this.helper.getId('items-label'),
                contentPanelId: this.helper.getId('items-panel'),
                contentPanelStyle: this.helper.getPartClassName('items-panel')
            }
        );

        // 创建控件树
        this.initChildren(this.main);
    };

    /**
     * 根据datasource生成选择项
     * @param {Array} datasource 选项列表数据源
     * @private
     */
    exports.buildItems = function (datasource) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">${text}</a> ';
        var s = '';
        var helper = this.helper;

        u.forEach(datasource, function (item) {
            var active = item.selected ? helper.getPartClassName('item-active') : '';
            s += lib.format(
                html,
                {
                    value: item.value,
                    text: item.text,
                    style: helper.getPartClassName('item') + ' ' + active
                }
            );
        }, this);
        var itemsPanel = this.getItemsPanel();
        // itemsPanel.setContent(s);
        itemsPanel.main.innerHTML = s;
        this.custom && this.buildCustomItem();
    };

    /**
     * 根据选项数据生成选择项
     * @param {Object} item 选项数据
     * @return {HtmlElement} 生成的选择项元素
     * @private
     */
    exports.buildItem = function (item) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">${text}</a>';
        var div = document.createElement('div');
        div.innerHTML = lib.format(
            html,
            {
                value: item.value,
                text: item.text,
                style: this.helper.getPartClassName('item')
            }
        );
        var itemElement = div.firstChild;
        lib.insertBefore(itemElement, this.customBtn);
        return itemElement;
    };

    /**
     * 生成自定义项
     * @private
     */
    exports.buildCustomItem = function () {
        var html = '<a href="javascript:;" class="${style}">${text}</a>';
        var itemsPanel = this.getItemsPanel();
        itemsPanel.appendContent(lib.format(html, {
            style: this.helper.getPartClassName('item-cmd'),
            text: this.customBtnLabel
        }));
        this.customBtn = itemsPanel.main.lastChild;
    };

    /**
     * 获取备选项Panel
     * @return {Panel} 备选项Panel
     * @private
     */
    exports.getItemsPanel = function () {
        var itemsPanelId = this.helper.getId('items-panel');
        return this.viewContext.get(itemsPanelId);
    };

    /**
     * 获取备选项提示Label
     * @return {Panel} 备选项提示Label
     * @private
     */
    exports.getItemsLabel = function () {
        var itemsLabelId = this.helper.getId('items-label');
        return this.viewContext.get(itemsLabelId);
    };

    /**
     * 添加自定义输入控件
     * @param {HtmlElement} target 自定义输入控件插入位置参考元素
     * @private
     */
    exports.addCustomInput = function (target) {
        var me = this;
        this.customInputs = [];
        u.forEach(this.customElements, function (node) {
            walkDomTree(node, function (node) {
                var role = lib.getAttribute(node, 'data-role');
                if (!me.customOkBtn && role === 'ok') {
                    me.customOkBtn = node;
                }
                else if (!me.customCancelBtn && role === 'cancel') {
                    me.customCancelBtn = node;
                }
                else if (node.nodeName === 'INPUT' && node.type === 'text') {
                    me.customInputs.push(node);
                }
            });
            lib.insertBefore(node, target);
        });
        target.style.display = 'none';
    };

    /**
     * 移除自定义输入控件
     * @private
     */
    exports.removeCustemInput = function () {
        u.forEach(this.customElements, function (node) {
            lib.removeNode(node);
        });
        this.customBtn.style.display = '';
        // 置空输入控件
        u.each(this.customInputs, function (input) {
            input.value && (input.value = '');
        });
    };

    /**
     * 保存自定义条件选项
     * @private
     */
    exports.saveCustomItem = function () {
        var itemsText = [];
        var me = this;
        var hasBlank = false;
        u.each(this.customInputs, function (input) {
            if (!input.value) {
                hasBlank = true;
                return false;
            }
            itemsText.push(input.value);
        });
        if (hasBlank) {
            alert('不允许输入为空，请输入完整！');
            return;
        }
        var item = {
            text: itemsText.join('-'),
            value: itemsText.join('-')
        };
        if (me.hasRepeatItemInDatasource(item)) {
            alert('存在重复的选择项，请重新输入！');
            return;
        }
        this.onsave(item, function () {
            me.datasource.push(item);
            var element = me.buildItem(item);
            me.removeCustemInput();
            me.selectItem(item, element);
        });
    };
    /**
     * 点击自定义保存时触发的事件接口
     * @param {Object} 自定义的项
     * @param {Function} callback 回调
     */
    exports.onsave = function (item, callback) {
        callback();
    };
    /**
     * 检查在datasource中是否存在重复的选项
     * @param {Object} repeatItem 待检测的选项数据
     * @return {bool} 是否存在重复项
     */
    exports.hasRepeatItemInDatasource = function (repeatItem) {
        var ret = false;
        u.each(this.datasource, function (item) {
            if (item.value === repeatItem.value || item.text === repeatItem.text) {
                ret = true;
                return false;
            }
        });
        return ret;
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    exports.initEvents = function () {
        var itemsPanel = this.getItemsPanel();
        var me = this;
        this.helper.addDOMEvent(
            itemsPanel.main,
            'click',
            function (e) {
                var target = e.target;

                if (target === me.customOkBtn) {
                    me.saveCustomItem();
                    return;
                }

                if (target === me.customCancelBtn) {
                    me.removeCustemInput();
                    return;
                }

                if (target.nodeName !== 'A') {
                    return;
                }

                if (me.custom && target === me.customBtn) {
                    me.addCustomInput(target);
                    return;
                }
                var value = lib.getAttribute(target, 'data-value');
                var text = lib.getText(target);
                var item = {
                    value: value,
                    text: text
                };

                me.selectItem(item, target);
            }
        );
    };
    /**
     * 设置选择项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @public
     */
    exports.removeItem = function (item) {
        if (!item || !this.getItemByValue(item.value)) {
            return;
        }
        var datasource = lib.deepClone(this.datasource);
        var targetItem = this.getItemByValue(item.value, datasource);
        targetItem.selected = false;
        this.setProperties({
            'datasource': datasource
        });
    };
    
    /**
     * 选择项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @param {HtmlElement} target 选中的元素
     * @private
     */
    exports.selectItem = function (item, target) {
        var selectedItem = this.getItemByValue(item.value);
        // 是否之前被选中过
        var isChecked = false;
        if (selectedItem.selected) {
            selectedItem.selected = false;
            isChecked = true;
        }
        else {
            selectedItem.selected = true;
        }
        var helper = this.helper;
        // 对单选的特殊处理
        if (!this.multiple) {
            if (selectedItem === this.lastSelectedItem) {
                selectedItem.selected = false;
                this.lastSelectedItem = null;
            }
            else {
                this.lastSelectedItem && (this.lastSelectedItem.selected = false);
            }
            var cls = helper.getPartClassName('item-active');
            var itemLinks = target.parentNode.childNodes;
            u.each(itemLinks, function (itemLink) {
                if (lib.hasClass(itemLink, cls)) {
                    helper.removePartClasses('item-active', itemLink);
                    return false;
                }
            });
        }
        if (isChecked) {
            helper.removePartClasses('item-active', target);
        }
        else {
            helper.addPartClasses('item-active', target);
        }

        /**
         * @event select
         *
         * 选择时触发
         */
        this.fire('change', {
            'item': item,
            'lastItem': this.lastSelectedItem,
            'action': isChecked ? 'remove' : 'add'
        });
        if (this.multiple || !isChecked) {
            this.lastSelectedItem = selectedItem;
        }
    };
    
    /**
     * 根据值获取整个选择项的数据
     * @param {string} value 值
     * @param {Object=} datasource 数据源
     * @return {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @public
     */
    exports.getItemByValue = function (value, datasource) {
        var item;
        datasource = datasource || this.datasource;
        u.each(datasource, function (single, index) {
            if (single.value === value) {
                item = single;
            }
        });
        return item;
    };

    /**
     * 重渲染
     *
     * @method
     * @protected
     * @override
     */
    exports.repaint = require('esui/painters').createRepaint(
        Panel.prototype.repaint,
        {
            name: ['datasource', 'value'],
            paint: function (filterPanel, datasource, value) {
                if (u.isString(value)) {
                    value = [value];
                }
                filterPanel.lastSelectedItem = null;
                u.each(datasource, function (item, index) {
                    u.each(value, function (single, i) {
                        if (item.value === single) {
                            item.selected = true;
                            if (!filterPanel.multiple) {
                                filterPanel.lastSelectedItem = item;
                            }
                        }
                    });
                });
                // 单选时， 如果没有设置默认值，则默认选择第一个
                if (!filterPanel.multiple
                    && !filterPanel.lastSelectedItem
                    && filterPanel.defaultFirst
                    && datasource
                    && datasource[0]) {
                    datasource[0].selected = true;
                    filterPanel.lastSelectedItem = datasource[0];
                }
                filterPanel.buildItems(datasource);
            }
        },
        {
            name: ['itemsLabel'],
            paint: function (filterPanel, label) {
                label = label || filterPanel.label;
                filterPanel.getItemsLabel().setText(label);
            }
        }
    );

    /**
     * 获取选中的项
     * @return {Object} 选中项
     */
    exports.getSelectedItems = function () {
        var items = [];
        u.each(this.datasource, function (item, index) {
            if (item.selected) {
                items.push(item);
            }
        });
        return items;
    };
    
    /**
     * 获取选中的值
     * @return {Object} 选中项
     */
    exports.getValue = function () {
        var items = this.getSelectedItems();
        var valueArr = [];
        u.each(items, function (item, index) {
            valueArr.push(item.value);
        });
        return valueArr;
    };

    function walkDomTree (root, callback) {
        if (root.nodeType !== 1) {
            return;
        }
        callback(root);
        if (root.childNodes) {
            u.forEach(root.childNodes, function (node) {
                walkDomTree(node, callback);
            });
        }
    }

    var FilterItem = eoo.create(Panel, exports);
    require('esui/main').register(FilterItem);
    return FilterItem;
});
