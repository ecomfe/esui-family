/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 简单版拾色器
 * @exports SimpleColorPicker
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        /**
         * 简单版拾色器
         *
         * @class SimpleColorPicker
         * @extends esui.InputControl
         */
        var exports = {};

        /**
         * 控件类型
         *
         * @override
         */
        exports.type = 'SimpleColorPicker';

        /**
         * 初始化参数
         *
         * @override
         * @protected
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);
            this.setProperties(properties);
        };

        function syncValue(colorPicker) {
            var blocks = colorPicker.main.getElementsByTagName('span');
            var blockClass = colorPicker.helper.getPartClasses('block')[0];

            u.each(
                blocks,
                function (block) {
                    if (lib.hasClass(block, blockClass)) {
                        var color = lib.getAttribute(block, 'data-value');
                        if (color === this.rawValue) {
                            this.helper.addPartClasses('selected', block);
                        }
                        else {
                            this.helper.removePartClasses('selected', block);
                        }
                    }
                },
                colorPicker
            );
        }

        /**
         * @override
         */
        exports.initStructure = function () {
            this.main.innerHTML = createColorBlocks(this);
        };

        /**
         * 创建候选颜色块
         *
         * @param {SimpleColorPicker} colorPicker 控件实例
         */
        function createColorBlocks(colorPicker) {
            var blockTemplate = ''
                + '<span class="' + colorPicker.helper.getPartClassName('block') + '" '
                +     'title="${text}" '
                +     'data-value="${value}" '
                +     'style="background-color: ${diplayValue}">'
                +     '${text}'
                + '</span>';

            var html = '';
            u.each(
                colorPicker.colors,
                function (color, index) {
                    color.diplayValue = color.value;
                    if (color.value.indexOf('#') < 0) {
                        color.diplayValue = '#' + color.value;
                    }
                    html += lib.format(blockTemplate, color);
                }
            );
            html += '</div>';

            return html;
        }

        /**
         * @override
         */
        exports.initEvents = function () {
            this.$super(arguments);

            this.helper.addDOMEvent(this.main, 'click', chooseColor);
        };

        /**
         * 选择颜色
         *
         * @param {Event} e DOM事件对象
         */
        function chooseColor(e) {
            var blockClass = this.helper.getPartClasses('block')[0];
            if (lib.hasClass(e.target, blockClass)) {
                var color = lib.getAttribute(e.target, 'data-value');
                this.setRawValue(color);
            }
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        exports.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (colorPicker, rawValue) {
                    syncValue(colorPicker);
                }
            }
        );

        /**
         * 批量更新属性并重绘
         *
         * @fires SimpleColorPicker#change
         * @override
         * @public
         */
        exports.setProperties = function (properties) {
            var changes = this.$super(arguments);

            if (changes.hasOwnProperty('rawValue')) {
                this.fire('change');
            }

            return changes;
        };

        var SimpleColorPicker = require('eoo').create(InputControl, exports);

        /**
         * 默认属性
         *
         * @static
         * @type {Object}
         * @public
         */
        SimpleColorPicker.defaultProperties = {
            colors: [
                // row1
                {text: '#ffffff', value: 'ffffff'},
                {text: '#ededed', value: 'ededed'},
                {text: '#d2d2d2', value: 'd2d2d2'},
                {text: '#bfbfbf', value: 'bfbfbf'},
                {text: '#a0a0a0', value: 'a0a0a0'},
                {text: '#898989', value: '898989'},
                {text: '#6f6f6f', value: '6f6f6f'},
                {text: '#626262', value: '626262'},
                {text: '#434343', value: '434343'},
                {text: '#333333', value: '333333'},
                {text: '#1b1b1b', value: '1b1b1b'},
                {text: '#000000', value: '000000'},
                // row2
                {text: '#50a7f9', value: '50a7f9'},
                {text: '#6ebf40', value: '6ebf40'},
                {text: '#fff45c', value: 'fff45c'},
                {text: '#f39017', value: 'f39017'},
                {text: '#ec5d57', value: 'ec5d57'},
                {text: '#b36ae2', value: 'b36ae2'},
                {text: '#0065c0', value: '0065c0'},
                {text: '#92d500', value: '92d500'},
                {text: '#f5d327', value: 'f5d327'},
                {text: '#c82503', value: 'c82503'},
                {text: '#f39017', value: 'f39017'},
                {text: '#ec5d57', value: 'ec5d57'},
                // row3
                {text: '#86ccc8', value: '86ccc8'},
                {text: '#acd599', value: 'acd599'},
                {text: '#7fcdf4', value: '7fcdf4'},
                {text: '#8c97cb', value: '8c97cb'},
                {text: '#aa8abd', value: 'aa8abd'},
                {text: '#f19fc2', value: 'f19fc2'},
                {text: '#f26071', value: 'f26071'},
                {text: '#e60013', value: 'e60013'},
                {text: '#eb6102', value: 'eb6102'},
                {text: '#f8b551', value: 'f8b551'},
                {text: '#7fc169', value: '7fc169'},
                {text: '#009d97', value: '009d97'},
                // row4
                {text: '#0068b7', value: '0068b7'},
                {text: '#1e2087', value: '1e2087'},
                {text: '#611986', value: '611986'},
                {text: '#920783', value: '920783'},
                {text: '#e5007f', value: 'e5007f'},
                {text: '#a40000', value: 'a40000'},
                {text: '#a84300', value: 'a84300'},
                {text: '#cea973', value: 'cea973'},
                {text: '#996b34', value: '996b34'},
                {text: '#81511c', value: '81511c'},
                {text: '#372f2c', value: '372f2c'},
                {text: '#a6927d', value: 'a6927d'}
            ],
            mode: 'block'
        };

        require('esui').register(SimpleColorPicker);
        return SimpleColorPicker;
    }
);
