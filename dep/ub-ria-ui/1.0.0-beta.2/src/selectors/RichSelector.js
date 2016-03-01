/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 富选择单元控件
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        require('esui/Label');
        require('esui/Panel');
        require('esui/SearchBox');

        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var esui = require('esui');

        /**
         * 控件类
         *
         * 富选择控件有如下结构特点：
         *
         * - 一个标题栏          （可选）
         *   - 标题栏总数显示    （可选）
         *   - 标题栏批量操作    （可选）
         * - 一个选择区          （必须）
         *   - 选择区头部搜索框  （可选）
         * - 一个底部状态栏      （可选）
         *
         * 富选择控件有三种交互模式：
         *
         * - add      点击节点，执行选择行为，并触发'add'事件
         * - load     点击节点，执行选择行为，并触发'load'事件
         * - del      点击节点，执行删除行为，并触发'delete'事件
         *
         * 富选择控件有两种选择模式：
         *
         * - 单选
         * - 多选
         *
         * @class ui.RichSelector
         * @extends esui.InputControl
         */

        var RichSelector = eoo.create(
            InputControl,
            {

                /**
                 * 控件类型，始终为`"RichSelector"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'RichSelector',

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 是否需要标题栏
                        hasHead: true,
                        // 标题栏是否需要统计数
                        needHeadCount: true,
                        // 这个名字出现在标题栏
                        title: '标题名',
                        // 是否需要批量操作
                        needBatchAction: false,
                        // 批量操作文字
                        batchActionLabel: '批量操作',
                        // 是否有搜索功能
                        hasSearchBox: true,
                        // 是否有腿部信息
                        hasFoot: true,
                        // 这个字段是对腿部信息的填充
                        itemName: '结果',
                        // 搜索为空的提示
                        emptyText: '没有相应的搜索结果',
                        // 是否刷新数据时保持搜索状态
                        holdState: false,
                        // 选择器类型 'load', 'add', 'delete'
                        // load: 点击某个节点，加载  出一堆别的数据，主要用于样式区分
                        // add: 点击一个节点，把这个节点加到另一个容器里
                        // delete: 点击一个节点，删
                        mode: 'add',
                        multi: true,
                        // 是否允许反选
                        allowUnselectNode: false
                    };

                    u.extend(properties, options);
                    this.$super([properties]);
                },

                /**
                 * 创建标题栏HTML
                 * @return {string}
                 */
                getHeadHTML: function () {
                    var helper = this.helper;
                    var actionLink = '';
                    var headCount = '';

                    if (this.needBatchAction) {
                        var linkClassName = helper.getPartClassName('batch-action-link');
                        var linkId = this.helper.getId('batch-action');
                        actionLink = ''
                            + '<a class="' + linkClassName
                            + '" id="' + linkId + '" >'
                            + this.batchActionLabel
                            + '</a>';
                    }

                    if (this.hasHead && this.needHeadCount) {
                        var countClass = helper.getPartClassName('head-count');
                        headCount = '<span class="'
                            + countClass
                            + '" data-ui="type:Label;childName:headTotalCount;title:;"></span>';
                    }

                    var head = [
                        '<div data-ui="type:Panel;childName:head;"',
                        ' class="${headClass}">',
                        '<span class="${headTitleClass}" data-ui="type:Label;childName:title;title:;">',
                        '${title}</span>${totalCount}',
                        '${actionLink}',
                        '</div>'
                    ].join('\n');

                    head = lib.format(
                        head,
                        {
                            headClass: helper.getPartClassName('head'),
                            headTitleClass: helper.getPartClassName('head-title'),
                            title: this.title,
                            actionLink: actionLink,
                            totalCount: headCount
                        }
                    );

                    return head;
                },

                /**
                 * 创建底部状态栏HTML
                 * @return {string}
                 */
                getFootHTML: function () {
                    var tpl = [
                        '<div data-ui="type:Panel;childName:foot;" class="${classes}">',
                        '   <span data-ui="type:Label;childName:totalCount"></span>',
                        '   ${footButton}',
                        '</div>'
                    ].join('\n');

                    var footButton = '';

                    if (this.footButtonText) {
                        footButton = '<button data-ui="type:Button;childName:button;variants:link;">'
                            + this.footButtonText
                            + '</button>';
                    }

                    return lib.format(
                        tpl,
                        {
                            classes: this.helper.getPartClassName('foot'),
                            footButton: footButton
                        }
                    );
                },

                /**
                 * 创建搜索框HTML
                 * @return {string}
                 */
                getSearchBoxHTML: function () {
                    return [
                        // 搜索区
                        '<div data-ui="type:Panel;childName:searchBoxArea"',
                        ' class="' + this.helper.getPartClassName('search-wrapper') + '">',
                        '   <div',
                        '   data-ui="buttonPosition:right;buttonVariants:bordered icon;',
                        '   type:SearchBox;childName:itemSearch;variants:clear-border',
                        '   hide-searched-button;searchMode:instant;">',
                        '   </div>',
                        '</div>'
                    ].join('');
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    var tpl = [
                        // 标题栏
                        '${head}',
                        // 内容
                        '<div data-ui="type:Panel;childName:body;" class="${bodyClass}">',
                             // 搜索框
                        '    ${searchInput}',
                             // 列表区
                        '    <div data-ui="type:Panel;childName:content" class="${contentClass}">',
                                 // 结果为空提示
                        '        <div data-ui="type:Label;childName:emptyText" ',
                        '           class="${emptyTextClass}">${emptyText}</div>',
                                 // 结果列表
                        '        <div data-ui="type:Panel;childName:queryList" class="${queryListClass}"></div>',
                        '    </div>',
                        '</div>',
                        // 底部概要信息
                        '${footInfo}'
                    ];

                    this.main.innerHTML = lib.format(
                        tpl.join('\n'),
                        {
                            head: this.hasHead ? this.getHeadHTML() : '',
                            bodyClass: this.helper.getPartClassName('body'),
                            searchInput: this.hasSearchBox ? this.getSearchBoxHTML() : '',
                            contentClass: this.helper.getPartClassName('content-wrapper'),
                            emptyTextClass: this.helper.getPartClassName('empty-text'),
                            emptyText: this.emptyText,
                            queryListClass: this.helper.getPartClassName('query-list'),
                            footInfo: this.hasFoot ? this.getFootHTML() : ''
                        }
                    );
                    this.initChildren();

                    // 初始化模式状态
                    this.addState(this.mode || 'delete');

                    // 绑事件

                    // 批量操作
                    if (this.needBatchAction) {
                        this.helper.addDOMEvent(
                            this.helper.getPart('batch-action'),
                            'click',
                            u.bind(this.batchAction, this)
                        );
                    }

                    // 搜索框
                    if (this.hasSearchBox) {
                        this.addState('has-search');
                        var searchBox = this.getSearchBox();
                        searchBox.on('search', u.bind(search, this));
                        searchBox.on('clear', u.bind(this.clearQuery, this));
                    }

                    // 为备选区绑定点击事件
                    var queryList = this.getQueryList().main;
                    this.helper.addDOMEvent(
                        queryList,
                        'click',
                        u.bind(this.eventDispatcher, this)
                    );
                },

                /**
                 * @override
                 */
                initEvents: function () {
                    this.$super(arguments);

                    var foot = this.getChild('foot');
                    var button = foot && foot.getChild('button');
                    if (button) {
                        button.on(
                            'click',
                            function (e) {
                                e.preventDefault();
                                this.fire('footclick');
                            },
                            this
                        );
                    }
                },

                /**
                 * 点击行为分发器
                 * @param {Event} e 事件对象
                 * @return {boolean}
                 * @ignore
                 */
                eventDispatcher: function (e) {
                    return false;
                },

                /**
                 * 按条件搜索
                 * @param {string | Object} args 搜索参数
                 */
                search: function (args) {
                    // filterData中的元素要满足一个标准结构: { keys: [], value: '' }
                    // 其中数组型的keys代表一种“并集”关系，也可以不提供
                    // filterData的各个元素代表“交集”关系。
                    var filterData = [];
                    var event = this.fire('search', filterData);
                    // 如果没有外部提供搜索条件
                    if (!event.isDefaultPrevented()) {
                        // 取自带搜索框的值
                        var searchBox = this.getSearchBox();
                        if (searchBox) {
                            var defaultFilter = {
                                value: lib.trim(searchBox.getValue())
                            };
                            filterData.push(defaultFilter);
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
                 * 清除搜索结果
                 *
                 * @param {ui.RichSelector} richSelector 类实例
                 * @return {boolean}
                 * @ignore
                 */
                clearQuery: function () {
                    // 重置搜索
                    resetSearchState(this);

                    // 清空数据
                    this.clearData();

                    // 更新备选区
                    this.refreshContent();

                    // 更新腿部总结果
                    this.refreshFoot();

                    // 更新头部总结果
                    this.refreshHead();

                    this.fire('clearquery');

                    return false;
                },

                /**
                 * 获取结果列表承载容器控件，列表在它里面
                 * @param {ui.RichSelector} richSelector 类实例
                 * @return {ui.Panel}
                 * @ignore
                 */
                getContent: function () {
                    var body = this.getChild('body');
                    if (body) {
                        return body.getChild('content');
                    }
                    return null;
                },

                getKeyword: function () {
                    var searchBox = this.getSearchBox();
                    var isQuery = this.isQuery();
                    if (searchBox && isQuery) {
                        return lib.trim(searchBox.getValue());
                    }
                    return null;
                },

                /**
                 * 获取结果列表控件
                 * @return {ui.TreeForSelector | ui.ListForSelector}
                 * @ignore
                 */
                getQueryList: function () {
                    var content = this.getContent();
                    if (content) {
                        return content.getChild('queryList');
                    }
                    return null;
                },

                /**
                 * 获取搜索控件
                 * @return {ui.Panel}
                 * @ignore
                 */
                getSearchBox: function () {
                    var searchBoxArea = this.getChild('body').getChild('searchBoxArea');
                    if (searchBoxArea) {
                        return searchBoxArea.getChild('itemSearch');
                    }
                },

                /**
                 * 获取腿部总个数容器
                 * @param {ui.RichSelector} richSelector 类实例
                 * @return {ui.Panel}
                 * @ignore
                 */
                getTotalCountPanel: function () {
                    var foot = this.getChild('foot');
                    if (!foot) {
                        return null;
                    }
                    return foot.getChild('totalCount');
                },

                /**
                 * 获取头部总个数容器
                 * @param {ui.RichSelector} richSelector 类实例
                 * @return {ui.Panel}
                 * @ignore
                 */
                getHeadTotalCountPanel: function () {
                    var head = this.getChild('head');
                    if (!head) {
                        return null;
                    }
                    return head.getChild('headTotalCount');
                },

                /**
                 * 判断是否处于query状态
                 * @return {boolean}
                 */
                isQuery: function () {
                    return this.hasState('queried');
                },

                /**
                 * 批量操作事件处理
                 * 可重写
                 *
                 * @return {boolean}
                 */
                batchAction: function () {
                    if (this.mode === 'delete') {
                        this.deleteAll();
                        this.refreshFoot();
                        this.refreshHead();
                    }
                    else if (this.mode === 'add') {
                        this.selectAll();
                    }
                    return false;
                },

                deleteAll: function () {
                    return false;
                },

                addAll: function () {
                    return false;
                },

                /**
                 * 数据适配
                 *
                 * @public
                 */
                adaptData: function () {},

                /**
                 * 手动刷新
                 *
                 * @param {ui.RichSelector} richSelector 类实例
                 * @ignore
                 */
                refresh: function () {
                    // 重建数据，包括索引数据的创建
                    var adaptedData = this.adaptData();

                    var needRefreshContent = true;
                    // 刷新搜索区
                    if (this.hasSearchBox && this.isQuery()) {
                        // 有一种场景（一般在删除型控件里）
                        // 在搜索状态下，删除了某个节点之后，希望还保留在搜索状态下
                        if (this.holdState) {
                            // 根据关键字获取结果
                            this.search(this.getKeyword());
                            // search方法里面已经执行过了
                            needRefreshContent = false;
                        }
                        // 清空搜索区
                        else {
                            resetSearchState(this);
                        }
                    }

                    // 刷新主体
                    if (needRefreshContent) {
                        // 重绘视图
                        this.refreshContent();
                        // 视图重绘后的一些额外数据处理
                        this.processDataAfterRefresh(adaptedData);
                        // 更新底部信息
                        this.refreshFoot();
                        // 更新头部总结果
                        this.refreshHead();
                    }
                },

                /**
                 * 视图刷新后的一些额外处理
                 *
                 * @param {Object} adaptedData 适配后的数据
                 */
                processDataAfterRefresh: function (adaptedData) {},

                /**
                 * 更新腿部信息
                 *
                 * @param {ui.RichSelector} richSelector 类实例
                 * @ignore
                 */
                refreshFoot: function () {
                    if (!this.hasFoot) {
                        return;
                    }
                    var count = this.getCurrentStateItemsCount();

                    // 更新腿部总结果
                    var totalCountPanel = this.getTotalCountPanel();
                    if (totalCountPanel) {
                        var itemName = u.escape(this.itemName);
                        totalCountPanel.setText('共 ' + count + ' 个' + itemName);
                    }
                },

                /**
                 * 更新头部信息
                 *
                 * @ignore
                 */
                refreshHead: function () {
                    if (!this.hasHead || !this.needHeadCount) {
                        return;
                    }
                    var count = this.getCurrentStateItemsCount();

                    // 更新头部总结果
                    var totalCountPanel = this.getHeadTotalCountPanel();
                    if (totalCountPanel) {
                        totalCountPanel.setText('（' + count + '）');
                    }
                },

                getCurrentStateItemsCount: function () {
                    return 0;
                },

                /**
                 * 重新渲染视图
                 * 仅当生命周期处于RENDER时，该方法才重新渲染
                 *
                 * @param {Array=} 变更过的属性的集合
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'title',
                        paint: function (me, title) {
                            var head = me.getChild('head');
                            var titleLabel = head && head.getChild('title');
                            titleLabel && titleLabel.setText(title);
                        }
                    },
                    {
                        name: 'disabled',
                        paint: function (me, disabled) {
                            var serachbox = me.getSearchBox();
                            if (disabled) {
                                serachbox && serachbox.disable();
                            }
                            else {
                                serachbox && serachbox.enable();
                            }
                        }
                    },
                    painters.style('width')
                ),

                /**
                 * 获取已经选择的数据项
                 * 就是一个代理，最后从结果列表控件里获取
                 * @return {Array}
                 * @public
                 */
                getSelectedItems: function () {
                    return [];
                },

                /**
                 * 获取已经选择的数据的完整数据结构
                 * @return {*}
                 * @public
                 */
                getSelectedItemsFullStructure: function () {
                    return {};
                },

                /**
                 * 批量更新状态
                 * @param {Array} items 需要更新的对象集合
                 * @param {boolean} toBeSelected 要选择还是取消选择
                 * @public
                 */

                /**
                 * 批量更新选择状态
                 * @param {Array} items 需要更新的对象集合
                 * @param {boolean} toBeSelected 要选择还是取消选择
                 * @public
                 */
                selectItems: function (items, toBeSelected) {},

                /**
                 * 设置元数据
                 *
                 * @param {Array | Object} value 置为选择的项.
                 */
                setRawValue: function (value) {
                    if (!u.isArray(value)) {
                        value = [value];
                    }

                    if (!this.multi && value.length > 1) {
                        value = value.slice(0);
                    }

                    this.selectItems(value, true);
                },

                /**
                 * 获取已经选择的数据项
                 *
                 * @return {Array | Object} 多选模式返回数组，单选模式返回单值
                 */
                getRawValue: function () {
                    var selectedItems = this.getSelectedItems();
                    if (!this.multi) {
                        return selectedItems[0];
                    }
                    return selectedItems;
                },

                /**
                 * 将value从原始格式转换成string
                 *
                 * @param {*} rawValue 原始值
                 * @return {string}
                 */
                stringifyValue: function (rawValue) {
                    var selectedIds = [];
                    if (!u.isArray(rawValue)) {
                        selectedIds = [rawValue];
                    }
                    else {
                        u.each(rawValue, function (item) {
                            selectedIds.push(item.id);
                        });
                    }
                    return selectedIds.join(',');
                }
            }
        );

        /**
         * 根据关键词搜索结果
         * @param {event} e SearchBox的点击事件对象
         * @ignore
         */
        function search(e) {
            this.search();
        }

        function resetSearchState(control) {
            // 删除搜索状态
            control.removeState('queried');

            // 清空搜索框
            var searchBox = control.getSearchBox();
            if (searchBox) {
                searchBox.set('text', '');
            }
        }

        esui.register(RichSelector);
        return RichSelector;
    }
);
