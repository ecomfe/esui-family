/**
 * 过滤器
 * @file: FilterResult.js
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
     * FilterResult
     *
     * @extends Panel
     * @constructor
     */
    exports.constructor = function () {
        this.$super(arguments);
    };

    exports.type = 'FilterResult';

    exports.datasource = [];

    /**
     * 初始化配置
     *
     * @protected
     * @override
     */
    exports.initOptions = function (options) {
        this.setProperties(options);
    };

    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    exports.initStructure = function () {
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
     * 增加项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @public
     */
    exports.addItem = function (item) {
        if (this.getItemByValue(item.value)) {
            return;
        }
        var datasource = lib.deepClone(this.datasource);
        item.selected = true;
        datasource.push(item);
        this.setProperties({
            'datasource': datasource
        });
    };
    /**
     * 删除项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @public
     */
    exports.removeItem = function (item) {
        if (!item || !this.getItemByValue(item.value)) {
            return;
        }
        var datasource = lib.deepClone(this.datasource);
        var targetItem = this.getItemByValue(item.value, datasource);
        datasource = u.without(datasource, targetItem);
        this.setProperties({
            'datasource': datasource
        });
    };

    /**
     * 获取提示已选项Panel
     * @return {Panel} 提示已选项Panel
     * @private
     */
    exports.getSelectedItemsPanel = function () {
        var selectedPanelId = this.helper.getId('items-panel');
        return this.viewContext.get(selectedPanelId);
    };

    /**
     * 获取提示已选项提示Label
     * @return {Panel} 提示已选项提示Label
     * @private
     */
    exports.getSelectedItemsLabel = function () {
        var selectedLabelId = this.helper.getId('items-label');
        return this.viewContext.get(selectedLabelId);
    };

    /**
     * 初始化事件交互
     *
     * @protected
     * @override
     */
    exports.initEvents = function () {
        var selectedItemsPanel = this.getSelectedItemsPanel();
        var me = this;
        this.helper.addDOMEvent(
            selectedItemsPanel.main,
            'click',
            function (e) {
                var target = e.target;
                if (!/^(?:A|I|SPAN)$/.test(target.nodeName)) {
                    return;
                }
                target = /^A$/.test(target.nodeName) ? target : target.parentNode;
                var value = lib.getAttribute(target, 'data-value');
                var text = lib.getText(lib.dom.first(target));
                var item = {
                    value: value,
                    text: text,
                    selected: false
                };

                me.unselectItem(item, target);
            }
        );
    };

    /**
     * 移除选中项
     * @param {Object} item 选中项的数据 格式如: {value: '', text: ''}
     * @param {HtmlElement} target 取消选中的元素
     * @private
     */
    exports.unselectItem = function (item, target) {
        lib.removeNode(target);
        var selectedItem = this.getItemByValue(item.value);
        this.datasource = u.without(this.datasource, selectedItem);
        /**
         * @event select
         *
         * 移除时触发
         */
        this.fire('change', {
            'item': item
        });
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
            paint: function (resultPanel, datasource, value) {
                if (u.isString(value)) {
                    value = [value];
                }
                u.each(datasource, function (item, index) {
                    u.each(value, function (single, i) {
                        if (item.value === single) {
                            item.selected = true;
                        }
                    });
                });
                resultPanel.buildItems(datasource);
            }
        },
        {
            name: ['label'],
            paint: function (resultPanel, selectedLabel) {
                resultPanel.getSelectedItemsLabel().setText(selectedLabel);
            }
        }
    );

    /**
     * 根据datasource生成选择项
     * @param {Array} datasource 选项列表数据源
     * @private
     */
    exports.buildItems = function (datasource) {
        var html = '<a href="javascript:;" class="${style}" data-value="${value}">'
                 + '<span>${text}</span><span class="${iconClass} ${removeClass}"></span></a>';
        var s = '';
        var helper = this.helper;
        u.forEach(datasource, function (item) {
            s += lib.format(
                html,
                {
                    value: item.value,
                    text: item.text,
                    style: helper.getPartClassName('item'),
                    iconClass: helper.getIconClass(),
                    removeClass: helper.getPartClassName('remove')
                }
            );
        });
        var selectedItemsPanel = this.getSelectedItemsPanel();
        selectedItemsPanel.setContent(s);
    };
    /**
     * 获取选中的
     * @return {Object} 选中的条件
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

    var FilterResult = eoo.create(Panel, exports);
    require('esui/main').register(FilterResult);
    return FilterResult;
});
