/**
 * DSP
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 行内编辑控件
 * @exports ui.InlineEdit
 * @author shenbin(shenbin01@baidu.com)
 */
define(
    function (require) {
        require('esui/behavior/jquery-ui');

        var u = require('underscore');
        var eoo = require('eoo');
        var esui = require('esui');
        var Control = require('esui/Control');
        var $ = require('jquery');

        /**
         * 本控件的用途类似一个其他控件的遥控器，主要场景为行内编辑
         * 通过本控件控制另一个控件的 `显示` / `隐藏` 的状态
         * 通过 `targetId` 属性值，指定控制某个特定的控件
         * 被操控的控件，通过 `action@cancel` 与 `action@submit` 两个事件与本控件的进行交互
         * 分别对应 `关闭控件显示` 与 `完成提交并隐藏控件` 两种操作
         *
         * @class ui.InlineEdit
         * @extends esui.Control
         */
        var InlineEdit = eoo.create(
            Control,
            {

                /**
                 * @override
                 */
                type: 'InlineEdit',

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = u.extend({}, this.$self.defaultProperties, options);
                    this.setProperties(properties);
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
                    this.helper.addDOMEvent(this.main, 'click', u.bind(onClickMain, this));
                },

                /**
                 * 设置关联控件的事件
                 *
                 * @protected
                 * @method ui.InlineEdit#bindTargetEvents
                 */
                bindTargetEvents: function () {
                    var targetId = this.get('targetId');
                    var target = this.viewContext.get(targetId);

                    if (target) {
                        target.un('action@entitysave');
                        target.un('action@cancel');

                        target.on('action@entitysave', u.bind(onSubmit, this));
                        target.on('action@cancel', u.bind(onCancel, this));
                    }
                }
            }
        );

        /**
         * 点击主元素触发的事件
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onClickMain(e) {
            var targetId = this.get('targetId');
            var target = this.viewContext.get(targetId);

            // 设置容器属性
            target.set('actionOptions', this.get('actionOptions'));
            target.set('url', this.get('actionUrl'));

            // 显示容器
            target.show();

            // 定位容器
            var targetMain = $(target.main);
            targetMain.css('position', 'absolute');
            targetMain.position({
                of: this.main,
                at: this.at,
                my: this.my
            });

            // 设置容器事件
            this.bindTargetEvents();
        }

        /**
         * 关联控件的提交操作触发的事件
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onSubmit(e) {
            e.preventDefault();
            var targetId = this.get('targetId');
            var target = this.viewContext.get(targetId);

            target.hide();

            this.fire('modify', {entity: e.entity});
        }

        /**
         * 关联控件的取消操作触发的事件
         *
         * @event
         * @param {mini-event.Event} e 事件对象
         */
        function onCancel(e) {
            var targetId = this.get('targetId');
            var target = this.viewContext.get(targetId);

            target.hide();

            this.fire('cancel');
        }

        /**
         * 默认属性
         *
         * @member ui.InlineEdit.defaultProperties
         */
        InlineEdit.defaultProperties = {
            at: 'left top',
            my: 'left top'
        };

        esui.register(InlineEdit);

        return InlineEdit;
    }
);
