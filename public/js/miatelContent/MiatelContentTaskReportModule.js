define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'css!./css/miatelContent'
], function($, k, u, common, local) {
    
    var public = {
        myModuleName: 'MiatelContentTaskReportModule',
        mySectionName: 'miatel',
        taskInfo: null,
        chart: null,
        table: null,
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);                        
            private.render.call(this);
            private.bindEvents.call(this);
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
            app.subscribe('update-task', this.myModuleName, function(data) {
                if (data.parentTaskId == that.taskId) {
                    private.reload.call(that);                    
                } else if (typeof data.originParentTaskId != 'undefined' && data.originParentTaskId == that.taskId) {
                    private.reload.call(that);                    
                }
            });
            app.subscribe('del-task', this.myModuleName, function(data) {
                if (data.parentTaskId == that.taskId) {
                    private.reload.call(that);                    
                }                
            });
        },        
        render: function() {
            var that = this,
                el = $('#miatel-task-report'),
                data = {
                    taskId: this.taskId,
                    userHash: app.getActiveUserHash()
                };
                
            u.ajaxRequest('report/get-need-time', data, function(err, data) {
                if (!err) { 
                    private.renderPieChart.call(that, data);
                    private.renderTable.call(that, data);
                }
            });
        },
        reload: function() {
            var that = this,
                data = {
                taskId: this.taskId,
                userHash: app.getActiveUserHash()
            },
            series;
            
            u.ajaxRequest('report/get-need-time', data, function(err, data) {
                if (!err) { 
                    series = private.getChartSeriesData(data);            
                    that.chart.options.series[0].data = series.taskCountArr;
                    that.chart.options.series[1].data = series.needTimeArr;                                 
                    that.chart.refresh();
                    that.grid.dataSource.data(data);
                    that.grid.refresh();
                }
            });
        },
        renderPieChart: function(data) {
            var that = this,
                el = this.el.find('#miatel-report-pie');
            
            if (!el || !data || !data.length) {
                return;
            } 
            if (this.chart) {
                this.chart.destroy();
            }
            var series = private.getChartSeriesData(data);
            
            that.chart = el.kendoChart({
                legend: {
                    visible: false,
                    align: 'end'
                },
                chartArea: {
                    background: "",

                },
                seriesDefaults: {
                    type: "donut",
                    startAngle: 150,
                    overlay: {
                        gradient: 'none'
                    },
                },                
                series: [{
                    name: 'Количество задач',
                    data: series.taskCountArr
                },{
                    name: 'Потрачено времени',
                    data: series.needTimeArr                    
                }],
                tooltip: {
                    visible: true,
                    template: function(rec) {
                        if (rec.series.name == 'Количество задач') {
                            return rec.category + ' (' + rec.series.name + ') ' + rec.value;
                        } else {
                            return rec.category + ' (' + rec.series.name + ') ' + u.getFormatedTimeStr(rec.value);
                        }                        
                    }
                }
            }).data('kendoChart');                                       
        },
        renderTable: function(data) {
            var that = this,
                el = this.el.find('#miatel-report-table');

            if (!el) {
                return;
            }            
            this.grid = el.kendoGrid({
                dataSource: {
                    data: data
                },   
                height: 317,                
                scrollable: false,
                sortable: true,
                columns: [{
                    title: 'Имя',
                    field: 'taskExecutorName'
                },{
                    title: 'Время итого',
                    field: 'taskNeedTimeTotal',
                    template: function(row) {
                        return u.getFormatedTimeStr(row.taskNeedTimeTotal) + ' (' + row.taskNeedTimeTotal/60 + 'ч.)';
                    }
                },{
                    title: 'Кол-во',
                    field: 'taskCompleteTotal'
                }]
            }).data('kendoGrid');
        },
        getChartSeriesData: function(data) {
            var needTimeArr = [],
                taskCountArr = [];
        
            if (!data) {
                return [];
            }                    
            for (var i=0; i < data.length-1; i++) {
                var rec = data[i];
                
                needTimeArr.push({                        
                    category: rec.taskExecutorName,
                    value: rec.taskNeedTimeTotal
                });
                taskCountArr.push({
                    category: rec.taskExecutorName,
                    value: rec.taskCompleteTotal
                });                
            }
            return {
                needTimeArr: needTimeArr,
                taskCountArr: taskCountArr
            };
        }
    };
    return public;
});