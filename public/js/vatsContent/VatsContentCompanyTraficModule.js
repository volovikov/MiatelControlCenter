define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-company-trafic.html',
], function($, k, u, common, local, vatsCompanyTrafic) {
    
    var vatsCompanyTraficTmpl = k.template(vatsCompanyTrafic);
    
    var public = {
        myModuleName: 'VatsContentCompanyTraficModule',
        companyInfo: null,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }             
            this.i18n = $.extend(common, local);
            private.bindEvents.call(this);
            private.render.call(this); 
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('history-call-load-complete', this.myModuleName, function(data) {                
                var dataSource = private.getChartDataSource.call(that, data);
   
                if (dataSource) {
                    private.renderChart.call(that, dataSource);
                }
            });
        },
        render: function() {
            var that = this;
            
            this.el.html(vatsCompanyTraficTmpl({
                i18n: that.i18n
            }));
            this.el.find('.combobox').kendoComboBox();
            this.tabStrip = this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
        },
        renderChart: function(chartDataSource) {
            var getMaxCallCount = function() {
                var max = 0;
                
                for (var i in chartDataSource) {
                    var rec = chartDataSource[i];
                            
                    if (rec.value > max) {
                        max = rec.value;
                    }
                }
                return ++max;
            };
            this.el.find('#company-trafic-chart').kendoChart({
                dataSource: {
                    data: chartDataSource
                },
                legend: {
                    visible: true
                },
                seriesDefaults: {
                    type: 'column',
                    overlay: {
                        gradient: 'none'
                    },                    
                    labels: {
                        visible: true,
                        background: 'transparent'
                    },
                    border: {
                        color: "green",
                        width: 0
                    }
                },
                series: [{
                    field: 'value',
                    colorField: 'userColor'
                }],
                valueAxis: {
                    max: getMaxCallCount(),
                    majorGridLines: {
                        visible: false
                    },
                    visible: true
                },
                categoryAxis: {
                    field: 'date',
                    majorGridLines: {
                        visible: false
                    },
                    line: {
                        visible: true
                    }
                }                   
            });
        },
        getChartDataSource: function(historyCallList) {
            var obj = {},
                userColor = '#ffd600';

            for (var i in historyCallList) {
                var call = historyCallList[i],
                    date = call.time.split(' ')[0];

                if (typeof obj[date] != 'undefined') {
                    obj[date].value++; 
                } else {
                    obj[date] = {
                        value: 1,
                        date: date,
                        userColor: userColor
                    };
                }
            }
            var offset = 5,
                result = [],
                week = {};

            for (var i=0; i<offset; i++) {
                var d  = new Date(),
                    cd = d.getDate(),                
                    tmp = u.getTimeFormatStr(new Date(d.setDate(cd - i))),
                    date = tmp.split(' ')[0];
            
                week[date] = {
                    value: 0,
                    date: date,
                    userColor: userColor
                };                
            }
            for (var dateKey in week) {
                if (typeof obj[dateKey] != 'undefined') {
                    result.push(obj[dateKey]);
                } else {
                    result.push(week[dateKey]);
                }
            }
            return result;
        }
    };
    return public;
});