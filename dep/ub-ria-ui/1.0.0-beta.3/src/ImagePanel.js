/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file image、flash列表，可选中、下载图标、删除图标
 * @author hongfeng (homfen@outlook.com)
 */

define(
    function (require) {
        require('esui/tplLoader!./tpl/ImagePanel.tpl.html');

        var u = require('underscore');
        var $ = require('jquery');
        var esui = require('esui');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var InputControl = require('esui/InputControl');

        var ImagePanel = eoo.create(
            InputControl,
            {

                /**
                 * 控件类型，始终为 `ImagePanel`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'ImagePanel',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 参数对象
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        needDesc: true,                                 // 是否需要显示图标描述信息
                        canSelect: true,                                // 能否选中
                        operates: [],                                   // 右上角的操作按钮
                        imageWidth: 60,                                  // 图标长
                        column: 5,                                      // 每行image数
                        datasource: [],                                 // 数据源
                        imageId: 0,                                      // 默认选中的图标ID
                        noneTip: '抱歉，暂时还没有符合条件的图标'      // 没有数据时显示的tip
                    };

                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化控件结构
                 *
                 * @override
                 */
                initStructure: function () {
                    refresh.call(this);
                },

                /**
                 * 绑定事件
                 *
                 * @override
                 */
                initEvents: function () {
                    // 图标区域点击事件派发
                    var selector = '.' + this.helper.getPrimaryClassName('image-operates');
                    this.helper.addDOMEvent(this.main, 'click', selector, u.bind(imageClickDispater, this));
                },

                /**
                 * 重新给datasource赋值，并重绘控件
                 *
                 * @param {Array} [datasource] 传入datasource
                 */
                setDatasource: function (datasource) {
                    this.setProperties({datasource: u.clone(datasource)});
                },

                /**
                 * 重渲染
                 *
                 * @method
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'datasource',
                        paint: function (panel, datasource) {
                            panel.rawValue = null;
                            refresh.call(panel);
                        }
                    }
                )
            }
        );

        /**
         * 刷新图标列表
         */
        function refresh() {
            var keys = [
                'needDesc',
                'canSelect',
                'operates',
                'imageWidth',
                'column',
                'datasource',
                'imageId',
                'noneTip'
            ];
            var data = u.pick(this, keys);

            data.iconPrefix = this.helper.getIconClass();
            data.classPrefix = this.helper.getPrimaryClassName();

            this.main.innerHTML = this.helper.renderTemplate('ImagePanel', data);
        }

        /**
         * 图标区域点击事件派发
         *
         * @param {Event} e 点击事件
         * @event
         */
        function imageClickDispater(e) {
            var control = this;
            var target = $(e.target);
            var targetParent = target.parent();
            var operate = target.data('name');
            var helper = this.helper;

            if (!operate) {
                operate = 'select';
            }
            targetParent = target.parents('.' + helper.getPrimaryClassName('image-wrapper'));
            target = targetParent.find('.' + helper.getPrimaryClassName('image'));

            // 已选择，直接return
            var selectedClass = helper.getPrimaryClassName('selected');
            if (operate === 'select' && targetParent.hasClass(selectedClass)) {
                return;
            }
            // 勾选
            var main = $(control.main);
            main.find('.' + selectedClass).removeClass(selectedClass);
            targetParent.addClass(selectedClass);

            var imageType = target.data('type') || 'image';
            var imageId = target.attr('data');
            var imageUrl = target.attr('src');

            control.rawValue = {
                imageType: imageType,
                imageId: imageId,
                imageUrl: imageUrl
            };

            // 触发事件
            control.fire('imageclick', {
                operate: operate,
                imageType: imageType,
                imageId: imageId,
                imageUrl: imageUrl
            });
        }

        esui.register(ImagePanel);

        return ImagePanel;
    }
);
