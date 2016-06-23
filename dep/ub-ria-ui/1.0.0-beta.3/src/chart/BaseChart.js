/**
 * BaseChart
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 图表基类控件
 * @exports ui.BaseChart
 * @author lixiang
 */
define(
    function (require) {
        var eoo = require('eoo');
        var echarts = require('echarts');
        var painters = require('esui/painters');
        var util = require('../helper/util');
        var Control = require('esui/Control');
        var $ = require('jquery');
        var esui = require('esui');
        var u = require('underscore');

        /**
         * 图表基类控件
         *
         * @class ui.BaseChart
         * @extends esui.Control
         */
        var BaseChart = eoo.create(Control, {
            /**
             * @override
             */
            type: 'Chart',

            /**
             * @override
             */
            initOptions: function (options) {
                var properties = {
                    width: 'auto',
                    height: 300
                };
                u.extend(properties, BaseChart.defaultProperties, options);

                this.setProperties(properties);
            },

            /**
             * 初始化图表数据
             *
             * @protected
             * @method ui.BaseChart#initChartOptions
             * @return {Object}
             */
            initChartOptions: function () {
                return {};
            },

            /**
             * 获得提示层的title
             *
             * @protected
             * @method BaseChart#getTipTitleHtml
             * @param {Object} params 相关参数
             * @param {boolean} params.isContrast 是否是对比数据
             * @param {number} params.pointIndex 坐标点的横坐标索引
             * @param {Array} params.pointInfo 坐标点相关信息
             * @return {string} 构建完成的title
             */
            getTipTitleHtml: function (params) {
                return '';
            },

            /**
             * 提示层格式器
             *
             * @protected
             * @method ui.BaseChart#tipFormatter
             * @param {Array.<Object>} params 坐标点中的信息，具体数据参见ECHARTS文档
             * @param {string} axisIndex 坐标点在x轴上的索引位置信息
             * @return {string} 格式化后的弹出层html
             * =========================
             * 2013-12-04 星期三
             * <图例色块> 展现量：42,000
             * <图例色块> 点击量：12,000
             * 2012-12-04 星期二
             * <图例色块> 展现量：42,000
             * <图例色块> 点击量：12,000
             * =========================
             */
            tipFormatter: function (params, axisIndex) {
                // 要截取一下才是真实的index
                axisIndex = +axisIndex.slice(5);

                params = u.map(
                    params,
                    function (param, index) {
                        param.index = index;
                        return param;
                    }
                );

                // 如果是对比图表，那么一个节点中的几个指标值，隔位分成两组
                // 按照规定，对比数据，基线数据在前，对比数据在后
                // 对应的groups也一样
                var paramsGroup;
                if (this.isContrast) {
                    paramsGroup = [[], []];
                    u.each(
                        params,
                        function (param, index) {
                            paramsGroup[index % 2].push(param);
                        }
                    );
                }
                else {
                    paramsGroup = [params];
                }

                var html = [];
                u.each(
                    paramsGroup,
                    function (params, index) {
                        var title = this.getTipTitleHtml({
                            pointInfo: params,
                            pointIndex: axisIndex,
                            isContrast: index % 2 !== 0
                        });
                        html.push(title);
                        u.each(
                            params,
                            function (param, paramIndex) {
                                var itemHTML = buildTipItem.call(this, param);
                                html.push(itemHTML);
                            },
                            this
                        );
                    },
                    this
                );

                return html.join('<br>');
            },

            /**
             * 格式化y轴刻度数据
             *
             * @protected
             * @method ui.BaseChart#formatYAxisData
             * @param {Object} serie y轴数据
             * @param {Object} index 坐标索引
             * @return {Object} 返回格式化后的y轴构建所需数据对象
             */
            formatYAxisData: function (serie, index) {
                var data = serie.data;
                // 如果包含对比数据，要把对比数据也加进来
                if (this.isContrast) {
                    data = data.concat(this.ySeries[index + 1].data);
                }
                var splitNumber = this.splitNumber;
                // index 只可能为0, 1   0为左边坐标  1为右边坐标
                var labelAlign = index === 0 ? 'left' : 'right';

                // 自动计算比例尺的逻辑先删掉，PM有反应再加上。。。
                // 按从小到大排下序
                var sortedData = u.sortBy(
                    [].slice.call(data),
                    function (item) {
                        return +item;
                    }
                );

                // 把最大刻度转换成符合比例尺规范的值
                var maxData = sortedData[data.length - 1];
                var average = Math.ceil(maxData / splitNumber);
                // 取最接近average的刻度
                var scale = getNearestScale(this, average);
                var max = scale * splitNumber;

                var formatter = function (serie) {
                    return function (value) {
                        if (serie.format === 'percent') {
                            value = value + '%';
                        }
                        else if (serie.format === 'money') {
                            value = util.formatNumber(value, 2);
                        }
                        else if (serie.format === 'int') {
                            value = util.formatNumber(value);
                        }
                        return value;
                    };
                };

                return {
                    type: 'value',
                    name: '',
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        // margin和align默认处理的挺好的，如果需要的话，再加上，不需要后续删掉这两个
                        // margin: this.get('yAxisTextMargin') || 8, // 默认值是8
                        formatter: formatter(serie)
                    },
                    min: 0,
                    max: max,
                    splitNumber: splitNumber,
                    scale: true
                };
            },

            /**
             * 绘制图表
             *
             * @public
             * @method ui.BaseChart#draw
             */
            draw: function () {
                if (!this.chartOptions.series) {
                    return;
                }

                // 画图表
                var chart = this.chart;

                chart.showLoading(
                    {
                        text: this.loadingText
                    }
                );
                chart.setOption(this.chartOptions);

                chart.hideLoading();
            },

            /**
             * 格式化x轴数据
             *
             * @protected
             * @method ui.BaseChart#formatXSeries
             * @param {Array.<Object>} xSeries x轴数据系列
             * @return {Array.<Object>}
             */
            formatXSeries: function (xSeries) {
                return xSeries;
            },

            /**
             * 创建Y轴数据
             *
             * @protected
             * @method ui.BaseChart#buildYAxis
             * @param {Array} ySeries Y轴数据集合
             * @return {Array}
             */
            buildYAxis: function (ySeries) {
                var yAxis = [];
                var gap = 1;
                if (this.isContrast) {
                    gap = 2;
                }
                for (var i = 0; i < ySeries.length; i += gap) {
                    var serie = ySeries[i];
                    // 格式化y轴刻度数据
                    var formattedYAxisData = this.formatYAxisData(serie, i);
                    yAxis.push(formattedYAxisData);
                }

                return yAxis;
            },

            /**
             * 格式化y轴某条连续数据
             *
             * @protected
             * @method BaseChart#formatYSeriesData
             * @param {Object} serie y轴数据
             * @param {number} index y轴数据索引
             * @return {Object} 返回格式化后的y轴显示所需数据对象
             */
            formatYSeriesData: function (serie, index) {
                return {};
            },

            /**
             * @override
             */
            initStructure: function () {
                /**
                 * 这里将chart单独封装在一个层里是考虑，
                 * 未来可能会在控件中封装其它图表外的操作按钮。
                 */
                var $main = $(this.main);
                this.main.innerHTML = ''
                    + this.helper.getPartBeginTag('frame', 'div')
                    +     this.helper.getPartBeginTag('main', 'div')
                    +     this.helper.getPartEndTag('main', 'div')
                    + this.helper.getPartEndTag('frame', 'div');

                $main.find('.' + this.helper.getPartClassName('main')).css({
                    width: this.width,
                    height: this.height
                });

                var chart = echarts.init(this.helper.getPart('main'), this.theme);
                this.chart = chart;

                // 绑定resize事件
                this.helper.addDOMEvent(
                    window,
                    'resize',
                    function () {
                        chart.resize();
                    }
                );
            },

            /**
             * @override
             */
            repaint: painters.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['xSeries', 'ySeries'],
                    paint: function (chart, xSeries, ySeries) {
                        if (!ySeries) {
                            return;
                        }
                        // 如果chart的option还没初始化，先初始化
                        if (!chart.chartOptions) {
                            chart.chartOptions = chart.initChartOptions();
                        }

                        // 更新X轴数据
                        chart.chartOptions.xAxis[0].data = chart.formatXSeries(xSeries);
                        // 为了美观，当x轴数据只有1条时，数据不顶格，当X轴数据大于1条时，顶格
                        chart.chartOptions.xAxis[0].boundaryGap = (xSeries.length === 1);

                        // 跟新Y轴数据
                        // 1. 构建数据
                        var formattedYSeries = [];
                        chart.legend = [];
                        u.each(
                            ySeries,
                            function (serie, index) {
                                // 格式化y轴坐标数据
                                var formattedYSeriesData = chart.formatYSeriesData(serie, index);
                                formattedYSeries.push(formattedYSeriesData);

                                // 更新图例数据
                                chart.legend[index] = {
                                    color: serie.color || this.chart._themeConfig.color[index],
                                    format: serie.format
                                };
                            },
                            chart
                        );

                        // 2. 构建坐标
                        var yAxis = chart.buildYAxis(ySeries);

                        // 开画
                        chart.chartOptions.yAxis = yAxis;
                        chart.chartOptions.series = formattedYSeries;

                        chart.draw();
                    }
                }
            ),

            /**
             * @override
             */
            dispose: function () {
                if (this.helper.isInStage('DISPOSED')) {
                    return;
                }
                if (this.chart) {
                    this.chart.dispose();
                    this.chart = null;
                }
                this.$super(arguments);
            }
        });

        BaseChart.defaultProperties = {
            scale: '1, 1.5, 2, 5, 10',
            splitNumber: 4,
            loadingText: '正在努力渲染...',
            // 是否是对比图表
            isContrast: false,
            /**
             * @property {string|Object} [theme]
             *
             * 设置Chart的Theme，可以自行定制。
             * http://echarts.baidu.com/doc/example/themeDesigner.html
             *
             */
            theme: 'macarons'
        };

        /**
         * 创建单行提示信息
         *
         * @param {Object} param 坐标点中的信息
         * @return {string}
         */
        function buildTipItem(param) {
            var legend = this.legend;
            if (legend.length === 0) {
                return '';
            }
            // 图例和节点的对应，通过param的第四个参数
            var format = legend[param.index].format;
            var legendColor = legend[param.index].color;
            var value = param.data;
            if (format === 'money') {
                value = (value === '-') ? '- -' : util.formatNumber(value, 2, '', '&yen;');
            }
            else if (format === 'int') {
                value = util.formatNumber(value);
            }
            else if (format === 'percent') {
                value = value + '%';
            }

            // 有时需要自定义tip信息 所以需要允许自定义
            var returnedEvent = this.fire('beforebuildtipitem', {param: param, value: value});

            var styles = 'margin-right:5px;display:inline-block;width:10px;height:10px;';
            var defaultTip = '<b style="' + styles + 'background:' + legendColor + ';"></b>'
                            + param.seriesName + '：' + value;

            return returnedEvent.itemValue || defaultTip;
        }

        /**
         * 获取单位刻度值
         *
         * 控件设置有默认五个基础比例尺 '1, 1.5, 2, 5, 10'
         * 根据目标数据的位数对基础比例尺做加权
         * 比如 215 是三位数，权值是100，加权后的比例尺是
         * '100, 150, 200, 500, 1000'
         * 可以涵盖目标数字。
         * 然后通过比较，获取目标数字所落比例尺区间的最大值，即为最后的单位刻度
         *
         * @param {BaseChart} chart 类实例
         * @param {Object} average 实际平均刻度
         *
         * @return {number} scale 获得的单位刻度
         */
        function getNearestScale(chart, average) {
            var averageStr = average.toString();
            // 位数
            var bits = averageStr.length;
            // 通过平均值的位数计算加权值，比如215的加权就是100
            var power = Math.pow(10, bits - 1);

            // 基础比例尺格式化为数组，默认[1, 1.5, 2, 5, 10]
            var baseScale = chart.scale.split(',');
            var scale;
            for (var i = 0; i < baseScale.length; i++) {
                // 实际比例尺选择范围是基础比例尺乘以加权值
                baseScale[i] = parseFloat(baseScale[i]) * power;
                // 向上取值
                if (average <= baseScale[i]) {
                    scale = baseScale[i];
                    break;
                }
            }

            return scale;
        }

        esui.register(BaseChart);
        return BaseChart;
    }
);
