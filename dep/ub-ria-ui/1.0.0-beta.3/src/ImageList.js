/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 图标列表，由ImagePanel和Pager组成
 * @author hongfeng (homfen@outlook.com)
 */

define(
    function (require) {
        var $ = require('jquery');
        var u = require('underscore');
        var esui = require('esui');
        var Control = require('esui/Control');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        require('./ImagePanel');
        require('esui/Pager');

        var ImageList = eoo.create(
            Control,
            {

                /**
                 * 控件类型，始终为 `ImageList`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'ImageList',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 参数对象
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        datasource: [],         // 数据源
                        row: 2,                 // 行数
                        column: 5,              // 列数
                        width: 0,               // 宽度，单位px
                        async: false,           // 是否异步,
                        needDesc: true,         // 是否需要显示图标描述信息
                        canSelect: true,        // 能否选中
                        operates: '',           // 右上角的操作按钮
                        imageWidth: 100,        // 图标长
                        imageId: 0,              // 默认选中的图标ID
                        noneTip: ''             // 没有数据时显示的tip
                    };

                    u.extend(properties, options);
                    // originDatasource 保存一开始传入的datasource
                    properties.originDatasource = u.clone(properties.datasource);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @override
                 * @protected
                 */
                initStructure: function () {
                    buildDOMStructure.call(this);
                    this.initChildren();
                },

                /**
                 * 初始化事件
                 *
                 * @override
                 * @protected
                 */
                initEvents: function () {
                    var pager = this.getPager();
                    var that = this;

                    // 翻页事件
                    pager.onchangepage = function () {
                        var page = this.get('page');
                        var pageSize = this.get('pageSize');

                        that.fire('pagerchange', {page: page, pageSize: pageSize});

                        // 异步情况下，不执行默认翻页操作
                        if (that.async) {
                            return;
                        }

                        // 默认翻页事件
                        var datasource = that.datasource;
                        var ds = datasource.slice((page - 1) * pageSize, page * pageSize);
                        that.getImagePanel().setDatasource(ds);
                    };

                    // 改变每页大小事件
                    pager.onchangepagesize = function () {
                        var pageSize = this.get('pageSize');
                        that.row = pageSize / that.column;

                        that.fire('pagerchange', {page: 1, pageSize: pageSize});

                        // 异步情况下，不执行默认改变页面大小操作
                        if (that.async) {
                            return;
                        }

                        // 默认改变页面大小事件
                        var datasource = that.datasource;
                        this.set('page', 1);
                        var ds = datasource.slice(0, pageSize);
                        that.getImagePanel().setDatasource(ds);
                    };
                },

                /**
                 * 获取imagepanel
                 *
                 * @return {Object}
                 */
                getImagePanel: function () {
                    return this.getChild('imagePanel');
                },

                /**
                 * 获取pager
                 *
                 * @return {Object}
                 */
                getPager: function () {
                    return this.getChild('pager');
                },

                /**
                 * datasource重新赋值，并刷新
                 *
                 * @param {Array} [datasource] 数据源
                 * @param {number} [count] 数据总数，异步下有效
                 * @param {number} [page] 当前页码，异步下有效
                 */
                setDatasource: function (datasource, count, page) {
                    this.datasource = u.clone(datasource);
                    this.originDatasource = u.clone(datasource);
                    this.count = count;
                    this.page = page;
                    buildDOMStructure.call(this);
                },

                /**
                 * 默认筛选函数，异步下不要调用
                 *
                 * @param {Object} [arg] 对象或函数
                 */
                filter: function (arg) {
                    var filteredDS = null;
                    var ds = u.clone(this.originDatasource);

                    // arg可以是对象或者函数
                    // arg是对象时，根据对象包含的属性进行筛选
                    if (u.isObject(arg)) {
                        var keys = u.keys(arg);

                        // 根据filter中的属性和值进行筛选
                        filteredDS = u.filter(ds, function (icon) {
                            var value = true;
                            u.each(keys, function (key) {
                                if (arg[key] !== '' && icon[key] !== arg[key]) {
                                    value = false;
                                }
                            });
                            return value;
                        });
                    }
                    // arg是函数时，将datasource传给这个函数作为参数，此函数必须返回一个结果
                    else if (u.isFunction(arg)) {
                        filteredDS = arg(ds);
                    }
                    // 不支持其他类型
                    else {
                        return;
                    }

                    // 将筛选结构重新赋值给datasource，供翻页操作
                    this.datasource = filteredDS;

                    var pager = this.getPager();
                    var pageSize = pager.get('pageSize');
                    pager.set('count', filteredDS.length);
                    pager.set('page', 1);
                    filteredDS = filteredDS.slice(0, pageSize);
                    this.getImagePanel().setDatasource(filteredDS);
                },

                /**
                 * 默认排序函数，异步下不要调用
                 *
                 * @param {Object} [arg] 对象或函数
                 */
                sort: function (arg) {
                    var sortedDS = null;
                    var ds = this.datasource;

                    // arg可以是对象或者函数
                    // arg是对象时，根据对象包含的属性进行排序
                    // arg必须包含'field'、'order'两个属性
                    if (u.isObject(arg)) {
                        var field = arg.field;
                        var order = arg.order.toLowerCase();

                        // 根据field排序，升序
                        sortedDS = u.sortBy(ds, field);

                        // 如果是降序，则反转
                        if (order === 'desc') {
                            sortedDS.reverse();
                        }
                    }
                    // arg是函数时，将datasource传给这个函数作为参数，此函数必须返回一个结果
                    else if (u.isFunction(arg)) {
                        sortedDS  = arg(ds);
                    }
                    // 不支持其他类型
                    else {
                        return;
                    }

                    // 将筛选结构重新赋值给datasource，供翻页操作
                    this.datasource = sortedDS;

                    var pager = this.getPager();
                    var pageSize = pager.get('pageSize');
                    pager.set('page', 1);
                    sortedDS = sortedDS.slice(0, pageSize);
                    this.getImagePanel().setDatasource(sortedDS);
                },

                /**
                 * 重渲染
                 *
                 * @override
                 * @protected
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: 'datasource',
                        paint: function (iconList, datasource) {
                            iconList.setDatasource(datasource);
                        }
                    }
                )
            }
        );

        /**
         * 创建DOM节点
         *
         * @param {string} [part] part名称
         * @param {string} [nodeName] 标签名称
         * @param {string} [innerHTML] innerHTML
         *
         * @return {string} html
         */
        function create(part, nodeName, innerHTML) {
            return this.helper.getPartBeginTag(part, nodeName)
                + innerHTML
                + this.helper.getPartEndTag(part, nodeName);
        }

        /**
         * 构建DOM结构
         */
        function buildDOMStructure() {
            var imagePanel = this.getImagePanel();
            var pager = this.getPager();
            var pageSize = this.row * this.column;
            var pageSizes = [pageSize, 2 * pageSize, 5 * pageSize, 10 * pageSize];

            // 构造main html
            if (!imagePanel || !pager) {
                imagePanel = null;
                pager = null;

                var imagePanelWrapper = create.call(this, 'image-panel', 'div', '');
                var pagerWrapper = create.call(this, 'pager', 'div', '');
                var html = create.call(this, '', 'div', imagePanelWrapper + pagerWrapper);
                this.main.innerHTML = html;
            }

            // ImagePanel appendTo main
            var ds = this.datasource.slice(0, pageSize);
            if (imagePanel) {
                imagePanel.setDatasource(ds);
            }
            else {
                // iconpanel的默认属性
                var keys = [
                    'needDesc',         // 是否需要显示图标描述信息
                    'canSelect',        // 能否选中
                    'operates',         // 右上角的操作按钮
                    'imageWidth',       // 图标长
                    'datasource',       // 数据源
                    'imageId',           // 默认选中的图标ID
                    'noneTip'           // 没有数据时显示的tip
                ];
                // 从this取出iconpanel配置
                var properties = u.pick(this, keys);
                imagePanel = esui.create('ImagePanel', properties);
                this.addChild(imagePanel, 'imagePanel');
                imagePanel.appendTo($('#' + this.helper.getId('image-panel'))[0]);
            }

            // Pager appendTo main
            var page = this.async ? this.page : 1;
            var count = this.async ? this.count : this.datasource.length;
            if (pager) {
                pager.set('count', count);
                pager.set('page', page);
            }
            else {
                // 根据 row 和 column设置pageSize 和 pageSizes
                pager = esui.create('Pager', {
                    page: page,
                    count: count,
                    pageSize: pageSize,
                    pageSizes: pageSizes,
                    pageType: 'plain',
                    layout: 'alignRight'
                });
                this.addChild(pager, 'pager');
                pager.appendTo($('#' + this.helper.getId('pager'))[0]);
            }

            if (this.width > 0) {
                $(this.main).css(this.width);
            }
        }

        esui.register(ImageList);
        return ImageList;
    }
);
