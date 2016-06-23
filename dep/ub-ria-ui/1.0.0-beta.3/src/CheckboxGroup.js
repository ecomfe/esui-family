/**
 * UB-RIA-UI 1.0
 *
 * @ignore
 * @file 二级checkbox
 * @author hongfeng(homfen@outlook.com)
 */

define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var eoo = require('eoo');
        var InputControl = require('esui/InputControl');
        var painters = require('esui/painters');
        var esui = require('esui');
        require('esui/CheckBox');

        var CheckboxGroup = eoo.create(
            InputControl,
            {

                /**
                 * 控件类型，始终为 `CheckboxGroup`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'CheckboxGroup',

                /**
                 * 初始化参数
                 *
                 * @param {Object} [options] 构造函数传入的参数
                 * @protected
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        datasource: [],
                        value: [],
                        maxSelected: 0,
                        canSelectAll: false,
                        selectAllText: ''
                    };

                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @method
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    buildHtml.call(this);
                },

                /**
                 * 初始化事件
                 *
                 * @method
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    this.helper.addDOMEvent(this.main, 'click', u.bind(
                        function (e) {
                            var target = e.target;
                            if (target.tagName === 'INPUT' && !target.disabled) {
                                if (target.value === 'all') {
                                    if (target.checked) {
                                        var allValues = this.getAllValue();
                                        this.setValue(allValues);
                                    }
                                    else {
                                        this.setValue([]);
                                    }
                                    return;
                                }
                                var inputs = this.main.getElementsByTagName('input');
                                // 父级
                                if (!target.name) {
                                    checkSub(inputs, target.value, target.checked, target);
                                }
                                // 子级
                                else {
                                    checkSuper(inputs, target.name, target.checked);
                                }
                                checkAll.call(this);

                                this.fire('change');
                                this.fire('changed');
                            }
                        }, this)
                    );
                },

                /**
                 * 获取选中的checkbox值
                 *
                 * @override
                 * @return {Array}
                 */
                getValue: function () {
                    var inputs = this.main.getElementsByTagName('input');
                    var subs = u.filter(inputs, function (input) {
                        return !!input.name;
                    });

                    return u.reduce(subs, function (result, input) {
                        input.checked && result.push(input.value);
                        return result;
                    }, []);
                },

                /**
                 * 获取选中的checkbox值
                 *
                 * @override
                 * @return {Array}
                 */
                getRawValue: function () {
                    return this.getValue();
                },

                /**
                 * 获取所有的值
                 *
                 * @return {Array} 所有的值
                 */
                getAllValue: function () {
                    var allValues = [];
                    u.each(this.datasource, function (sup) {
                        u.each(sup.children, function (sub) {
                            allValues.push(sub.value);
                        });
                    });
                    return allValues;
                },

                /**
                 * 根据传入的值勾选checkbox
                 *
                 * @override
                 */
                setValue: function (value) {
                    if (typeof value === 'string') {
                        value = value.split(',');
                        this.setRawValue(value);
                    }
                    else if (u.isArray(value)) {
                        this.setRawValue(value);
                    }
                },

                /**
                 * 根据传入的值勾选checkbox
                 *
                 * @override
                 */
                setRawValue: function (rawValue) {
                    var inputs = this.main.getElementsByTagName('input');
                    var subs = u.filter(inputs, function (input) {
                        return !!input.name;
                    });

                    var strRawValue = u.map(rawValue, function (val) {
                        return val.toString();
                    });
                    this.rawValue = rawValue;
                    u.each(subs, function (input) {
                        if (u.contains(strRawValue, input.value.toString())) {
                            input.checked = true;
                        }
                        else {
                            input.checked = false;
                        }

                        var name = input.name;
                        checkSuper(inputs, name, input.checked);
                    }, this);
                    checkAll.call(this);

                    this.fire('change');
                },

                /**
                 * 返回checkbox总数和勾选数，供外部使用
                 *
                 * @return {Object}
                 */
                returnCount: function () {
                    var inputs = this.main.getElementsByTagName('input');
                    if (inputs.length) {
                        var all = u.groupBy(inputs, function (input) {
                            return input.name ? 'sub' : 'super';
                        });

                        var subCount = all.sub.length;
                        var subSelected = u.reduce(all.sub, function (num, item) {
                            return num + (item.checked ? 1 : 0);
                        }, 0);
                        return {subCount: subCount, subSelected: subSelected};
                    }
                    return {subCount: 0, subSelected: 0};
                },

                /**
                 * 设置控件禁用状态
                 *
                 * @param {boolean} disabled 是否禁用
                 */
                setDisabled: function (disabled) {
                    this[disabled ? 'addState' : 'removeState']('disabled');
                    var action = disabled ? 'disable' : 'enable';
                    var inputs = this.main.getElementsByTagName('input');
                    u.each(inputs, function (input) {
                        var checkbox = esui.getControlByDOM(input.parentNode);
                        if (checkbox) {
                            if (checkbox.alwaysDisabled == null) {
                                checkbox.alwaysDisabled = checkbox.isDisabled();
                            }
                            !checkbox.alwaysDisabled && checkbox[action]();
                        }
                    });
                },

                /**
                 * 设置控件状态为禁用
                 */
                disable: function () {
                    this.setDisabled(true);
                },

                /**
                 * 设置控件状态为启用
                 */
                enable: function () {
                    this.setDisabled();
                },

                /**
                 * 判断控件是否不可用
                 *
                 * @return {boolean}
                 */
                isDisabled: function () {
                    return this.hasState('disabled');
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
                        paint: function (checkboxGroup, datasource) {
                            buildHtml.call(checkboxGroup);
                            checkboxGroup.fire('change');
                        }
                    },
                    {
                        name: 'disabled',
                        paint: function (checkboxGroup, disabled) {
                            checkboxGroup.setDisabled(disabled);
                        }
                    },
                    {
                        name: ['value', 'rawValue'],
                        paint: function (checkboxGroup, value, rawValue) {
                            if (value) {
                                checkboxGroup.setValue(value);
                            }
                            else if (rawValue) {
                                checkboxGroup.setRawValue(rawValue);
                            }
                        }
                    }
                )
            }
        );

        /**
         * 生成DOM节点
         *
         * @param {string} [part] part名称
         * @param {string} [nodeName] 元素类型
         * @param {string} [innerHTML] 内部HTML
         * @return {string} 返回整个HTML
         */
        function create(part, nodeName, innerHTML) {
            return this.helper.getPartBeginTag(part, nodeName)
                + innerHTML
                + this.helper.getPartEndTag(part, nodeName);
        }

        /**
         * 生成所有checkbox
         *
         */
        function buildHtml() {
            var selectAllText = this.selectAllText || '选择全部';
            var selectAll = '';
            var body = '';
            var inputTpl = '<input type="checkbox" title="${title}" data-ui-variants="custom" '
                + 'data-ui-type="CheckBox" data-ui-title="${title}" '
                + 'id="${id}" data-ui-value="${value}" data-ui-disabled="${disabled}">';
            if (this.canSelectAll) {
                selectAll = lib.format(
                    inputTpl,
                    {
                        title: selectAllText,
                        value: 'all',
                        id: this.helper.getId('all')
                    }
                );
                selectAll = create.call(this, 'selectAll', 'div', selectAll);
            }

            var all = u.clone(this.datasource);
            u.each(all, function (fields, dimension) {

                // 这个维度下没有自定义列
                if (!fields.children.length) {
                    return;
                }

                var superValue = fields.value;
                var legend = lib.format(
                    inputTpl,
                    {
                        title: fields.text,
                        value: superValue,
                        id: this.helper.getId(dimension + '-super'),
                        disabled: fields.disabled ? 'disabled' : ''
                    }
                );

                var head = create.call(this, 'dimension-head-' + dimension, 'div', legend);

                var subHtml = '';
                if (fields.hasGroup) {
                    var groups = sortByGroup(fields.children);
                    u.each(groups, function (group) {
                        var groupLabel = create.call(this, 'dimension-groupLabel', 'div', group.groupName);
                        var boxes = buildChildren.call(this, group.children, dimension, superValue);
                        var groupBody = create.call(this, 'dimension-groupBody', 'div', boxes);
                        var groupHtml = create.call(this, 'dimension-group', 'div', groupLabel + groupBody);
                        subHtml += groupHtml;
                    }, this);
                }
                else {
                    subHtml = buildChildren.call(this, fields.children, dimension, superValue);
                }

                var groupWrap = create.call(this, 'dimension-groupWrap', 'div', subHtml);

                body += create.call(this, 'dimension-' + dimension, 'section', head + groupWrap);
            }, this);

            body = create.call(this, 'body', 'div', body);
            var html = selectAll + body;
            this.main.innerHTML = html;
            this.helper.initChildren();

            var inputs = this.main.getElementsByTagName('input');
            inputs = Array.prototype.slice.call(inputs);
            inputs.forEach(function (input) {
                var parentInput = input.parentNode;
                if (parentInput) {
                    var parentValue = parentInput.getAttribute('data-ui-parent-value');
                    if (parentValue) {
                        input.setAttribute('name', parentValue);
                    }
                }
            });
        }

        /**
         * 生成子元素
         *
         * @param {Array} children 子列表
         * @param {string} dimension dimension
         * @param {string} superValue 父级的值
         * @return {string} html
         */
        function buildChildren(children, dimension, superValue) {
            var boxes = [];
            u.each(children, function (item, index) {
                var tpl = '<input data-ui-variants="custom" type="checkbox" '
                    + 'data-ui-type="CheckBox" data-ui-value="${value}" '
                    + 'title="${title}" data-ui-title="${title}" id="${id}" data-ui-parent-value="${name}"'
                    + (item.disabled
                       ? ' data-ui-disabled="disabled">'
                       : '>');

                var box = lib.format(
                    tpl,
                    {
                        title: item.text,
                        value: item.value,
                        id: this.helper.getId(dimension + '-' + item.value),
                        name: superValue
                    }
                );
                boxes.push(box);
            }, this);
            return boxes.join('\n');
        }

        /**
         * 将列表按group分类
         *
         * @param {Array} list 列表
         * @return {Array} results
         */
        function sortByGroup(list) {
            var results = [];
            u.each(list, function (item) {
                var group = item.group;
                if (group) {
                    var groupWrap = u.findWhere(results, {group: group});
                    if (groupWrap) {
                        groupWrap.children.push(item);
                        if (item.groupName && !groupWrap.groupName) {
                            groupWrap.groupName = item.groupName;
                        }
                    }
                    else {
                        groupWrap = {
                            group: group,
                            groupName: item.groupName,
                            children: [item]
                        };
                        results.push(groupWrap);
                    }
                }
            });
            u.each(results, function (group, index) {
                if (!group.groupName) {
                    group.groupName = index + 1;
                }
            });
            return results;
        }

        /**
         * 根据上级checkbox检查下级checkbox
         *
         * @param {Array} [inputs] 所有的inputs
         * @param {string} [groupName] 要检查的inputs的group
         * @param {boolean} [checked] 选中状态
         * @param {Object} [parent] 父级元素
         */
        function checkSub(inputs, groupName, checked, parent) {
            var subInputs = u.filter(inputs, function (input) {
                return input.name === groupName;
            });

            var allChecked = true;
            var someChecked = false;
            u.each(subInputs, function (input) {
                !input.disabled && (input.checked = checked);
                if (input.checked) {
                    someChecked = true;
                }
                else {
                    allChecked = false;
                }
            });
            if (allChecked) {
                parent.indeterminate = false;
            }
            else if (someChecked) {
                parent.indeterminate = true;
            }
            else {
                parent.indeterminate = false;
            }
        }

        /**
         * 根据下级所有checkbox检查上级checkbox
         *
         * @param {Array} [inputs] 所有的inputs
         * @param {string} [groupName] 要检查的inputs的group
         * @param {boolean} [checked] 选中状态
         */
        function checkSuper(inputs, groupName, checked) {
            var superInput = u.find(inputs, function (input) {
                return input.value === groupName;
            });

            var otherSiblings = u.filter(inputs, function (input) {
                return input.name === groupName;
            });

            var allChecked = true;
            var someChecked = false;
            u.each(otherSiblings, function (input) {
                if (input.checked) {
                    someChecked = true;
                }
                else {
                    allChecked = false;
                }
            });
            allChecked = checked && allChecked;

            if (allChecked) {
                superInput.checked = true;
                superInput.indeterminate = false;
            }
            else if (someChecked) {
                superInput.checked = false;
                superInput.indeterminate = true;
            }
            else {
                superInput.checked = false;
                superInput.indeterminate = false;
            }
        }

        /**
         * 检查全选按钮
         */
        function checkAll() {
            if (!this.canSelectAll) {
                return;
            }
            var selectedValues = this.getValue();
            var allValues = this.getAllValue();
            var allId = this.helper.getId('all');
            var allInput = document.getElementById(allId);
            if (selectedValues.length === allValues.length) {
                allInput.checked = true;
                allInput.indeterminate = false;
            }
            else if (selectedValues.length) {
                allInput.checked = false;
                allInput.indeterminate = true;
            }
            else {
                allInput.checked = false;
                allInput.indeterminate = false;
            }
        }

        esui.register(CheckboxGroup);
        return CheckboxGroup;
    }
);
