/**
 * @ignore
 * @file 滑动杆控件
 * @author maoquan(3610cn@gmail.com), liyuqiang(liyuqiang@baidu.com)
 */

define(
    function (require) {
        require('esui/Panel');
        require('esui/TextBox');
        require('esui/Select');

        var esui = require('esui');
        var u = require('underscore');
        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var eoo = require('eoo');
        var painters = require('esui/painters');

        require('esui/behavior/mouseproxy');
        var $ = require('jquery');

        var Slider = eoo.create(
            InputControl,
            {
                /**
                 * 控件的类型
                 * @override
                 * @type {String}
                 */
                type: 'Slider',

                /**
                 * 参数的初始化
                 * @protected
                 * @override
                 * @param  {Object} options [初始化的参数]
                 */
                initOptions: function (options) {
                    /**
                     * 默认的属性
                     * @type {Object}
                     * @type {string} defaults.orientation 滑块的形式 横着为'' 竖着为’vertical‘
                     * @type {number} defaults.start 起始值 默认是0
                     * @type {number} defaults.end 结束值 默认是10,
                     * @type {number} defaults.step 滑动杆值的步长默认是1
                     * @type {number | Arrary} defaults.value 滑动杆的值 默认为min或[min, max]
                     * @type {number} defaults.min 最小值 不能小于start, 无值时与start相同
                     * @type {number} defaults.max 最大值 不能大于end,无值时与end相同
                     * @type {boolean} defaults.isShowSelectedBG 滑杆已选择的部分是否加背景色显示 显示true 不显示false 默认true
                     * @type {boolean} defaults.range 滑动杆控件是否是选择区间 默认false 是true
                     */
                    var defaults = {
                        orientation: '',
                        start: 0,
                        end: 10,
                        step: 1,
                        min: null,
                        max: null,
                        isShowSelectedBG: true,
                        range: false
                    };

                    var properties = {};

                    u.extend(properties, defaults, options);

                    // 处理min和max
                    properties.min = properties.min || properties.start;
                    properties.max = properties.max || properties.end;

                    // min和max只能在start和end的中间
                    properties.min = Math.max(properties.min, properties.start);
                    properties.max = Math.min(properties.max, properties.end);

                    // 水平、竖直滑动杆时的设置
                    if (properties.orientation === 'vertical') {
                        // 竖直滑动杆时参数的设置
                        properties.leftTop = 'top';
                        properties.rightBottom = 'bottom';
                        properties.widthHeight = 'height';
                        properties.pageXY = 'pageY';
                    }
                    else {
                        // 水平时参数的设置
                        properties.leftTop = 'left';
                        properties.rightBottom = 'right';
                        properties.widthHeight = 'width';
                        properties.pageXY = 'pageX';
                    }

                    // 适配value的数据
                    properties = adaptValue.call(this, properties);

                    this.$super([properties]);
                },

                /**
                 * 将字符串类型的值转换成原始格式，复杂类型的输入控件需要重写此接口
                 *
                 * @param {string} value 要转换的string
                 * @param {Object} properties 参数对象
                 * @return {Mixed}
                 * @protected
                 */
                parseValue: function (value, properties) {
                    if ((properties && properties.range) || this.range) {
                        if (typeof value === 'string') {
                            var arr = value.split(',');
                            return [+arr[0], +arr[1]];
                        }
                    }

                    return value;
                },

                /**
                 * 批量设置控件的属性值
                 * @param {Object} properties 属性值集合
                 * @override
                 */
                setProperties: function (properties) {

                    // 给控件设值的时候适配数据用
                    if (properties.hasOwnProperty('rawValue')) {
                        properties = adaptValue.call(this, properties);

                    }

                    this.$super([properties]);
                },

                /**
                 * 创建滑动杆体
                 * 有滑块的范围和滑块，
                 * 滑块的范围分为显示的范围、已选的范围
                 * 滑动杆可能有一个滑块或两个滑块，类型是区间时可能有两个滑块，最大值和最小值
                 * 任意一个是显示的起始值时显示一个滑块
                 * 放在原型里是为了可重写
                 * @protected
                 */
                createBody: function () {
                    var bodyElement = this.bodyElement = this.helper.createPart('body');
                    var cursorElement = this.cursorElement = this.helper.createPart('body-cursor');

                    bodyElement.appendChild(cursorElement);

                    // 区间时需要两个滑块
                    if (this.range) {
                        var cursorElementTwo
                            = this.cursorElementTwo
                            = this.helper.createPart('body-cursortwo');

                        $(this.cursorElementTwo).addClass(this.helper.getPartClassName('body-cursor'));

                        bodyElement.appendChild(cursorElementTwo);
                    }

                    // 已选择的范围加个背景色
                    if (this.isShowSelectedBG) {
                        // 已选择的区间元素
                        var bodySelectedElement
                            = this.bodySelectedElement
                            = this.helper.createPart('body-selected');

                        bodyElement.appendChild(bodySelectedElement);
                    }

                    this.main.appendChild(bodyElement);

                    // 初始化body内元素的宽度和位置
                    initBodyElements(this);
                },

                /**
                 * 初始化dom结构，仅在第一次渲染的时候使用
                 * @protected
                 * @override
                 */
                initStructure: function () {
                    // 竖直滑动杆时增加样式
                    if (this.orientation === 'vertical') {
                        $(this.main).addClass(this.helper.getPartClassName('vertical'));
                    }

                    /\d+/.test(this.size) && (this.main.style[this.widthHeight] = this.size + 'px');
                    this.createBody();
                },

                /**
                 * 初始化事件的交互
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    // 绑定滑块的事件
                    bindCursorEvents.call(this);
                },

                /**
                 * 获取滑动杆的值
                 * @return {*} 滑动杆的值
                 */
                getValue: function () {
                    var value;

                    if (this.range) {
                        value = [this.minRangeValue, this.maxRangeValue];
                    }
                    else {
                        value = this.getRawValue();
                    }

                    return value;
                },

                /**
                 * 重新渲染
                 * @protected
                 * @override
                 * @type {Function} 重新渲染时要执行的函数
                 */
                repaint: painters.createRepaint(
                    InputControl.prototype.repaint,
                    {
                        name: 'rawValue',
                        paint: function (slider, value) {
                            setByValue(slider, value, true);
                        }
                    }
                ),

                /**
                 * 销毁控件
                 * @protected
                 * @override
                 */
                dispose: function () {
                    this.bodyElement = null;
                    this.cursorElement = null;
                    this.bodySelectedElement = null;
                    this.activeCursorElement = null;

                    if (this.range) {
                        this.cursorElementTwo = null;
                    }


                    this.$super(arguments);
                }
            }
        );

        /**
         * 适配控件的value
         * @param  {Object} properties 参数
         * @return {Object}            适配后的参数
         */
        function adaptValue(properties) {

            var value = properties.value;
            delete properties.value;

            if (value != null && properties.rawValue == null) {
                properties.rawValue = this.parseValue(value, properties);
            }

            properties.min = typeof properties.min !== 'undefined' ? properties.min : this.min;
            properties.max = typeof properties.max !== 'undefined' ? properties.max : this.max;

            if (properties.range || this.range) {
                // 值类型是区间时
                properties.rawValue = typeof properties.rawValue === 'undefined'
                    ? [properties.min, properties.max] : properties.rawValue;

                // 结果是区间时
                properties.minRangeValue = properties.rawValue[0];
                properties.maxRangeValue = properties.rawValue[1];

                properties.minRangeValue = Math.max(properties.minRangeValue, properties.min);
                properties.maxRangeValue = Math.min(properties.maxRangeValue, properties.max);

                // value只能在[min, max]之间
                properties.rawValue = [
                    properties.minRangeValue,
                    properties.maxRangeValue
                ];
            }
            else {
                // 值类型是单个值时
                properties.rawValue = typeof properties.rawValue === 'undefined'
                    ? properties.min : properties.rawValue;

                // value只能在min 和 max中间
                properties.rawValue = Math.max(properties.rawValue, properties.min);
                properties.rawValue = Math.min(properties.rawValue, properties.max);
            }

            return properties;
        }

        /**
         * 绑定滑块拖拽的事件
         * @private
         */
        function bindCursorEvents() {
            var body = this.helper.getPart('body');

            // 给滑块绑定事件
            if (body) {
                $(body).mouseproxy(
                    {
                        start: u.bind(mousedownHandler, this),
                        drag: u.bind(mousemoveHandler, this),
                        stop: u.bind(mouseupHandler, this)
                    }
                );

                // 点在其他空白处，滑块也要移动到这里
                this.helper.addDOMEvent(body, 'click', mousedownHandler);
            }
        }

        /**
         * 根据滑块left或top的值来计算value
         * @param  {number} cursorLeftTop 滑块位置left或top的值
         * @return {number}      滑块的值
         * @private
         */
        function getValueByLeftTop(cursorLeftTop) {
            var widthHeight = this.widthHeight;

            // 滑块容器的宽度
            var tmpWidthHeight = this[widthHeight];
            // 选择的宽度
            var selectedWidthHeight = cursorLeftTop;
            var similarValue = (selectedWidthHeight / tmpWidthHeight) * (this.end - this.start);

            // 根据步长算值
            similarValue = similarValue - similarValue % this.step;

            var value = this.start + Math.round(similarValue);

            return value;
        }

        /**
         * 根据值获取滑块的位置
         * @param  {number} value 滑块的值
         * @return {number}       滑块的左侧位置
         * @private
         */
        function getLeftTopByValue(value) {
            var widthHeight = this.widthHeight;

            var bodyElement = this.bodyElement;
            // 获取滑块容器的位置
            var bodyPos = lib.getOffset(bodyElement);
            var tmpwidthHeight = bodyPos[widthHeight];
            var start = this.start;
            var end = this.end;

            var cursorLeftTop = (value - start) / (end - start) * tmpwidthHeight;

            return cursorLeftTop;
        }

        /**
         * 根据值去做相应的调整，包括head里显示、赋值和微调滑块的位置
         * 为啥要微调位置，因为你不知道鼠标会停在哪，比如1，2之间跨度太大时 要落到值上
         * @param {Slider} slider 滑动杆控件
         * @param {number} value  滑动杆的值
         */
        function setByValue(slider, value) {
            var cursorElement = slider.cursorElement;
            var cursorLeftTop;

            var leftTop = slider.leftTop;
            var widthHeight = slider.widthHeight;

            if (slider.range) {
                var cursorElementTwo = slider.cursorElementTwo;
                var cursorLeftTopTwo = getLeftTopByValue.call(slider, value[1]);

                cursorElementTwo.style[leftTop] = cursorLeftTopTwo + 'px';
                cursorLeftTop = getLeftTopByValue.call(slider, value[0]);

                // hack: 默认第一个滑块的z-index是2 第二个滑块的z-index的是3
                // 因为区间的值可以是2,2这种，当两个滑块值是这种切最大值时，这时只能滑块1可拖动
                // 这时要把它放在第二个滑块上面
                if (value[0] === value[1] && value[0] === slider.max) {
                    cursorElement.style.zIndex = 3;
                    cursorElementTwo.style.zIndex = 2;
                }
                else {
                    cursorElement.style.zIndex = 2;
                    cursorElementTwo.style.zIndex = 3;
                }
            }
            else {
                cursorLeftTop = getLeftTopByValue.call(slider, value);
            }

            // 调整滑块的位置
            cursorElement.style[leftTop] = cursorLeftTop + 'px';

            // 已选择的部分加个背景色显示
            if (slider.isShowSelectedBG) {

                if (slider.range) {
                    slider.bodySelectedElement.style[leftTop] = cursorLeftTop + 'px';

                    slider.bodySelectedElement.style[widthHeight] = cursorLeftTopTwo - cursorLeftTop + 'px';
                }
                else {
                    slider.bodySelectedElement.style[widthHeight] = cursorLeftTop + 'px';
                }
            }
        }

        /**
         * 鼠标移动的事件
         * @param {Event} e 事件对象
         * @param {boolean=} isMouseUp 是否是鼠标松开的触发 是为true 不是为false
         * @param {Object} data 事件fire时的data
         * @return {number} 返回value 让mouseup用
         * @private
         */
        function mousemoveHandler(e, isMouseUp, data) {

            if (!u.isBoolean(isMouseUp)) {
                data = isMouseUp;
                isMouseUp = false;
            }

            var target = this.activeCursorElement;
            var cursorElement = this.cursorElement;

            var pageXY = this.pageXY;
            var leftTop = this.leftTop;
            var widthHeight = this.widthHeight;

            // 拖动的滑块距left的值
            var cursorLeftTop;

            // 滑块区间的时候
            if (this.range) {
                // 拖动的是否是第一个滑块
                var isFirst = false;
                // 另外一个滑块的left
                var otherLeftTop;
                // 另一个滑块的值
                var otherValue;

                // 滑块是第一个时
                if (target.id === cursorElement.id) {
                    otherLeftTop = getLeftTopByValue.call(this, this.maxRangeValue);
                    otherValue = this.maxRangeValue;
                    isFirst = true;

                    cursorLeftTop = Math.max(
                        this.minStartPos - this.startPos,
                        e[pageXY] - this.startPos
                    );

                    cursorLeftTop = Math.min(cursorLeftTop, otherLeftTop);
                }
                else {
                    // 滑块是第二个时
                    otherLeftTop = getLeftTopByValue.call(this, this.minRangeValue);
                    otherValue = this.minRangeValue;

                    cursorLeftTop = Math.max(otherLeftTop, e[pageXY] - this.startPos);

                    cursorLeftTop = Math.min(cursorLeftTop, this.maxEndPos - this.startPos);
                }
            }
            else {
                target = cursorElement;

                cursorLeftTop = Math.max(
                    this.minStartPos - this.startPos,
                    e[pageXY] - this.startPos
                );

                cursorLeftTop = Math.min(
                    cursorLeftTop,
                    this.maxEndPos - this.startPos
                );
            }

            // 根据left来计算值
            var value;
            var curValue = getValueByLeftTop.call(this, cursorLeftTop);

            if (this.range) {
                if (isFirst) {
                    value = [curValue, otherValue];
                }
                else {
                    value = [otherValue, curValue];
                }
            }
            else {
                value = curValue;
            }

            if (!isMouseUp) {
                // 避免抖动，这里根据value值重新计算出leftTop
                cursorLeftTop = getLeftTopByValue.call(this, curValue);
                target.style[this.leftTop] = cursorLeftTop + 'px';

                // 已选择的部分加个背景色显示
                if (this.isShowSelectedBG) {
                    if (this.range) {

                        var tmpWidthHeight;

                        if (isFirst) {
                            this.bodySelectedElement.style[leftTop] = cursorLeftTop + 'px';
                            tmpWidthHeight = otherLeftTop - cursorLeftTop;
                        }
                        else {
                            this.bodySelectedElement.style[leftTop] = otherLeftTop + 'px';
                            tmpWidthHeight = cursorLeftTop - otherLeftTop;
                        }

                        this.bodySelectedElement.style[widthHeight] = tmpWidthHeight + 'px';

                    }
                    else {
                        this.bodySelectedElement.style[widthHeight]
                            = cursorLeftTop + 'px';
                    }
                }

                // 滑动的时候触发move事件
                this.fire('move', value);
            }

            return value;
        }

        /**
         * 鼠标的松开事件
         * @param {Event} e 事件的对象
         * @private
         */
        function mouseupHandler(e) {
            // 去掉active的样式
            $(this.activeCursorElement).removeClass(
                this.helper.getPartClassName('body-cursor-active')
            );

            // 放开和mousemove时做得事是一样的，再做一遍
            var value = mousemoveHandler.call(this, e, true);

            // 设置控件的值，因为是内部设值不涉及重绘，所以不调set*方法了
            this.rawValue = value;
            this.minRangeValue = value[0];
            this.maxRangeValue = value[1];

            setByValue(this, value, true);

            // 放开鼠标的时候触发change事件
            this.fire('change', value);
        }

        /**
         * 初始化body内元素的坐标和宽度
         * @param  {Slider}  slider 滑动杆控件
         */
        function initBodyElements(slider) {
            var bodyElement = slider.bodyElement;
            // 获取滑块容器的位置
            var bodyPos = lib.getOffset(bodyElement);

            var leftTop = slider.leftTop;
            var rightBottom = slider.rightBottom;
            var widthHeight = slider.widthHeight;

            // 获取滑块容器的宽度，用来计算值用
            slider[widthHeight] = bodyPos[widthHeight];

            // 滑块能去的最左边
            if (typeof slider.min !== 'undefined') {
                var minLeftTop = getLeftTopByValue.call(slider, slider.min);
                // 滑块所能去的最左边
                slider.minStartPos = bodyPos[leftTop] + minLeftTop;
                // 滑竿范围的最左边
                slider.startPos = bodyPos[leftTop];
            }

            // 滑块能去的最右侧
            if (typeof slider.max !== 'undefined') {
                var maxLeftTop = getLeftTopByValue.call(slider, slider.max);

                slider.maxEndPos = bodyPos[leftTop] + maxLeftTop;
                slider.endPos = bodyPos[rightBottom];
            }
        }

        /**
         * 根据鼠标位置，寻找离鼠标位置最近的handle
         * @private
         * @param {Event} e 事件对象
         * @return {Element}
         */
        function findNearestCursorElement(e) {
            var pageXY = this.pageXY;
            var leftTop = this.leftTop;
            var bodyElement = this.helper.getPart('body');
            var bodyPos = lib.getOffset(bodyElement);

            var mouseLeftTop = e[pageXY] - bodyPos[leftTop];

            // 有两个滑块
            if (this.range) {
                var firstLeftTop = getLeftTopByValue.call(this, this.minRangeValue);
                var secondLeftTop = getLeftTopByValue.call(this, this.maxRangeValue);
                var middleLeftTop = firstLeftTop + (secondLeftTop - firstLeftTop) / 2;
                if (mouseLeftTop > middleLeftTop && this.cursorElementTwo) {
                    return this.cursorElementTwo;
                }
            }
            return this.cursorElement;
        }

        /**
         * 鼠标的按下事件
         * @private
         * @param {Event} e 事件对象
         * @return {boolean}
         */
        function mousedownHandler(e) {

            if (this.disabled === true) {
                return false;
            }

            var cursorElement = findNearestCursorElement.call(this, e);

            // 存住活动的对象
            this.activeCursorElement = cursorElement;

            // 增加active的样式
            $(cursorElement).addClass(this.helper.getPartClassName('body-cursor-active'));

            // 点击的时候再初始化各种坐标 为了一些初始化时不在屏幕内的控件
            initBodyElements(this);

            // 滑块首先移动到鼠标点击位置
            mousemoveHandler.call(this, e);

            return true;
        }

        esui.register(Slider);
        return Slider;
    }
);
