/**
 * @file 地域地图控件
 * @exports ui.RegionChart
 * @author lixiang(lixiang05@baidu.com)
 */

define(
    function (require) {
        require('echarts/chart/map');
        require('echarts/chart/pie');

        var eoo = require('eoo');
        var echarts = require('echarts');
        var lib = require('esui/lib');
        var painter = require('esui/painters');
        var Control = require('esui/Control');
        var util = require('../helper/util');
        var u = require('underscore');
        var BaseChart = require('./BaseChart');
        var $ = require('jquery');

        /**
         * 地图控件
         *
         * @class ui.RegionChart
         * @extends ui.BaseChart
         */
        var RegionChart = eoo.create(BaseChart, {
            /**
             * @override
             */
            type: 'RegionChart',

            /**
             * @override
             */
            styleType: 'Chart',

            /**
             * @override
             */
            initOptions: function (options) {
                var mapSeries = {
                    name: '',
                    type: 'map',
                    mapType: 'china',
                    mapLocation: {
                        x: 'left'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: lib.bind(this.tipFormatter, this)
                    },
                    itemStyle: {
                        normal: {
                            label: {show: true}
                        },
                        emphasis: {
                            label: {show: true}
                        }
                    },
                    data: []
                };

                var pieSeries = {
                    name: '',
                    type: 'pie',
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                    },
                    radius: [50, 120],
                    data: []
                };

                var properties = {
                    backgroundColor: '#f8f8f8',
                    tooltip: {
                        trigger: 'item'
                    },
                    animation: false,
                    series: [
                        mapSeries,
                        pieSeries
                    ]
                };
                this.chartOptions = properties;
                var controlProperties = {
                    width: 'auto',
                    height: 400,
                    mapName: '',
                    mapData: [],
                    pieName: '',
                    pieData: [],

                    // color不写就是用theme里的配色，可以通过option指定
                    rangeColors: [
                        // '#ff8656', '#ffa347', '#ffd254',
                        // '#9de0a5', '#bbbbbb'
                    ],
                    // 色块颜色
                    pieColors: [
                        // '#ff8656', '#ffa347', '#ffd254',
                        // '#9de0a5', '#9de0a5', '#9de0a5',
                        // '#bbbbbb'
                    ]
                };
                lib.extend(controlProperties, options);
                this.setProperties(controlProperties);
            },

            /**
             * @override
             */
            tipFormatter: function (params, axisIndex) {
                // 地域名称
                var name = params.name;
                // 地域值
                var value = params.value;
                var format = params.data.format;
                if (format === 'money') {
                    value = (value === '-') ? '- -' : util.formatNumber(value, 2, '');
                }
                else if (format === 'int') {
                    value = util.formatNumber(value);
                }
                else if (format === 'percent') {
                    value = value + '%';
                }
                // 地域指标
                var seriesName = params.seriesName;
                //  河北
                //  展现量：xxx
                var html = name + '<br>' + seriesName + '：' + value;
                return html;
            },

            /**
             * @override
             */
            initStructure: function () {
                this.main.innerHTML = ''
                    + this.helper.getPartBeginTag('frame', 'div')
                    +     this.helper.getPartBeginTag('main', 'div')
                    +     this.helper.getPartEndTag('main', 'div')
                    +     this.helper.getPartBeginTag('loading-mask', 'div')
                    +     this.loadingText
                    +     this.helper.getPartEndTag('loading-mask', 'div')
                    + this.helper.getPartEndTag('frame', 'div');

                lib.addClass(this.main, 'ui-regionchart');
                $(this.main).find('.' + this.helper.getPartClassName('main')).css({
                    width: this.width,
                    height: this.height
                });
                var chart = echarts.init(this.helper.getPart('main'));
                this.chart = chart;

                // 绑定resize事件
                this.helper.addDOMEvent(
                    window,
                    'resize',
                    function () {
                        var pieSeries = this.chartOptions.series[1];
                        var chartMain = this.helper.getPart('main');
                        if (chartMain) {
                            var pieLeftPosition = getPieLeftPosition(chartMain.offsetWidth);
                            pieSeries.center = [pieLeftPosition, 200];
                            chart.setOption(this.chartOptions, true);
                        }
                        chart.resize();
                    }
                );
            },

            /**
             * @override
             */
            repaint: painter.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['mapData', 'mapName', 'pieData', 'pieName'],
                    // pieName和mapName分别是mapData和pieData的提示名称，随着
                    // data变化而变化
                    paint: function (chart, mapData, mapName, pieData, pieName) {
                        if (!mapData || !pieData) {
                            return;
                        }

                        // 更新地图控件数据
                        var mapSeries = chart.chartOptions.series[0];
                        var pieSeries = chart.chartOptions.series[1];
                        var isMapEqual = u.isEqual(mapSeries.data, mapData);
                        var isPieEqual = u.isEqual(pieSeries.data, pieData);
                        var isMapEmpty = mapData.length === 0;
                        var isPieEmpty = pieData.length === 0;
                        if (isMapEqual && isPieEqual && !isPieEmpty && !isMapEmpty) {
                            return;
                        }

                        if (u.isArray(pieData)) {
                            // 更新饼图数据
                            pieSeries.data = formatPieData.call(chart, pieData);
                            pieSeries.name = pieName;
                        }

                        if (u.isArray(mapData)) {
                            // 更新地图数据
                            mapSeries.data = mapData;
                            mapSeries.name = mapName;
                        }

                        var maxItem = u.max(mapData, function (item) {
                            return item.value;
                        });
                        var minItem = u.min(mapData, function (item) {
                            return item.value;
                        });
                        var max = maxItem.value;
                        var min = minItem.value;

                        var dataRange =  {
                            orient: 'vertical',
                            min: min,
                            max: max,
                            x: 'center',
                            y: 'center',
                            itemWidth: 7,
                            itemHeight: 40,
                            itemGap: 5,
                            text: ['高', '低'],
                            color: chart.rangeColors,
                            calculable: false
                        };
                        var chartMain = lib.g(chart.helper.getId('main'));
                        var pieLeftPosition = getPieLeftPosition(chartMain.offsetWidth);
                        pieSeries.center = [pieLeftPosition, 200];
                        chart.chartOptions.dataRange = dataRange;
                        chart.chartOptions.series = [mapSeries, pieSeries];
                        chart.draw();
                    }
                }
            )
        });

        function formatPieData(data) {
            var control = this;
            // 补充进去一些样式信息
            return u.map(
                data,
                function (item, index) {
                    item.itemStyle = {
                        normal: {
                            color: function (args) {
                                return control.pieColors[args.dataIndex];
                            },
                            label: {
                                textStyle: {
                                    color: control.pieColors[index]
                                }
                            },
                            labelLine: {
                                lineStyle: {
                                    color: control.pieColors[index]
                                }
                            }
                        }
                    };
                    return item;
                }
            );
        }

        // PIE左边距极限值。小于这个的话，就和地图重叠了。
        var LEFT_EXTREME_POSITION = 640;
        // 容器宽度界定值。容器比这个大的话，可以放得更宽松。
        var WINDOW_WIDTH = 1200;

        function getPieLeftPosition(mainWidth) {
            var pieLeftPosition = mainWidth - (mainWidth > WINDOW_WIDTH ? 400 : 220);
            if (pieLeftPosition < LEFT_EXTREME_POSITION) {
                pieLeftPosition = LEFT_EXTREME_POSITION;
            }
            return pieLeftPosition;
        }

        require('esui').register(RegionChart);
        return RegionChart;
    }
);
