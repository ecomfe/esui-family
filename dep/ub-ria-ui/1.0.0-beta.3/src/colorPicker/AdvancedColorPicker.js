/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 高级版拾色器
 * @exports AdvancedColorPicker
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui');
        var lib = require('esui/lib');
        var Control = require('esui/Control');
        var u = require('underscore');
        var colorUtil = require('./Color');
        var eoo = require('eoo');
        var $ = require('jquery');
        var painters = require('esui/painters');

        require('esui/TextBox');
        require('esui/Label');

        require('esui/behavior/mouseproxy');

        /**
         * 高级版拾色器
         *
         * @class AdvancedColorPicker
         * @extends esui.Control
         */
        var AdvancedColorPicker = eoo.create(
            Control,
            {
                /**
                 * 控件类型
                 *
                 * @override
                 */
                type: 'AdvancedColorPicker',

                /**
                 * 初始化参数
                 *
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var properties = {
                        // 文字的话因为多数是链接，默认来个蓝色
                        hex: '0000ff',
                        displayHex: '0000ff',
                        // alpha选择开关
                        noAlpha: false,
                        alpha: 100,
                        displayAlpha: 100
                    };
                    u.extend(properties, AdvancedColorPicker.defaultProperties, options);
                    this.setProperties(properties);
                },

                /**
                 * 初始化DOM结构
                 *
                 * @override
                 */
                initStructure: function () {
                    var html = [
                        // 拾色器主面板
                        getMainCanvasHTML.call(this),
                        // 拾色器历史对比面板
                        getHistoryCompareHTML.call(this),
                        // 颜色输入
                        getColorInputHTML.call(this)
                    ];

                    this.main.innerHTML = html.join('');
                    this.initChildren();
                    if (this.noAlpha) {
                        this.addState('no-alpha');
                    }
                },

                /**
                 * @override
                 * @fires AdvancedColorPicker#change
                 */
                initEvents: function () {
                    var me = this;
                    // 画布点击
                    var canvas = this.helper.getPart('canvas');
                    $(canvas).mouseproxy(
                        {
                            start: function (event) {
                                syncValueByCanvas.call(me, event);
                                return true;
                            },
                            drag: u.bind(syncValueByCanvas, this),
                            distance: 0
                        }
                    );

                    // 色相改变
                    var hueSlider = this.helper.getPart('hue');

                    $(hueSlider).mouseproxy(
                        {
                            start: function (event) {
                                syncValueByHue.call(me, event);
                                return true;
                            },
                            drag: u.bind(syncValueByHue, this),
                            distance: 0
                        }
                    );

                    // RGB输入
                    var colorTypes = ['red', 'green', 'blue'];
                    var control = this;
                    u.each(
                        colorTypes,
                        function (colorType) {
                            var colorInput = control.getChild(colorType + 'Input');
                            colorInput.on('input', u.bind(syncValueByRGB, control));
                        }
                    );

                    // HEX输入
                    var hexInput = this.getChild('hexInput');
                    hexInput.on(
                        'input',
                        function () {
                            var hex = this.getValue();
                            control.displayHex = hex;
                            syncValueByHex.call(control);
                            updateHueSliderPointerPosition.call(control);
                        }
                    );

                    // Alpha滑动器改变
                    var alphaSlider = this.helper.getPart('alpha');
                    $(alphaSlider).mouseproxy(
                        {
                            start: function (event) {
                                syncValueByAlpha.call(me, event);
                                return true;
                            },
                            drag: u.bind(syncValueByAlpha, this),
                            distance: 0
                        }
                    );

                    // Alpha输入
                    var alphaInput = this.getChild('alphaInput');
                    alphaInput.on(
                        'input',
                        function () {
                            var alpha = this.getValue();
                            control.displayAlpha = alpha;
                            updateAlphaPointerPosition.call(control);
                            control.fire('change');
                        }
                    );
                },

                /**
                 * 渲染自身
                 *
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: 'hex',
                        paint: function (picker, hex) {
                            if (hex == null) {
                                return;
                            }
                            // 更新显示值
                            picker.displayHex = hex;
                            // 先更新hexInput
                            updateHexInput.call(picker);
                            // 然后更新其余的
                            syncValueByHex.call(picker);
                            // 更新原始历史数据
                            updateColorHistory.call(picker, 'old', picker.hex);
                        }
                    },
                    {
                        name: 'alpha',
                        paint: function (picker, alpha) {
                            if (alpha == null) {
                                return;
                            }
                            // 更新显示值
                            picker.displayAlpha = alpha;
                            updateAlphaPointerPosition.call(picker);
                            updateAlphaInput.call(picker);
                        }
                    }
                ),

                /**
                 * 更新hex值
                 *
                 * @method AdvancedColorPicker#updateHex
                 * @param {string} hex 更新后的值
                 * @public
                 */
                updateHex: function (hex) {
                    this.displayHex = hex;
                    updateHexInput.call(this);
                    syncValueByHex.call(this);
                },

                /**
                 * 更新hex透明度
                 *
                 * @method AdvancedColorPicker#updateAlpha
                 * @param {number} alpha 更新后的透明度
                 * @public
                 */
                updateAlpha: function (alpha) {
                    this.displayAlpha = alpha;
                    updateAlphaInput.call(this);
                    updateAlphaColor.call(this);
                    updateAlphaPointerPosition.call(this);
                },

                /**
                 * 获取显示的hex值
                 *
                 * @method AdvancedColorPicker#getDisplayHex
                 * @return {string}
                 * @public
                 */
                getDisplayHex: function () {
                    return this.displayHex;
                },

                /**
                 * 获取显示的透明度值
                 *
                 * @method AdvancedColorPicker#getDisplayAlpha
                 * @return {number}
                 * @public
                 */
                getDisplayAlpha: function () {
                    return this.displayAlpha;
                }
            }
        );

        AdvancedColorPicker.defaultProperties = {
            hexText: '色值',
            beforeText: '改前',
            afterText: '改后',
            alphaText: '透明度'
        };

        function getMainCanvasHTML() {
            return [
                this.helper.getPartBeginTag('pallete', 'div'),
                // hue调节
                this.helper.getPartBeginTag('hue', 'div'),
                this.helper.getPartBeginTag('hue-slider', 'div'),
                this.helper.getPartEndTag('hue-slider', 'div'),
                this.helper.getPartBeginTag('hue-pointer', 'div'),
                this.helper.getPartEndTag('hue-pointer', 'div'),
                this.helper.getPartEndTag('hue', 'div'),
                // saturation + bright调节
                this.helper.getPartBeginTag('canvas', 'div'),
                this.helper.getPartBeginTag('canvas-mask', 'div'),
                this.helper.getPartEndTag('canvas-mask', 'div'),
                this.helper.getPartBeginTag('canvas-pointer', 'span'),
                this.helper.getPartEndTag('canvas-pointer', 'span'),
                this.helper.getPartEndTag('canvas', 'div'),
                // 透明度调节
                this.helper.getPartBeginTag('alpha', 'div'),
                this.helper.getPartBeginTag('alpha-slider', 'div'),
                this.helper.getPartEndTag('alpha-slider', 'div'),
                this.helper.getPartBeginTag('alpha-pointer', 'div'),
                this.helper.getPartEndTag('alpha-pointer', 'div'),
                this.helper.getPartEndTag('alpha', 'div'),
                this.helper.getPartEndTag('pallete', 'div')
            ].join('');
        }

        function getHistoryCompareHTML() {
            return [
                this.helper.getPartBeginTag('compare', 'div'),
                this.helper.getPartBeginTag('compare-title', 'div'),
                this.beforeText,
                this.helper.getPartEndTag('compare-title', 'div'),
                this.helper.getPartBeginTag('compare-color-old', 'div'),
                this.helper.getPartEndTag('compare-color-old', 'div'),
                this.helper.getPartBeginTag('compare-color-new', 'div'),
                this.helper.getPartEndTag('compare-color-new', 'div'),
                this.helper.getPartBeginTag('compare-title', 'div'),
                this.afterText,
                this.helper.getPartEndTag('compare-title', 'div'),
                this.helper.getPartEndTag('compare', 'div')
            ].join('');
        }

        function getColorInputHTML() {
            return [
                this.helper.getPartBeginTag('input', 'div'),
                getColorFieldHTML(this, 'hex', this.hexText),
                this.helper.getPartBeginTag('input-rgba', 'div'),
                getColorFieldHTML(this, 'red', 'R'),
                getColorFieldHTML(this, 'green', 'G'),
                getColorFieldHTML(this, 'blue', 'B'),
                getColorFieldHTML(this, 'alpha', this.alphaText),
                this.helper.getPartEndTag('input-rgba', 'div'),
                this.helper.getPartEndTag('input', 'div')
            ].join('');
        }

        /**
         * 颜色输入单元
         *
         * @param {AdvancedColorPicker} control 控件对象
         * @param {string} colorType 颜色类型 red | green | blue
         * @param {string} colorText 颜色文字
         * @return {string}
         */
        function getColorFieldHTML(control, colorType, colorText) {
            var id = control.helper.getId(colorType + '-input');
            var childName = colorType + 'Input';
            var classes = [
                control.helper.getPartClassName('color-field'),
                control.helper.getPartClassName('color-field-' + colorType)
            ];
            var html = ''
                + '<div class="' + classes.join(' ') + '">'
                +     '<div id="' + id + '" data-ui-type="TextBox" data-ui-variants="fluid" data-ui-width="auto"'
                +     'data-ui-child-name="' + childName + '" ></div>'
                +     '<label data-ui-type="Label" for="' + id + '">' + colorText + '</label>'
                + '</div>';
            return html;
        }

        /**
         * 更新色值
         *
         * @fires AdvancedColorPicker#change
         */
        function syncHBSToHex() {
            var hex = colorUtil.hsbToHex(
                this.hue,
                this.saturation,
                this.bright
            );
            if (hex !== this.displayHex) {
                this.displayHex = hex;
                this.fire('change');
            }
        }

        /**
         * RGB输入触发的操作
         * 1. 计算hex值
         * 2. 计算hbs
         * 3. 更新hue
         * 4. 更新canvas
         * 5. 更新历史对比区
         *
         * @fires AdvancedColorPicker#change
         */
        function syncValueByRGB() {
            var redColor = this.getChild('redInput').getValue();
            var greenColor = this.getChild('greenInput').getValue();
            var blueColor = this.getChild('blueInput').getValue();
            var hex = colorUtil.rgbToHex(redColor, greenColor, blueColor);
            var hsb = colorUtil.rgbToHSB(redColor, greenColor, blueColor);

            this.displayHex = hex;
            this.hue = hsb.h;
            this.saturation = hsb.s;
            this.bright = hsb.b;

            // 更新hex
            updateHexInput.call(this);
            // 更新历史
            updateColorHistory.call(this, 'new', this.displayHex);
            // 更新hue
            updateHueSliderPointerPosition.call(this);
            // 更新canvas
            updateCanvasColor.call(this);
            updateCanvasPointerPosition.call(this);

            this.fire('change');
        }

        /**
         * Hex输入触发的操作
         * 1. 计算hbs
         * 3. 更新rgb
         * 4. 更新canvas
         * 5. 更新历史对比区
         *
         * @fires AdvancedColorPicker#change
         */
        function syncValueByHex() {
            var hsb = colorUtil.hexToHSB(this.displayHex);

            this.hue = hsb.h;
            this.saturation = hsb.s;
            this.bright = hsb.b;

            // 更新rgb输入
            updateColorInput.call(this);
            // 更新历史
            updateColorHistory.call(this, 'new', this.displayHex);
            // 更新hue
            // updateHueSliderPointerPosition.call(this);
            // 更新canvas
            updateCanvasColor.call(this);
            updateCanvasPointerPosition.call(this);

            this.fire('change');
        }

        /**
         * 点击画布的操作
         * 1. 计算bright
         * 2. 计算saturation
         * 3. 计算并同步hex
         * 4. 更新颜色输入区
         * 5. 更新历史对比区
         *
         * @param {mini-event.Event} e 事件参数
         */
        function syncValueByCanvas(e) {
            // 如果点的是pointer，不做处理
            if (lib.hasClass(e.target, this.helper.getPartClassName('canvas-pointer'))) {
                return;
            }

            var mask = this.helper.getPart('canvas-mask');
            var $mask = $(mask);

            // 计算鼠标位移值，同时不能超出mask范围
            var canvasPos = $(mask).offset();
            var offsetY = e.pageY - canvasPos.top;
            offsetY = Math.min(offsetY, $mask.height());
            offsetY = Math.max(offsetY, 0);

            var offsetX = e.pageX - canvasPos.left;
            offsetX = Math.min(offsetX, $mask.width());
            offsetX = Math.max(offsetX, 0);

            // 画布（自上向下）为Bright值从1到0平均分布
            this.bright = Math.min(1 - offsetY / $mask.height(), 1);

            // 画布（自左向右）为Saturation值从0到1平均分布
            this.saturation = offsetX / $mask.width();

            // 更新hex
            syncHBSToHex.call(this);

            // 更新画布色点位置
            updateCanvasPointerPosition.call(this);
            // 更新rgb输入
            updateColorInput.call(this);
            // 更新hex输入
            updateHexInput.call(this);
            // 更新历史
            updateColorHistory.call(this, 'new', this.displayHex);
        }

        /**
         * 更新颜色输入区
         */
        function updateColorInput() {
            var color = this.displayHex;
            var control = this;
            // 更新rgb
            var rgb = colorUtil.hexToRGB(color);
            var colorTypes = ['red', 'green', 'blue'];
            u.each(
                colorTypes,
                function (colorType) {
                    var colorInput = control.getChild(colorType + 'Input');
                    colorInput.setValue(rgb[colorType]);
                }
            );
        }

        /**
         * 更新hex区
         */
        function updateHexInput() {
            var hex = this.displayHex;
            // 更新hex
            var hexInput = this.getChild('hexInput');
            hexInput.setValue(hex);
        }

        /**
         * 更新颜色历史
         *
         * @param {string} type 当前还是新增
         * @param {string} color 新颜色
         * @ignore
         */
        function updateColorHistory(type, color) {
            // 采用跟PS同样的算法，前方补零
            color = new Array(6 - color.length + 1).join('0') + color;
            var colorBlock = this.helper.getPart('compare-color-' + type);
            colorBlock.style.background = '#' + color;
        }

        /**
         * 更新透明度颜色值
         */
        function updateAlphaColor() {
            var slider = this.helper.getPart('alpha-slider');
            // 渐变处理，兼容IE9-
            var css3Tpl = 'linear-gradient(to top, rgba(${red}, ${green}, ${blue}, 0), rgb(${red}, ${green}, ${blue}))';
            var ieTpl = 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#FF${hex}, endColorstr=#00${hex})';
            if (lib.ie && lib.ie <= 9) {
                slider.style.filter = lib.format(ieTpl, {hex: this.displayHex});
            }
            else {
                var rgb = colorUtil.hexToRGB(this.displayHex);
                slider.style.backgroundImage = lib.format(css3Tpl, rgb);
            }
        }

        /**
         * 更新透明度输入框
         */
        function updateAlphaInput() {
            var alpha = this.displayAlpha;
            var alphaInput = this.getChild('alphaInput');
            alphaInput.setValue(alpha);
        }

        /**
         * 点击Alpha滑动器操作
         *
         * @param {mini-event.Event} e 事件参数
         */
        function syncValueByAlpha(e) {
            // 如果点的是pointer，不做处理
            if (lib.hasClass(e.target, this.helper.getPartClassName('alpha-pointer'))) {
                return;
            }

            var slider = this.helper.getPart('alpha-slider');
            var $slider = $(slider);

            // 计算鼠标位移值，同时不能超出slider范围
            var sliderPos = $slider.offset();
            var offsetY = e.pageY - sliderPos.top;
            offsetY = Math.min(offsetY, $slider.height());
            offsetY = Math.max(offsetY, 0);

            // 光柱纵向（自上向下）为Hue值从0到360平均分布
            this.displayAlpha = 100 - Math.round(offsetY / $slider.height() * 100);
            updateAlphaPointerPosition.call(this);
            updateAlphaInput.call(this);

            this.fire('change');
        }

        /**
         * 更新透明度Slider的光标位置
         */
        function updateAlphaPointerPosition() {
            var alphaSlider = this.helper.getPart('alpha');
            var alphaPointer = this.helper.getPart('alpha-pointer');

            if (!this.alphaSliderSize) {
                this.alphaSliderSize = {
                    sliderHeight: alphaSlider.offsetHeight,
                    pointerHeight: alphaPointer.offsetHeight
                };
            }

            var alphaY = this.alphaSliderSize.sliderHeight * (1 - this.displayAlpha / 100);
            alphaY -= this.alphaSliderSize.pointerHeight / 2;
            alphaPointer.style.top = Math.round(alphaY) + 'px';
        }

        /**
         * 点击Hue调节柱的操作
         * 1. 计算hue值
         * 2. 计算hex并同步
         * 3. 改变canvas底色
         * 4. 更新颜色输入区
         * 5. 更新历史对比区
         *
         * @param {mini-event.Event} e 事件参数
         */
        function syncValueByHue(e) {
            if ($(e.target).hasClass(this.helper.getPartClassName('hue-pointer'))) {
                return;
            }

            var slider = this.helper.getPart('hue-slider');
            var $slider = $(slider);

            // 计算鼠标位移值，同时不能超出slider范围
            var sliderPos = $slider.offset();
            var offsetY = e.pageY - sliderPos.top;
            offsetY = Math.min(offsetY, $slider.height());
            offsetY = Math.max(offsetY, 0);

            // 光柱纵向（自上向下）为Hue值从0到360平均分布
            this.hue = offsetY / e.target.offsetHeight * 360;

            // 更新Hue光标位置
            updateHueSliderPointerPosition.call(this);

            // 计算Hex
            syncHBSToHex.call(this);

            // 更新画布底色
            updateCanvasColor.call(this);
            // 更新rgb输入
            updateColorInput.call(this);
            // 更新hex输入
            updateHexInput.call(this);
            // 更新历史
            updateColorHistory.call(this, 'new', this.displayHex);
        }

        /**
         * 更新画布颜色
         */
        function updateCanvasColor() {
            // 改掉Canvas的底色
            var baseColor = colorUtil.hsbToHex(this.hue, 1, 1);
            var canvas = this.helper.getPart('canvas');
            canvas.style.backgroundColor = '#' + baseColor;
            // 更新透明度底色
            updateAlphaColor.call(this);
        }

        /**
         * 更新色相Slider的光标位置
         */
        function updateHueSliderPointerPosition() {
            var hueSlider = this.helper.getPart('hue');
            var huePointer = this.helper.getPart('hue-pointer');
            // 缓存一个，提高性能
            if (!this.hueSliderSize) {
                this.hueSliderSize = {
                    pointerHeight: huePointer.offsetHeight,
                    sliderHeight: hueSlider.offsetHeight
                };
            }
            var hueY = this.hue * this.hueSliderSize.sliderHeight / 360;
            hueY -= this.hueSliderSize.pointerHeight / 2;
            huePointer.style.top = Math.round(hueY) + 'px';
        }

        /**
         * 更新画布pointer位置
         */
        function updateCanvasPointerPosition() {
            var canvas = this.helper.getPart('canvas');
            var canvasPointer = lib.g(this.helper.getId('canvas-pointer'));

            if (!this.canvasSize) {
                this.canvasSize = {
                    canvasWidth: canvas.offsetWidth,
                    canvasHeight: canvas.offsetHeight,
                    pointerHeight: canvasPointer.offsetHeight,
                    pointerWidth: canvasPointer.offsetWidth
                };
            }

            // 画布上pointer的位置代表bright和saturation的交界值
            var canvasX = this.canvasSize.canvasWidth * this.saturation;
            canvasX -= this.canvasSize.pointerWidth / 2;
            var canvasY = (1 - this.bright) * this.canvasSize.canvasHeight;
            canvasY -= this.canvasSize.pointerHeight / 2;
            canvasPointer.style.left = Math.round(canvasX) + 'px';
            canvasPointer.style.top = Math.round(canvasY) + 'px';
        }

        esui.register(AdvancedColorPicker);
        return AdvancedColorPicker;
    }
);
