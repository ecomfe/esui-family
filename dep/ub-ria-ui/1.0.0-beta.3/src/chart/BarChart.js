/**
 * BarChart Wrapper for ECharts
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 柱状图封装控件
 * @exports ui.BarChart
 * @author lixiang(lixiang05@baidu.com)
 */
define(
    function (require) {
        require('echarts/chart/bar');

        var eoo = require('eoo');
        var painter = require('esui/painters');
        var util = require('../helper/util');
        var BaseChart = require('./BaseChart');
        var u = require('underscore');

        /**
         * @class ui.BarChart
         * @extends ui.BaseChart
         */
        var BarChart = eoo.create(BaseChart, {
            /**
             * @override
             */
            type: 'BarChart',

            /**
             * @override
             */
            styleType: 'Chart',

            /**
             * @override
             */
            initOptions: function (options) {
                this.$super(arguments);

                // 默认属性
                var properties = {
                    barWidth: 20
                };
                u.extend(properties, options);

                this.setProperties(properties);
            },

            /**
             * @override
             */
            initChartOptions: function () {
                var chart = this;
                return {
                    tooltip: {
                        trigger: 'axis',
                        formatter: u.bind(this.tipFormatter, this)
                    },
                    xAxis: [
                        {
                            type: 'category',
                            axisLabel: {
                                interval: 0,
                                formatter: function (value) {
                                    return util.ellipsis(value, chart.maxXLabelLength);
                                }
                            },
                            axisLine: {
                                show: true
                            }
                        }
                    ]
                };
            },

            /**
             * @override
             */
            getTipTitleHtml: function (options) {
                var fullText = this.ellipsisToFull[options.pointIndex];
                // 截断换行
                var length = fullText.length;
                var begin = 0;
                var lines = [];
                while (begin < length) {
                    lines.push(fullText.substr(begin, 50));
                    begin = Math.min(begin + 50, length);
                }
                // 取一个数据做抽取就可以
                return lines.join('<br>');
            },

            /**
             * @override
             */
            formatXSeries: function (xSeries) {
                // 里面包含用来显示的截断文字，也有全文字，设置个映射，以后用
                var ellipsisToFull = [];
                var formattedXSeries = [];
                u.each(xSeries, function (serie, index) {
                    ellipsisToFull.push(serie);
                    formattedXSeries.push(serie);
                });
                this.ellipsisToFull = ellipsisToFull;
                return formattedXSeries;
            },

            /**
             * @override
             */
            formatYSeriesData: function (serie, index) {
                return {
                    name: serie.label,
                    type: 'bar',
                    data: serie.data
                };
            },

            /**
             * @override
             */
            repaint: painter.createRepaint(BaseChart.prototype.repaint)
        });

        require('esui').register(BarChart);

        return BarChart;
    }
);
