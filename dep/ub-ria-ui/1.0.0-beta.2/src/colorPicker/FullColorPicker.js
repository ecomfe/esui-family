/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 完整版拾色器
 * @exports FullColorPicker
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var Control = require('esui/Control');
        var u = require('underscore');
        var eoo = require('eoo');
        var painters = require('esui/painters');
        var esui = require('esui');

        require('./AdvancedColorPicker');
        require('./SimpleColorPicker');

        /**
         * @class FullColorPicker
         * @extends esui.InputControl
         */
        var FullColorPicker = eoo.create(
            Control,
            {
                /**
                 * 控件类型
                 *
                 * @override
                 */
                type: 'FullColorPicker',

                /**
                 * 初始化参数
                 *
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {
                        // 默认颜色
                        hex: '000000',
                        displayHex: '000000',
                        alpha: 100,
                        displayAlpha: 100,
                        // 默认拾色器模式，支持 'simple' | 'advanced' | 'full'
                        defaultMode: 'simple',
                        // 是否支持切换为'full'型
                        // mode为'simple'，属性可配
                        // mode为'advanced'，属性可配
                        // mode为'full'，属性只能为false
                        switchable: true,
                        // 是否支持alpha选择
                        hasAlpha: true
                    };

                    u.extend(properties, FullColorPicker.defaultProperties, options);

                    // mode是full型，switchable必须是false
                    if (properties.mode === 'full' || properties.switchable === false) {
                        properties.switchable = false;
                    }

                    this.setProperties(properties);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    var html = [];
                    var advancedHTML = generateAdvancedHTML.call(this);
                    var simpleHTML = generateSimpleHTML.call(this);
                    // 根据模式创建结构
                    if (this.defaultMode === 'full' || this.switchable) {
                        html = [advancedHTML, simpleHTML];
                    }
                    else if (this.defaultMode === 'simple') {
                        html = [simpleHTML];
                    }
                    else {
                        html = [advancedHTML];
                    }
                    // 如果是可切换的，还要加上切换按钮
                    if (this.switchable) {
                        var switchClass = this.helper.getPartClassName('mode-switch');
                        html.push('<div data-ui-variants="link" data-ui-type="Button" data-ui-child-name="switch" ');
                        html.push('class="' + switchClass + '">' + this.fullModeText + '</div>');
                    }

                    this.main.innerHTML = html.join('');
                    this.initChildren();
                    this.currentMode = this.defaultMode;
                    this.addState(this.defaultMode);
                },

                /**
                 * @override
                 * @fires FullColorPicker#change
                 */
                initEvents: function () {
                    var control = this;
                    // 大色盘
                    var advancedColorPicker = this.getChild('advanced');
                    if (advancedColorPicker) {
                        // 高级色盘改变引发简单色盘色彩重置
                        advancedColorPicker.on(
                            'change',
                            function () {
                                var hex = this.getDisplayHex();
                                var alpha = this.getDisplayAlpha();
                                control.displayHex = hex;
                                control.displayAlpha = alpha;
                                control.fire('change');
                            }
                        );
                    }

                    // 基本色盘变化
                    var SimpleColorPicker = this.getChild('simple');
                    if (SimpleColorPicker) {
                        SimpleColorPicker.on(
                            'change',
                            function () {
                                var color = this.getRawValue();
                                control.displayHex = color;
                                updateAdvancedColorPicker.call(control);
                                control.fire('change');
                            }
                        );
                    }

                    var switchButton = this.getChild('switch');
                    if (switchButton) {
                        switchButton.on('click', u.bind(switchState, this));
                    }
                },

                /**
                 * 渲染自身
                 *
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: ['hex', 'alpha'],
                        paint: function (colorPicker, hex, alpha) {
                            if (hex == null && alpha == null) {
                                return;
                            }
                            // 更新显示值
                            colorPicker.displayHex = hex;
                            colorPicker.displayAlpha = alpha;

                            // 更新高级模式
                            var advanced = colorPicker.getChild('advanced');
                            if (advanced) {
                                advanced.setProperties({hex: hex, alpha: alpha});
                            }
                        }
                    }
                ),

                /**
                 * 获取色值
                 *
                 * @method FullColorPicker#getDisplayHex
                 * @return {string}
                 * @public
                 */
                getDisplayHex: function () {
                    return this.displayHex;
                },

                /**
                 * 获取透明度
                 *
                 * @method FullColorPicker#getDisplayAlpha
                 * @return {number}
                 * @public
                 */
                getDisplayAlpha: function () {
                    return this.displayAlpha;
                }
            }
        );

        FullColorPicker.defaultProperties = {
            fullModeText: '完整模式',
            advancedModeText: '高级模式',
            simpleModeText: '简单模式'
        };

        function generateAdvancedHTML() {
            return ''
                + '<div class="' + this.helper.getPartClassName('advanced-section') + '">'
                +     '<div data-ui-type="AdvancedColorPicker" data-ui-child-name="advanced"'
                +         'data-ui-no-alpha="' + (this.hasAlpha ? 'false' : 'true') + '">'
                +     '</div>'
                + '</div>';
        }

        function generateSimpleHTML() {
            return ''
                + '<div class="' + this.helper.getPartClassName('simple-section') + '">'
                +     '<div data-ui-type="SimpleColorPicker" data-ui-child-name="simple">'
                +     '</div>'
                + '</div>';
        }

        /**
         * 模式切换
         */
        function switchState() {
            var newMode;
            var switchButton = this.getChild('switch');
            // 如果当前处于full模式，切换回默认模式
            if (this.currentMode === 'full') {
                newMode = this.defaultMode;
                switchButton.setContent(this.fullModeText);
            }
            else {
                newMode = 'full';
                if (this.currentMode === 'simple') {
                    switchButton.setContent(this.simpleModeText);
                }
                else {
                    switchButton.setContent(this.advancedModeText);
                }
            }

            this.removeState(this.currentMode);
            this.addState(newMode);
            this.currentMode = newMode;
        }

        function updateAdvancedColorPicker() {
            // 更新色盘
            var colorPicker = this.getChild('advanced');
            if (colorPicker) {
                var color = this.displayHex;
                colorPicker.updateHex(color);
                var alpha = this.displayAlpha;
                colorPicker.updateAlpha(alpha);
            }
        }

        esui.register(FullColorPicker);
        return FullColorPicker;
    }
);
