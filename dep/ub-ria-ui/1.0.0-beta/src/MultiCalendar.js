/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 双日历，通过两个月份相连的日历来选择单个日期
 * @author zengxiaohui(zengxiaohui@baidu.com)
 */

define(
    function(require) {
        require('esui/Button');
        require('esui/MonthView');

        var lib = require('esui/lib');
        var InputControl = require('esui/InputControl');
        var helper = require('esui/controlHelper');
        var Layer = require('esui/Layer');
        var ui = require('esui/main');
        var moment = require('moment');
        var u = require('underscore');

        /**
         * 双日历浮层
         *
         * @extends Layer
         * @ignore
         * @constructor
         */
        function MultiCalendarLayer() {
            Layer.apply(this, arguments);
        }

        lib.inherits(MultiCalendarLayer, Layer);

        /**
         * 渲染双日历浮层
         *
         * @param  {HTMLElement} element 浮层根元素
         * @inner
         */
        MultiCalendarLayer.prototype.render = function (element) {
            document.body.appendChild(element);

            var multiCalendar = this.control;
            lib.addClass(element, this.control.helper.getPrefixClass('multicalendar-layer'));
            var tpl = ''
                + '<div data-ui="type: MonthView; childName: prevMonthView" class="${prevClass}"></div>'
                + '<div data-ui="type: MonthView; childName: nextMonthView" class="${nextClass}"></div>';

            element.innerHTML = lib.format(tpl, {
                prevClass: multiCalendar.helper.getPartClassName('prev-month'),
                nextClass: multiCalendar.helper.getPartClassName('next-month')
            });

            multiCalendar.helper.initChildren(element);
            paintLayer(multiCalendar, multiCalendar.rawValue, 'render');
        };

        /**
         * 显示/隐藏双日历浮层
         *
         * @event
         * @ignore
         */
        MultiCalendarLayer.prototype.toggle = function () {
            var element = this.getElement();
            if (!element
                || this.control.helper.isPart(element, 'layer-hidden')
            ) {
                // 展示之前先跟main同步
                var multiCalendar = this.control;
                paintLayer(multiCalendar, multiCalendar.rawValue, 'repaint');
                this.show();
            }
            else {
                this.hide();
            }
        };

        /**
         * 重绘双日历浮层
         *
         * @param  {MultiCalendar} multiCalendar 控件实例
         * @param  {Date} rawValue 控件当前选取日期
         * @param  {string} state 渲染时控件状态，为`render`是首次渲染，为`repaint`则为重绘
         * @inner
         */
        function paintLayer(multiCalendar, rawValue, state) {

            var prevMonthView = multiCalendar.getChild('prevMonthView');
            var nextMonthView = multiCalendar.getChild('nextMonthView');
            var range = multiCalendar.range;
            var monthViewRanges = getMonthViewRange(range);

            var nextMonthRawValue = moment(multiCalendar.rawValue).add(1, 'month');
            var nextMonth = nextMonthRawValue.month() + 1;
            var nextYear = nextMonthRawValue.year();

            // 当前值是否在日历范围最后一个月
            var inLastMonth = moment(rawValue).format('YYYY-MM')
                              === moment(monthViewRanges.nextRange.end).format('YYYY-MM');

            if (!inLastMonth) {
                // 如果不在，那么左边日历赋当前值，右边日历需要加一个月
                
                nextMonthView && nextMonthView.setProperties({
                    range: monthViewRanges.nextRange,
                    month: nextMonth,
                    year: nextYear
                });

                prevMonthView && prevMonthView.setProperties({
                    rawValue: rawValue,
                    range: monthViewRanges.prevRange
                });
            }
            else {
                // 如果在，那么左边日历保持不变，右边日历赋当前值

                nextMonthView && nextMonthView.setProperties({
                    range: monthViewRanges.nextRange,
                    rawValue: rawValue
                });

                prevMonthView && prevMonthView.setProperties({
                    rawValue: rawValue,
                    year: moment(multiCalendar.rawValue).year(),
                    month: moment(multiCalendar.rawValue).month()
                });
            }

            if (state === 'render') {

                // 移除左侧日历的右向箭头和右侧日历的左向箭头
                var rightArrow = prevMonthView.getChild('monthForward').main;
                var leftArrow = nextMonthView.getChild('monthBack').main;
                rightArrow && lib.removeNode(rightArrow);
                leftArrow && lib.removeNode(leftArrow);

                prevMonthView.on('change', syncMonthView, multiCalendar);
                prevMonthView.on('changemonth', changePrevMonth, multiCalendar);

                nextMonthView.on('change', syncMonthView, multiCalendar);
                nextMonthView.on('changemonth', changeNextMonth, multiCalendar);

                if (multiCalendar.autoHideLayer) {
                    prevMonthView.on(
                        'itemclick',
                        u.bind(multiCalendar.layer.toggle, multiCalendar.layer)
                    );

                    nextMonthView.on(
                        'itemclick',
                        u.bind(multiCalendar.layer.toggle, multiCalendar.layer)
                    );
                }
            }
        }

        /**
         * 获取双日历两个日历的日历范围
         *
         * @param  {{begin:Date,end:Date}} range 初始日历范围
         * @return {{prevRange:Object,nextRange:Object}} 包含两个日历范围的对象
         * @inner
         */
        function getMonthViewRange(range) {
            var ranges = {};
            var startDate = moment(range.begin).endOf('month').toDate();
            startDate.setDate(startDate.getDate() + 1);

            var endDate = moment(range.end).startOf('month').toDate();
            endDate.setDate(endDate.getDate() - 1);

            var prevRange = {
                begin: range.begin,
                end: endDate
            };

            var nextRange = {
                begin: startDate,
                end: range.end
            };

            ranges.prevRange = prevRange;
            ranges.nextRange = nextRange;
            return ranges;
        }

        /**
         * 改变左侧日历的月份
         *
         * @event
         * @param {Object} e 事件对象
         * @param {MonthView} e.target 当前改变月份MonthView对象
         * @ignore
         */
        function changePrevMonth(e) {

            var multiCalendar = this;
            var prevMonthView = e.target;
            var nextMonthView = multiCalendar.getChild('nextMonthView');

            var year = prevMonthView.year;
            var month = prevMonthView.month + 1;
            var m = moment(year + '-' + month, 'YYYY-MM').add(1, 'month');

            nextMonthView.setProperties({
                year: m.year(),
                month: m.month() + 1
            });
        }

        /**
         * 改变右侧日历的月份
         *
         * @event
         * @param {Object} e 事件对象
         * @param {MonthView} e.target 当前改变月份MonthView对象
         * @ignore
         */
        function changeNextMonth(e) {

            var multiCalendar = this;
            var nextMonthView = e.target;
            var prevMonthView = multiCalendar.getChild('prevMonthView');
            var m = moment(nextMonthView.year + '-' + nextMonthView.month, 'YYYY-MM');

            prevMonthView.setProperties({
                year: m.year(),
                month: m.month() + 1
            });
        }

        /**
         * 更新显示
         *
         * @event
         * @fires MultiCalendar#change
         * @param {Object} e 事件对象
         * @param {MonthView} e.target 当前改变值的MonthView控件
         * @ignore
         */
        function syncMonthView(e) {
            var currMonthView = e.target;
            var date = currMonthView.getRawValue();

            if (!date) {
                return;
            }

            this.rawValue = date;
            updateDisplayText(this);

            /**
             * @event change
             *
             * 值发生变化时触发
             *
             * @member MultiCalendar
             */
            this.fire('change');
        }

        /**
         * 更新显示的文字
         *
         * @param {MultiCalendar} multiCalendar 控件实例
         * @inner
         * @ignore
         */
        function updateDisplayText(multiCalendar) {
            var textHolder = multiCalendar.helper.getPart('text');
            textHolder.innerHTML = u.escape(multiCalendar.getValue());
        }

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function MultiCalendar(options) {
            this.now = new Date();
            InputControl.apply(this, arguments);
            this.layer = new MultiCalendarLayer(this);
        }

        MultiCalendar.prototype = {
            /**
             * 控件类型，始终为`"MultiCalendar"`
             *
             * @type {string}
             * @readonly
             * @override
             */
            type: 'MultiCalendar',

            /**
             * @override
             */
            styleType: 'Calendar',

            /**
             * 初始化参数
             *
             * @param {Object=} options 构造函数传入的参数
             * @override
             * @protected
             */
            initOptions: function (options) {
                var now = new Date();
                var properties = {
                    /**
                     * @property {Object}
                     *
                     * 双日历的日历可选范围
                     */
                    range: {
                        begin: new Date(1983, 8, 3),
                        end: new Date(2046, 10, 4)
                    },

                    /**
                     * @property {string} [dateFormat="YYYY-MM-DD"]
                     *
                     * 输出的日期格式，用于{@link MultiCalendar#getValue}返回时格式化
                     *
                     * 具体的日期格式参考
                     * [moment文档](http://momentjs.com/docs/#/displaying/format/)
                     */
                    dateFormat: 'YYYY-MM-DD',

                    /**
                     * @property {string} [paramFormat="YYYY-MM-DD"]
                     *
                     * 输入的日期格式，用于{@link MultiCalendar#setValue}时格式化
                     *
                     * 具体的日期格式参考
                     * [moment文档](http://momentjs.com/docs/#/displaying/format/)
                     */
                    paramFormat: 'YYYY-MM-DD',

                    /**
                     * @property {Date} [rawValue]
                     *
                     * 控件的原始值，为`Date`类型，默认为当天
                     *
                     * @override
                     */
                    rawValue: now,

                    /**
                     * @property {boolean} [autoHideLayer]
                     *
                     * 是否点击自动关闭弹层
                     */
                    autoHideLayer: false
                };

                if (options.autoHideLayer === 'false') {
                    options.autoHideLayer = false;
                }

                u.extend(properties, options);

                if (lib.isInput(this.main)) {
                    this.helper.extractOptionsFromInput(this.main, properties);
                }

                // parseValue 需要用到 paramFormat
                this.paramFormat = properties.paramFormat;

                if (properties.value) {
                    properties.rawValue = this.parseValue(properties.value);
                }

                // 类型如果是string
                var range = properties.range;
                if (typeof range === 'string') {
                    properties.range = this.convertToRaw(range);
                }
                this.setProperties(properties);
            },

            /**
             * 初始化DOM结构
             *
             * @protected
             * @override
             */
            initStructure: function () {
                // 如果主元素是输入元素，替换成`<div>`
                // 如果输入了非块级元素，则不负责
                var controlHelper = this.helper;
                var mainElement = this.main;
                var calendar = 'calendar';
                if (lib.isInput(mainElement)) {
                    controlHelper.replaceMain();
                    mainElement = this.main;
                }

                var template = ''
                    + '<div class="${classes}" id="${id}">${value}</div>'
                    + '<div class="${arrow}"><span class="${icon}"></span></div>';

                lib.addClass(mainElement, controlHelper.getPrefixClass(calendar));
                mainElement.innerHTML = lib.format(
                    template,
                    {
                        classes: controlHelper.getPartClassName('text'),
                        id: controlHelper.getId('text'),
                        arrow: controlHelper.getPartClassName('arrow'),
                        icon: controlHelper.getIconClass(calendar)
                    }
                );
            },

            /**
             * 初始化事件交互
             *
             * @protected
             * @override
             */
            initEvents: function () {
                this.helper.addDOMEvent(this.main, 'click', u.bind(this.layer.toggle, this.layer));
            },

            /**
             * 重新渲染视图
             * 仅当生命周期处于RENDER时，该方法才重新渲染
             *
             * @param {Array=} 变更过的属性的集合
             * @override
             */
            repaint: helper.createRepaint(
                InputControl.prototype.repaint,
                {
                    /**
                     * @property {meta.DateRange} range
                     *
                     * 指定控件可选的时间段
                     */
                    name: ['rawValue', 'range'],
                    paint: function (multiCalendar, rawValue, range) {

                        if (range) {
                            if (typeof range === 'string') {
                                range = multiCalendar.convertToRaw(range);
                            }

                            // 还要支持只设置begin或只设置end的情况
                            if (!range.begin) {
                                // 设置一个特别远古的年
                                range.begin = new Date(1983, 8, 3);
                            }
                            else if (!range.end) {
                                // 设置一个特别未来的年
                                range.end = new Date(2046, 10, 4);
                            }

                            multiCalendar.range = range;
                        }
                        
                        if (rawValue) {
                            if (rawValue < range.begin) {
                                rawValue = range.begin;
                            }

                            if (rawValue > range.end) {
                                rawValue = range.end;
                            }

                            multiCalendar.rawValue = rawValue;
                            updateDisplayText(multiCalendar);
                        }

                        if (multiCalendar.layer) {
                            paintLayer(multiCalendar, multiCalendar.rawValue, 'repaint');
                        }
                    }
                },
                {
                    name: ['disabled', 'hidden', 'readOnly'],
                    paint: function (multiCalendar, disabled, hidden, readOnly) {
                        if (disabled || hidden || readOnly) {
                            multiCalendar.layer.hide();
                        }
                    }
                }
            ),

            /**
             * 将字符串类型的值转换成原始格式，复杂类型的输入控件需要重写此接口
             *
             * @param {string} value 字符串值
             * @return {Date} 日期原始格式
             * @protected
             * @override
             */
            parseValue: function (value) {
                var date = moment(value, this.paramFormat).toDate();
                return date;
            },

            /**
             * 将值从原始格式转换成字符串，复杂类型的输入控件需要重写此接口
             *
             * @param {Date} rawValue 原始值
             * @return {string} 日期字符串
             * @protected
             * @override
             */
            stringifyValue: function (rawValue) {
                return moment(rawValue).format(this.dateFormat) || '';
            },

            /**
             * 将字符串转换成对象型rawValue
             * 可重写
             *
             * @inner
             * @param {string} value 目标日期字符串 ‘YYYY-MM-DD,YYYY-MM-DD’
             * @return {{begin:Date,end:Date}=}
             */
            convertToRaw: function (value) {
                var strDates = value.split(',');
                // 可能会只输入一个，默认当做begin，再塞一个默认的end
                if (strDates.length === 1) {
                    strDates.push('2046-11-04');
                }
                // 第一个是空的
                else if (strDates[0] === ''){
                    strDates[0] = '1983-09-03';
                }
                // 第二个是空的
                else if (strDates[1] === ''){
                    strDates[1] = '2046-11-04';
                }
                return {
                    begin: moment(strDates[0], 'YYYY-MM-DD').toDate(),
                    end: moment(strDates[1], 'YYYY-MM-DD').toDate()
                };
            },

            /**
             * 卸载控件
             *
             * @protected
             * @override
             */
            dispose: function () {
                if (helper.isInStage(this, 'DISPOSED')) {
                    return;
                }

                if (this.layer) {
                    this.layer.dispose();
                    this.layer = null;
                }

                InputControl.prototype.dispose.apply(this, arguments);
            }
        };

        lib.inherits(MultiCalendar, InputControl);
        ui.register(MultiCalendar);

        return MultiCalendar;
    }
);
