/**
 * UB-RIA-UI
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 带概要展示的拾色器
 * 由一个色彩信息描述区和一个完整版拾色器浮层组成
 *
 * 控件是由一个缩略信息展示区和一个拾色器浮层组成的
 * 如果你只需要一个拾色器效果，
 * 请使用{@link FullColorPicker}控件
 *
 * @exports FullColorPicker
 * @author dbear
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var ui = require('esui/main');
        var InputControl = require('esui/InputControl');

        require('./FullColorPicker');
        require('esui/Overlay');
        require('esui/TextBox');
        require('esui/Button');

        var exports = {};
        /**
         * 控件类型
         *
         * @override
         */
        exports.type = 'ColorPicker';

        /**
         * 初始化参数
         *
         * @override
         * @protected
         */
        exports.initOptions = function (options) {
            var properties = {
                // 展示模式 'attached' | 'dialog'
                displayMode: 'attached',
                // 默认拾色器模式，支持 'simple' | 'advanced' | 'full'
                featureMode: 'simple',
                switchable: false,
                hex: '000000',
                alpha: 100,
                hasAlpha: true
            };
            lib.extend(properties, options);
            if (properties.hasAlpha === 'false') {
                properties.hasAlpha = false;
            }
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        exports.initStructure = function () {
            var mainTpl = ''
                + '<div class="${colorBlockFrameClass}" id="${colorBlockFrameId}">'
                +     '<div class="${colorBlockClass}" id="${colorBlockId}"></div>'
                + '</div>'
                + '<div class="${colorInputClass}" id="${colorInputId}" data-ui-type="TextBox"'
                +     'data-ui-child-name="colorInput" data-ui-hint="#" data-ui-hint-type="prefix"'
                +     'data-ui-width="auto"></div>';
            if (this.hasAlpha) {
                mainTpl += ''
                    + '<div class="${alphaInputClass}" id="${alphaInputId}" data-ui-type="TextBox"'
                    +     'data-ui-child-name="alphaInput" data-ui-hint="%" data-ui-hint-type="suffix"'
                    +     'data-ui-width="auto"></div>';
            }
            this.main.innerHTML = lib.format(
                mainTpl,
                {
                    colorBlockFrameClass: this.helper.getPartClassName('color-block-frame'),
                    colorBlockFrameId: this.helper.getId('color-block-frame'),
                    colorBlockClass: this.helper.getPartClassName('color-block'),
                    colorBlockId: this.helper.getId('color-block'),
                    colorInputClass: this.helper.getPartClassName('color-input'),
                    colorInputId: this.helper.getId('color-input'),
                    alphaInputClass: this.helper.getPartClassName('alpha-input'),
                    alphaInputId: this.helper.getId('alpha-input')
                }
            );

            this.initChildren();
        };

        /**
         * @override
         */
        exports.initEvents = function () {
            this.$super(arguments);

            var colorBlock = this.helper.getPart('color-block');
            // 点色块走的是toggle，所以阻止冒泡到`document`
            this.helper.addDOMEvent(
                colorBlock,
                'mousedown',
                function (e) {
                    e.stopPropagation();
                }
            );
            this.helper.addDOMEvent(colorBlock, 'mousedown', toggleLayer);

            var colorInput = this.getChild('colorInput');
            colorInput.on('input', onColorInput, this);

            var alphaInput = this.getChild('alphaInput');
            if (alphaInput) {
                alphaInput.on('input', onAlphaInput, this);
            }
        };

        /**
         * 颜色输入框输入事件处理
         *
         * @param {mini-event.Event} e 事件参数
         */
        function onColorInput(e) {
            var colorInput = e.target;
            var hex = colorInput.getValue();
            // 只取输入的前6位
            if (hex.length > 6) {
                hex = hex.slice(0, 6);
            }
            hex = new Array(6 - hex.length + 1).join('0') + hex;
            // 更新主元素显示
            var colorBlock = this.helper.getPart('color-block');
            colorBlock.style.background = '#' + hex;

            this.hex = hex;

            // 修改后需要fire一个事件出去
            this.fire('change');
        }

        /**
         * 透明度输入框输入事件处理
         *
         * @param {mini-event.Event} e 事件参数
         */
        function onAlphaInput(e) {
            var alpha = e.target.getValue();
            this.alpha = alpha;
            // 修改后需要fire一个事件出去
            this.fire('change');
        }

        function updateColorDisplay() {
            var colorBlock = this.helper.getPart('color-block');
            colorBlock.style.backgroundColor = '#' + this.hex;

            var colorInput = this.getChild('colorInput');
            colorInput.setValue(this.hex);

            if (this.hasAlpha) {
                var alphaInput = this.getChild('alphaInput');
                alphaInput.setValue(this.alpha);
            }
        }

        function syncValue() {
            var overlay = this.getChild('layer');
            if (overlay) {
                var properties = {};
                properties.hex = this.getChild('colorInput').getValue();

                if (this.hasAlpha) {
                    properties.alpha = this.getChild('alphaInput').getValue();
                }
                var colorPicker = overlay.getChild('colorPicker');
                if (colorPicker) {
                    colorPicker.setProperties(properties);
                }
            }
        }

        function createLayer() {
            var overlayMain = this.helper.createPart('layer', 'div');
            lib.addClass(overlayMain, this.helper.getPartClassName('layer'));

            var pickerContent = ''
                + this.helper.getPartBeginTag('head', 'div')
                +     this.helper.getPartBeginTag('title', 'div') + '颜色选择' + this.helper.getPartEndTag('title', 'div')
                +     this.helper.getPartBeginTag('close-btn', 'div') + '关闭'
                +     this.helper.getPartEndTag('close-btn', 'div')
                + this.helper.getPartEndTag('head', 'div')
                + '<div data-ui-type="FullColorPicker" data-ui-child-name="colorPicker"'
                +     'data-ui-default-mode="' + this.featureMode + '"'
                +     'data-ui-switchable="' + this.switchable + '"'
                +     'data-ui-has-alpha="' + this.hasAlpha + '">'
                + '</div>'
                + this.helper.getPartBeginTag('foot-frame', 'div')
                +     this.helper.getPartBeginTag('foot', 'div')
                +         '<div class="' + this.helper.getPartClassName('ok-btn') + '"'
                +             'data-ui="type:Button;childName:btnOk;variants:primary">确定</div>'
                +         '<div class="' + this.helper.getPartClassName('cancel-btn') + '"'
                +             'data-ui="type:Button;childName:btnCancel;variants:link">取消</div>'
                +     this.helper.getPartEndTag('foot', 'div')
                + this.helper.getPartEndTag('foot-frame', 'div');

            var colorPickerOverLay = ui.create(
                'Overlay',
                {
                    main: overlayMain,
                    childName: 'layer',
                    content: pickerContent
                }
            );

            this.addChild(colorPickerOverLay);
            colorPickerOverLay.appendTo(this.main);
            colorPickerOverLay.addState(this.displayMode);

            var colorPicker = colorPickerOverLay.getChild('colorPicker');

            // displayMode决定弹层展示模式
            if (this.displayMode === 'attached') {
                // 变了即时更新
                var control = this;
                colorPicker.on(
                    'change',
                    function (e) {
                        var hex = this.getDisplayHex();
                        var alpha = this.getDisplayAlpha();
                        if (hex !== control.hex || alpha !== control.alpha) {
                            control.setProperties({hex: hex, alpha: alpha});
                        }
                    }
                );
            }
            else {
                // 初始化关闭按钮
                var closeBtn = this.helper.getPart('close-btn');
                if (closeBtn) {
                    this.helper.addDOMEvent(closeBtn, 'mousedown', hideOverlay);
                }

                // 初始化提交和取消按钮
                var btnOk = colorPickerOverLay.getChild('btnOk');
                var btnCancel = colorPickerOverLay.getChild('btnCancel');

                btnOk.on('click', submit, this);
                btnCancel.on('click', hideOverlay, this);
            }

            return this.getChild('layer');
        }

        /**
         * 确认颜色选择
         *
         * @fires ColorPicker#submit
         */
        function submit() {
            var pickerOverlay = this.getChild('layer');
            var fullColorPicker = pickerOverlay.getChild('colorPicker');
            this.setProperties({hex: fullColorPicker.getDisplayHex(), alpha: fullColorPicker.getDisplayAlpha()});
            pickerOverlay.hide();
            this.fire('submit');
        }

        function hideOverlay() {
            var pickerOverlay = this.getChild('layer');
            pickerOverlay.hide();
        }

        /**
         * 显示下拉弹层
         */
        function showLayer() {
            var colorPickerOverLay = this.getChild('layer');
            // displayMode决定弹层展示模式
            var properties = {
                hasMask: true,
                fixed: false,
                autoClose: false
            };
            if (this.displayMode === 'attached') {
                properties = {
                    attachedDOM: this.helper.getId('color-block-frame'),
                    attachedLayout: 'bottom,left'
                };
            }
            colorPickerOverLay.setProperties(properties);
            colorPickerOverLay.show();
            colorPickerOverLay.resize();
        }

        /**
         * 根据当前状态显示或隐藏浮层
         */
        function toggleLayer() {
            var layer = this.getChild('layer');
            if (!layer) {
                layer = createLayer.call(this);
            }

            if (layer.isHidden()) {
                syncValue.call(this);
                showLayer.call(this);
            }
            else {
                layer.hide();
            }
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         * @fires ColorPicker#change
         */
        exports.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['hex', 'alpha'],
                paint: function (colorPicker, hex, alpha) {
                    updateColorDisplay.call(colorPicker);
                    syncValue.call(colorPicker);
                    colorPicker.fire('change');
                }
            }
        );

        /**
         * 批量更新属性并重绘
         *
         * @override
         * @fires ColorPicker#change
         */
        exports.setProperties = function (properties) {
            var changes = this.$super(arguments);

            if (changes.hasOwnProperty('rawValue')) {
                this.fire('change');
            }

            return changes;
        };

        /**
         * @override
         * @return {Object}
         */
        exports.getRawValue = function () {
            var result = {};
            result.hex = this.hex;
            if (this.hasAlpha) {
                result.alpha = this.alpha;
            }
            return result;
        };

        var ColorPicker = require('eoo').create(InputControl, exports);

        require('esui').register(ColorPicker);
        return ColorPicker;
    }
);
