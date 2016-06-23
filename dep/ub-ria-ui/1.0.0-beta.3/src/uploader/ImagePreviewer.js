/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 图片预览
 * @exports ImagePreviewer
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');

        var esui = require('esui');
        var InputControl = require('esui/InputControl');
        var painters = require('esui/painters');

        /**
         * Progress
         *
         * @class Progress
         * @extends EventTarget
         */
        var exports = {};

        exports.type = 'ImagePreviewer';


        var itemTemplate = ''
            + '<div class="${containerClass}" index="${index}" '
            + '  style="width:${containerWidth};height:${containerHeight}">'
            + '  <img class="${imgClass}" src="${imgSrc}" '
            + '     style="max-width:${containerWidth};max-height:${containerHeight};${positionConfig}"/>'
            + '  <div class="${maskClass}" style="width:${containerWidth};height:${containerHeight}">${mask}</div>'
            + '  <label class="${operationClass}" '
            + '     style="line-height:${containerHeight};text-align:center;">${operationLabel}</label>'
            + '</div>';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            this.helper.addDOMEvent(this.main, 'click', u.bind(this.eventDispatcher, this));
            this.addState(this.mode);
        };

        /**
         * @override
         */
        exports.getRawValue = function () {
            return this.datasource;
        };

        /**
         * 点击行为分发器
         *
         * @method ui.ImagePreviewer#eventDispatcher
         * @param {Event} e 事件对象
         * @public
         */
        exports.eventDispatcher = function (e) {
            var tar = e.target;
            var helper = this.helper;
            var itemClasses = helper.getPartClassName('img-container');

            while (tar && tar !== document.body) {
                var imgDOM;
                if (lib.hasClass(tar, itemClasses)) {
                    imgDOM = tar;
                }
                if (imgDOM) {
                    this.operateItem(imgDOM, e.type);
                    return;
                }

                tar = tar.parentNode;
            }
        };

        /**
         * 操作节点
         *
         * @method ui.ImagePreviewer#operateItem
         * @param {HTMLElement} imgDOM 目标节点
         * @param {string} eventType 事件类型
         * @public
         */
        exports.operateItem = function (imgDOM, eventType) {
            var index = parseInt(imgDOM.getAttribute('index'), 10);
            var item = this.datasource[index];
            if (!item) {
                return;
            }
            if (eventType === 'click') {
                var deleteEvent = this.fire('beforedelete', {trueTarget: imgDOM});
                if (deleteEvent.isDefaultPrevented()) {
                    return;
                }

                if (!this.deletable) {
                    return;
                }

                this.removeItem(item);
            }
        };

        /**
         * 移除选择项
         *
         * @method ui.ImagePreviewer#removeItem
         * @param {Object} item 待移除的项
         * @public
         */
        exports.removeItem = function (item) {
            this.datasource = u.without(this.datasource, item);
            this.buildItems();
        };

        /**
         * 添加选择项
         *
         * @method ui.ImagePreviewer#addItems
         * @param {Array} items 待添加的项
         * @public
         */
        exports.addItems = function (items) {
            // 单图模式，直接用新item替换原有的
            if (this.mode === 'single') {
                this.datasource = items.slice(0, 1);
            }
            else {
                this.datasource = u.union(this.datasource, items);
            }
            this.buildItems();
        };

        /**
         * 根据datasource生成选择项
         *
         * @method ui.ImagePreviewer#buildItems
         * @public
         */
        exports.buildItems = function () {
            var data = this.datasource;
            // 单图模式，直接用新datasource的第一个数据
            if (this.mode === 'single') {
                data = this.datasource.slice(0, 1);
            }
            var htmls = u.map(data, this.getItemHtml, this);
            this.main.innerHTML = htmls.join('');
        };

        /**
         * 构建单项HTML
         *
         * @method ui.ImagePreviewer#getItemHtml
         * @param {Object} item 单项数据
         * @param {number} index 索引
         *
         * @return {string} 构建单项HTML
         * @public
         */
        exports.getItemHtml = function (item, index) {
            return lib.format(
                this.itemTemplate,
                {
                    index: index,
                    containerClass: this.helper.getPartClassName('img-container'),
                    imgClass: this.helper.getPartClassName('img-item'),
                    imgSrc: item.src,
                    maskClass: this.helper.getPartClassName('img-mask'),
                    operationClass: this.helper.getPartClassName('img-operation'),
                    operationLabel: this.operationLabel,
                    containerWidth: this.imgMaxWidth + 'px',
                    containerHeight: this.imgMaxHeight + 'px',
                    positionConfig: this.getPositionConfig(item.data)
                }
            );
        };

        /**
         * 获取图片定位配置
         *
         * @method ui.ImagePreviewer#getPositionConfig
         * @param {Object} data 单项数据
         *
         * @return {string} 定位style
         * @public
         */
        exports.getPositionConfig = function (data) {
            // 获取图片展示宽高
            var width = this.imgMaxWidth;
            var height = this.imgMaxHeight;

            // 宽高比率大与设定的框宽高比率，说明图片等对比压缩后，宽边占满，高等比例计算
            if ((data.width / data.height) > (this.imgMaxWidth / this.imgMaxHeight)) {
                height = (data.height / data.width) * width;
            }
            else {
                width = (data.width / data.height) * height;
            }

            return 'position: absolute;'
                + ' left: 50%; margin-left: -' + width / 2 + 'px;'
                + ' top: 50%; margin-top: -' + height / 2 + 'px;';
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        exports.repaint = painters.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: function (previewer, datasource) {
                    previewer.buildItems();
                }
            }
        );

        var ImagePreviewer = require('eoo').create(InputControl, exports);

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        ImagePreviewer.defaultProperties = {
            itemTemplate: itemTemplate,
            operationLabel: '删除',
            datasource: [],
            imgMaxWidth: 100,
            imgMaxHeight: 100,
            mode: 'single',
            deletable: true
        };

        esui.register(ImagePreviewer);

        return ImagePreviewer;
    }
);
