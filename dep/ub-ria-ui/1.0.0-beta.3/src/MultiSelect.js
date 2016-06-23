/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 下拉框控件
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var Layer = require('esui/Layer');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var $ = require('jquery');
        var esui = require('esui');

        /**
         * 'MultiSelect'控件使用的层类
         * @extends Layer
         * @ignore
         * @constructor
         */
        var MultiSelectLayer = eoo.create(Layer, {
            create: function () {
                var ele = this.$super(arguments);
                $(ele).addClass(this.control.helper.getPrefixClass('dropdown'));
                $(this.control.main).after(ele);
                return ele;
            },

            layerFootTpl: [
                '<button type="button" class="${confirmClass}" data-ui="type:Button;variants:primary"'
                    + 'data-ui-child-name="confirm">${okText}</button>',
                '<button type="button" class="${cancelClass}" data-ui="type:Button;variants:link"'
                    + 'data-ui-child-name="cancel">${cancelText}</button>'
            ].join(''),

            render: function (element) {
                var multiSelector = this.control;
                var helper = multiSelector.helper;

                // 渲染layer主体部分
                var html = helper.getPartBeginTag('wrapper', 'div');
                for (var i = 0; i < this.control.datasource.length; i++) {
                    html += multiSelector.getItemHTML(i);
                }
                html += helper.getPartEndTag('wrapper', 'div');

                // 渲染layer底部确认和取消按钮
                if (multiSelector.footer) {
                    html += this.getLayerFoot();
                }

                element.innerHTML = html;
                helper.initChildren(element);
            },

            getLayerFoot: function () {
                var multiSelect = this.control;
                var helper = multiSelect.helper;
                var footBegin = helper.getPartBeginTag('layer-footer', 'div');
                var footEnd = helper.getPartEndTag('layer-footer', 'div');
                var data = {
                    confirmClass: helper.getPrimaryClassName('layer-confirm'),
                    cancelClass: helper.getPrimaryClassName('layer-cancel'),
                    okText: multiSelect.okText,
                    cancelText: multiSelect.cancelText
                };
                var footBody = lib.format(this.layerFootTpl, data);
                return footBegin + footBody + footEnd;
            },

            initBehavior: function (element) {
                var multiSelect = this.control;
                var helper = multiSelect.helper;

                // item点击事件
                $(element).on('click', 'input', u.bind(itemClickHandler, multiSelect));

                // 确定、取消事件绑定
                if (multiSelect.footer) {
                    var layerConfirm = multiSelect.getChild('confirm');
                    var layerCancel = multiSelect.getChild('cancel');
                    layerConfirm.on('click', u.bind(confirmHandler, multiSelect));
                    layerCancel.on('click', u.bind(cancelHandler, multiSelect));
                }
            },

            syncState: function (element) {
                var helper = this.control.helper;

                // 根据selectedIndex的值更新视图
                var selectClass = helper.getPrimaryClassName('item-checked');
                var selectedIndex = lib.toDictionary(this.control.selectedIndex);

                for (var i = 0; i < this.control.datasource.length; i++) {
                    var checkInput = $(element).find('input[data-index=' + i + ']');
                    var checkItem = $(checkInput).parent();
                    if (selectedIndex[i]) {
                        checkInput.prop('checked', true);
                        $(checkItem).addClass(selectClass);
                    }
                    else {
                        checkInput.prop('checked', false);
                        $(checkItem).removeClass(selectClass);
                    }
                }
            },

            dock: {
                strictWidth: true
            },

            hide: function () {
                var multiSelect = this.control;
                // 没有确定按钮时，弹层隐藏即为确定
                if (multiSelect.footer) {
                    this.syncState(this.getElement(false));
                }
                else {
                    multiSelect.set('selectedIndex', [].concat(multiSelect.newSelectedIndex));
                }
                this.$super(arguments);
            }
        });

        /**
         * 下拉多选控件
         * @extends InputControl
         * @constructor
         */
        var MultiSelect = eoo.create(InputControl, {
            constructor: function () {
                this.$super(arguments);
                this.layer = new MultiSelectLayer(this);
            },

            /**
             * 控件类型，始终为'MultiSelect'
             * @type {string}
             * @readonly
             * @override
             */
            type: 'MultiSelect',

            initOptions: function (options) {
                var properties = {
                    multi: false,
                    title: '',
                    width: 200,
                    datasource: [],
                    selectedIndex: [],
                    footer: false,
                    maxLength: null,
                    displayText: null
                };
                u.extend(properties, MultiSelect.defaultProperties, options);

                // 如果主元素是个'<select>'元素，则需要从元素中抽取数据源，
                // 这种情况下构造函数中传入的'datasource'无效
                if (this.main.nodeName.toLowerCase() === 'select') {
                    if ($(this.main).attr('multiple') === 'multiple') {
                        properties.multi = true;
                    }
                    properties.datasource = [];
                    var elements = this.main.getElementsByTagName('option');
                    for (var i = 0, length = elements.length; i < length; i++) {
                        var item = elements[i];
                        var dataItem = {
                            name: item.name || item.text,
                            value: item.value
                        };
                        if (item.disabled) {
                            dataItem.disabled = true;
                        }
                        properties.datasource.push(dataItem);
                    }
                    this.helper.extractOptionsFromInput(this.main, properties);
                }
                properties.newSelectedIndex = [].concat(properties.selectedIndex);

                this.setProperties(properties);
            },

            /**
             * 每个节点显示的内容的模板
             * @type {string}
             */
            itemTemplate: [
                '<div title="${title}" class="${wrapperClass}">',
                    '<div class="${itemWrapperClass}">',
                    '    <input type="${type}" name="${name}" id="${id}" data-index="${dataIndex}"'
                        + 'title="${title}" value="${value}" ${checked} ${disabled} />',
                    '    <label for="${id}">${title}</label>',
                    '</div>',
                '</div>'
            ].join(''),

            headItemTemplate: [
                '<div title="${title}" class="${headerClass}">',
                '    <span">${title}</span>',
                '</div>'
            ].join(''),

            /**
             * 获取每个节点显示的内容
             *
             * @param {number} index 当前节点的索引
             * @return {string} 返回HTML片段
             */
            getItemHTML: function (index) {
                var item = this.datasource[index];
                if (u.isFunction(this.getCustomItemHTML)) {
                    return this.getCustomItemHTML(item);
                }
                var helper = this.helper;
                var classes = helper.getPartClasses('item');

                // checked
                var wrapperClass = '';
                var itemWrapperClass = '';
                if (this.multi) {
                    itemWrapperClass += [
                        helper.getPrefixClass('checkbox-custom'),
                        helper.getPrefixClass('checkbox-single')
                    ].join(' ');
                }
                else {
                    itemWrapperClass += [
                        helper.getPrefixClass('radio-custom'),
                        helper.getPrefixClass('radio-single')
                    ].join(' ');
                }

                var valueIndex = lib.toDictionary(this.selectedIndex);
                if (valueIndex[index]) {
                    wrapperClass += ' ' + helper.getPartClassName('item-checked');
                }

                var headerClass = '';
                if (item.header) {
                    headerClass += ' ' + helper.getPartClassName('item-header');
                }

                if (item.disabled) {
                    wrapperClass += ' ' + helper.getPartClassName('item-disabled');
                }

                var data = {
                    wrapperClass: classes.join(' ') + ' ' + wrapperClass,
                    id: helper.getId('multiselect-' + index),
                    type: this.multi ? 'checkbox' : 'radio',
                    name: this.name,
                    title: lib.trim(item.title || item.name || item.text),
                    value: item.value,
                    checked: valueIndex[index] ? ' checked="checked"' : '',
                    dataIndex: index,
                    headerClass: headerClass,
                    itemWrapperClass: itemWrapperClass,
                    disabled: item.disabled ? 'disabled' : ''
                };

                var tpl = item.header ? this.headItemTemplate : this.itemTemplate;
                return lib.format(tpl, data);
            },

            /**
             * 显示选中值的模板
             * @type {string}
             */
            displayTemplate: '${text}',

            /**
             * 获取选中值的内容
             * @param {meta.SelectItem | null} item 选中节点的数据项，
             * 如果{@link Select#emptyText}属性值不为空且未选中任何节点，则传递'null'
             * @return {string} 显示的HTML片段
             */
            getDisplayHTML: function (item) {
                if (u.isFunction(this.getCustomDisplayHTML)) {
                    return this.getCustomDisplayHTML(item);
                }
                if (this.displayText) {
                    return this.displayText;
                }
                if (item.length === 0) {
                    return u.escape(this.emptyText);
                }
                var displayText = '';
                $.each(item, function (index, selectItem) {
                    displayText += u.escape(selectItem.name || selectItem.text);
                    if (index !== item.length - 1) {
                        displayText += ',';
                    }
                });
                return lib.format(this.displayTemplate, {text: displayText});
            },

            /**
             * 初始化DOM结构
             * @protected
             * @override
             */
            initStructure: function () {
                var helper = this.helper;
                var arrow = 'arrow';
                var span = 'span';
                var mainElement = this.main;

                // 如果主元素是'<select>'，删之替换成'<div>'
                if (mainElement.nodeName.toLowerCase() === 'select') {
                    helper.replaceMain();
                    mainElement = this.main;
                }

                this.layer.autoCloseExcludeElements = [mainElement];
                mainElement.innerHTML = helper.getPartHTML('text', span) + helper.getPartHTML(arrow, span);

                $(helper.getPart(arrow)).addClass(helper.getIconClass());
            },

            /**
             * 初始化事件交互
             * @protected
             * @override
             */
            initEvents: function () {
                this.helper.addDOMEvent(this.main, 'click', toggle);
                this.layer.on('rendered', u.bind(addLayerClass, this));
            },

            /**
             * 将字符串类型的值转换成原始格式
             *
             * @param {string} value 字符串值
             * @return {string[]}
             * @protected
             * @override
             */
            parseValue: function (value) {
                /**
                 * @property {string} [value=""]
                 *
                 * `MultiSelect`的字符串形式的值为逗号分隔的多个值
                 */
                return value.split(',');
            },

            /**
             * 获取值
             * @return {Mixed}
             * @override
             */
            getRawValue: function () {
                if (this.selectedIndex.length === 0) {
                    return null;
                }
                var values = [];
                var datasource = this.datasource;
                u.each(this.selectedIndex, function (index) {
                    var item = datasource[index];
                    if (item) {
                        values.push(item.value);
                    }
                });
                return values;
            },

            /**
             * 重渲染
             * @method
             * @protected
             * @override
             */
            repaint: painters.createRepaint(
                InputControl.prototype.repaint,
                painters.style('width'),
                {
                    name: 'datasource',
                    paint: function (select) {
                        select.layer.repaint();
                    }
                },
                {
                    name: ['selectedIndex'],
                    paint: function (select, selectedIndex) {
                        updateValue(select);
                    }
                },
                {
                    name: ['rawValue'],
                    paint: function (select, rawValue) {
                        if (u.isArray(rawValue) && rawValue.length) {
                            var selectedItems = u.filter(
                                select.datasource,
                                function (item) {
                                    return u.indexOf(rawValue, item.value) > -1;
                                }
                            );
                            if (!select.multi) {
                                selectedItems = selectedItems.slice(-1);
                            }
                            select.selectedIndex = u.map(
                                selectedItems,
                                function (item) {
                                    return u.indexOf(select.datasource, item);
                                }
                            );
                            updateValue(select);
                        }
                    }
                },
                {
                    name: ['disabled', 'hidden', 'readOnly'],
                    paint: function (select, disabled, hidden, readOnly) {
                        if (disabled || hidden || readOnly) {
                            select.layer.hide();
                        }
                    }
                }
            ),

            /**
             * 更新{@link Select#datasource}属性，无论传递的值是否变化都会进行更新
             * @param {meta.SelectItem[]} datasource 新的数据源对象
             */
            updateDatasource: function (datasource) {
                if (!datasource) {
                    datasource = this.datasource;
                }
                this.datasource = datasource;
                var record = {name: 'datasource'};
                this.repaint([record], {datasource: record});
            },

            /**
             * 批量更新属性并重绘
             * @param {Object} properties 需更新的属性
             * @override
             * @fires change
             */
            setProperties: function (properties) {
                if (properties.datasource == null) {
                    properties.datasource = this.datasource;
                }

                if (properties.value == null
                    && properties.rawValue == null
                    && properties.selectedIndex == null
                    && properties.datasource === this.datasource
                ) {
                    properties.selectedIndex = this.selectedIndex;
                }

                var changes = this.$super(arguments);

                return changes;
            },

            /**
             * 销毁控件
             * @override
             */
            dispose: function () {
                if (this.helper.isInStage('DISPOSED')) {
                    return;
                }

                if (this.layer) {
                    this.layer.dispose();
                    this.layer = null;
                }

                this.$super(arguments);
            },

            /**
             * 获取当前选中的{@link meta.SelectItem}对象
             * @return {meta.SelectItem}
             */
            getSelectedItem: function () {
                var datasource = this.datasource;
                var selectedItems = [];
                if (u.isArray(this.selectedIndex)) {
                    $.each(this.selectedIndex, function (index, itemIndex) {
                        if (datasource[itemIndex]) {
                            selectedItems.push(datasource[itemIndex]);
                        }
                    });
                }
                return selectedItems;
            }
        });

        MultiSelect.defaultProperties = {
            emptyText: '请选择',
            okText: '确认',
            cancelText: '取消'
        };

        /**
         * 切换下拉框
         * @param {Event} e click事件对象
         */
        function toggle(e) {
            this.layer.toggle.call(this.layer, e);
            this.layer.syncState(this.layer.getElement(false));
            this.newSelectedIndex = [].concat(this.selectedIndex);
        }

        function itemClickHandler(e) {
            var target = e.target;
            // 值是否发生更改的标志位
            var isChanged = false;
            if (!this.helper.isPart(target, 'item-disabled')) {
                var index = target.getAttribute('data-index');
                var newIndex = +index;
                if (this.multi) {
                    var isNewIndex = true;
                    for (var i = 0; i < this.newSelectedIndex.length; i++) {
                        if (this.newSelectedIndex[i] === newIndex) {
                            isNewIndex = false;
                            isChanged = true;
                            this.newSelectedIndex.splice(i, 1);
                        }
                    }
                    if (isNewIndex) {
                        this.newSelectedIndex.push(+index);
                        isChanged = true;
                    }
                }
                else {
                    this.newSelectedIndex = [newIndex];
                    isChanged = true;
                }
                this.fire('itemclick');
            }
            if (this.maxLength && this.newSelectedIndex.length > this.maxLength) {
                var shiftIndex = this.newSelectedIndex.shift();
                $(this.layer.getElement(false)).find('input[data-index=' + shiftIndex + ']').removeAttr('checked');
                isChanged = false;
            }
            if (isChanged && !this.footer) {
                this.set('selectedIndex', [].concat(this.newSelectedIndex));
                this.fire('change');
            }
        }

        function confirmHandler(e) {
            this.set('selectedIndex', [].concat(this.newSelectedIndex));
            this.fire('change');
            this.layer.hide();
        }

        function cancelHandler() {
            this.set('selectedIndex', this.selectedIndex);
            this.newSelectedIndex = [].concat(this.selectedIndex);
            updateValue(this);
            this.layer.hide();
        }

        function addLayerClass() {
            this.fire('layerrendered', {layer: this.layer});
        }

        /**
         * 根据控件的值更新其视图
         * @param {Select} select 控件实例
         * @ignore
         */
        function updateValue(select) {
            // 同步显示的文字
            var textHolder = select.helper.getPart('text');
            var selectedItem = select.getSelectedItem();
            var text = select.getDisplayHTML(selectedItem);

            textHolder.innerHTML = text;
            textHolder.title = text;

            var layerElement = select.layer.getElement(false);
            if (layerElement) {
                select.layer.syncState(layerElement);
            }
        }

        esui.register(MultiSelect);
        return MultiSelect;
    }
);
