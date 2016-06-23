/**
 * @file 线状图封装控件
 * @exports ui.LineChart
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        require('echarts/chart/line');

        var m = require('moment');
        var eoo = require('eoo');
        var painter = require('esui/painters');
        var BaseChart = require('./BaseChart');
        var colorUtil = require('../colorPicker/Color');

        /**
         * 线状图封装控件
         *
         * @class ui.LineChart
         * @extends ui.BaseChart
         */
        var LineChart = eoo.create(BaseChart, {
            /**
             * @override
             */
            type: 'LineChart',

            /**
             * @override
             */
            styleType: 'Chart',

            /**
             * @override
             */
            initChartOptions: function () {
                return {
                    tooltip: {
                        trigger: 'axis'
                    },
                    xAxis: [{}]
                };
            },

            /**
             * @override
             */
            getTipTitleHtml: function (options) {
                // 如果是日期，则需要显示星期几
                // 取一个数据做抽取就可以
                var timeStr;
                if (options.isContrast) {
                    timeStr = getContrastRealTime.call(this, options.pointIndex);
                }
                else {
                    timeStr = options.pointInfo[0].name;
                }
                var week = '';
                var date = m(timeStr, 'YYYY-MM-DD', 'zh-cn');
                if (date.isValid()) {
                    week = date.format('dddd');
                }
                timeStr += ' ' + week;
                return timeStr;
            },

            /**
             * @override
             */
            formatYSeriesData: function (serie, index) {
                // 如果是对比图表，则曲线依赖的坐标计算方式
                if (this.isContrast) {
                    index = Math.floor(index / 2);
                }
                // 计算area的颜色
                var areaStyle = {};
                if (serie.color) {
                    var areaColor = colorUtil.hexToRGB(serie.color);
                    areaStyle = {
                        color: 'rgba('
                            + areaColor.r
                            + ','
                            + areaColor.g
                            + ','
                            + areaColor.b
                            + ', 0.2)'
                    };
                }
                return {
                    name: serie.label,
                    type: 'line',
                    symbol: 'emptyCircle',
                    yAxisIndex: index,
                    itemStyle: {
                        normal: {
                            color: serie.color || '',
                            areaStyle: areaStyle
                        }
                    },
                    smooth: this.get('serieSmooth'),
                    data: serie.data
                };
            },

            /**
             * @override
             */
            repaint: painter.createRepaint(BaseChart.prototype.repaint)
        });

        function getContrastRealTime(index) {
            var xSeriesContrast = this.xSeriesContrast;
            return xSeriesContrast[index];
        }

        require('esui').register(LineChart);

        return LineChart;
    }
);
