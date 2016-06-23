/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 自定义列控件 - 父子联动树形checkbox
 * @author lisijin (ibadplum@gmail.com)
 *         hongfeng (homfen@outlook.com)
 */
define(
    function (require) {
        var u = require('underscore');
        var eoo = require('eoo');
        var InputControl = require('esui/InputControl');
        var painters = require('esui/painters');
        var esui = require('esui');
        require('./CheckboxGroup');
        require('esui/Button');

        /**
         * 自定义列
         *
         * @class ui.CustomField
         * @extends InputControl
         */
        var CustomField = eoo.create(
            InputControl,
            {
                /**
                 * 控件类型，始终为 `CustomField`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'CustomField',

                /**
                 * 初始化参数
                 *
                 * @param {Object} [options] 构造函数传入的参数
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var properties = {
                        datasource: [],
                        defaultValue: [],
                        value: []
                    };
                    u.extend(properties, CustomField.defaultProperties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @override
                 * @protected
                 */
                initStructure: function () {
                    this.refreshContent();
                },

                /**
                 * 渲染主体
                 */
                refreshContent: function () {
                    buildDOMStructure.call(this);
                    this.initChildren();
                },

                /**
                 * 生成DOM节点
                 *
                 * @param {string} [part] part名称
                 * @param {string} [nodeName] 元素类型
                 * @param {string} [innerHTML] 内部HTML
                 * @return {string} 返回整个HTML
                 */
                create: function (part, nodeName, innerHTML) {
                    return this.helper.getPartBeginTag(part, nodeName)
                        + innerHTML
                        + this.helper.getPartEndTag(part, nodeName);
                },

                /**
                 * 初始化Event
                 *
                 * @override
                 * @protected
                 */
                initEvents: function () {
                    this.getChild('confirmCustom').on('click', u.bind(function (e) {
                        var checkboxGroup = this.getChild('checkboxGroup');
                        var value = checkboxGroup.getValue();
                        checkboxGroup.setRawValue(value);
                        this.setValue(value);
                        this.fire('ok', {
                            value: value
                        });
                        this.fire('change');
                        this.fire('changed');
                    }, this));

                    this.getChild('cancelCustom').on('click', u.bind(function (e) {
                        var value = this.getValue();
                        var valueArr = value ? value.split(',') : [];
                        this.getChild('checkboxGroup').setValue(valueArr);
                        this.fire('cancel');
                    }, this));

                    this.getChild('restore').on('click', u.bind(function (e) {
                        this.getChild('checkboxGroup').setValue(this.defaultValue);
                    }, this));
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
                        paint: function (customField, datasource) {
                            repaintCheckBox.call(customField);
                        }
                    }
                )
            }
        );

        /**
         * 挂接到CustomField上以便进行全局替换
         */
        CustomField.defaultProperties = {
            titleText: '自定义列',
            selectedText: '已选择',
            restoreText: '恢复默认',
            okText: '确认',
            cancelText: '取消'
        };

        function repaintCheckBox() {
            var value = this.getValue();
            var properties = {
                datasource: this.datasource,
                value: value ? value.split(',') : []
            };
            var checkboxGroup = this.getChild('checkboxGroup');
            if (checkboxGroup) {
                checkboxGroup.setProperties(properties);
            }
            else {
                checkboxGroup = esui.create('CheckboxGroup', properties);
                this.addChild(checkboxGroup, 'checkboxGroup');
                var checkboxGroupId = this.helper.getId('checkboxGroup');
                checkboxGroup.appendTo(document.getElementById(checkboxGroupId));

                checkboxGroup.on('change', u.bind(function () {
                    var count = this.getChild('checkboxGroup').returnCount();
                    this.helper.getPart('total').innerHTML = count.subCount;
                    this.helper.getPart('count').innerHTML = count.subSelected;
                }, this));
            }
            checkboxGroup.fire('change');
        }

        /**
         * 构建DOM结构
         */
        function buildDOMStructure() {

            // --------------------------------------------------------------------------
            // 头部-标题
            var title = this.create('title', 'span', this.titleText);

            // 头部-恢复默认
            var restore = ''
                + '<div data-ui-variants="link" data-ui-type="Button" data-ui-child-name="restore"'
                + ' >' + this.restoreText + '</div>';

            // 头部-提示
            var warning = this.create('warning', 'span', '');

            // 头部-已选择
            var count = this.create('count', 'span', 0);
            var total = this.create('total', 'span', 0);
            var selected = this.create(
                'selected', 'span',
                this.selectedText + '　[' + count + '/' + total + ']'
            );

            // 头部
            var head = this.create('head', 'div', title + restore + warning + selected);

            // ------------------------------------------------------------------------

            // 胸部
            var checkboxGroupId = this.helper.getId('checkboxGroup');
            var boxesWrap = '<div id="' + checkboxGroupId + '"></div>';
            var body = this.create('body', 'div', boxesWrap);

            // -------------------------------------------------------------------------
            var ok = ''
                + '<div data-ui-variants="primary" data-ui-type="Button" data-ui-child-name="confirmCustom"'
                + ' >' + this.okText + '</div>';

            var cancel = ''
                + '<div data-ui-variants="link" data-ui-type="Button" data-ui-child-name="cancelCustom"'
                + ' data-ui-skin="link">' + this.cancelText + '</div>';

            // 脚部
            var foot = this.create('foot', 'div', ok + cancel);
            // -------------------------------------------------------------------------

            this.main.innerHTML = this.create('wrapper', 'div', head + body + foot);
        }

        esui.register(CustomField);
        return CustomField;
    }
);
