define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-property-asterisk.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, asteriskPage) {
    
    var asteriskPageTmpl = k.template(asteriskPage);
    
    var public = {
        myModuleName: 'VatsAsteriskModule',
        defaultOffset: 1,
        asteriskWatchFunc: null,
        watchPeriod: 1000 * 30, // 30 sec        
        defaultPeriod: {
            dateBegin: null,
            timeBegin: null,
            dateEnd: null,
            timeEnd: null
        },
        run: function(params) {
            var d = new Date(),
                h = d.getHours() - 1,
                ptime = h + ':' + d.getMinutes() + ':' + d.getSeconds();

            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);    

            this.defaultPeriod = {
                dateBegin: u.getCurrentDate(),
                timeBegin: ptime,
                dateEnd: u.getCurrentDate(),
                timeEnd: u.getCurrentTime()
            };
            this.asteriskId = this.treeId.split('-')[1];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickRedrawBtn: function() {
            var period = {
                dateBegin: this.el.find('#dateBegin').val(),
                timeBegin: this.el.find('#timeBegin').val(),
                dateEnd: this.el.find('#dateEnd').val(),
                timeEnd: this.el.find('#timeEnd').val(),
            };
            private.delAsteriskWatchId.call(this);
            private.setAsteriskWatchOff.call(this);
            private.setOffToolbarWatchBtn.call(this);
            private.redraw.call(this, this.asteriskId, period);
        },
        onClickToggleAsteriskWatchBtn: function() {
            var asteriskWatchId = private.getAsteriskWatchId();

            if (asteriskWatchId) {
                private.setAsteriskWatchOff.call(this);
                private.delAsteriskWatchId();
            } else {
                private.setAsteriskWatchOn.call(this, this.asteriskId);
                private.setAsteriskWatchId(this.asteriskId);
            }                                                
        },         
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
        
        },
        getAsteriskWatchId: function() {
            var storage = app.getStorage();
            return storage.get('asteriskWatchId');            
        },
        delAsteriskWatchId: function() {
            var storage = app.getStorage();
            storage.remove('asteriskWatchId');
        },
        setAsteriskWatchId: function(val) {
            var storage = app.getStorage();
            storage.set('asteriskWatchId', val);
        },
        setAsteriskWatchOn: function(asteriskId) {
            var that = this;

            requirejs(['js/vatsContent/data/asterisk-free-fill-list'], function(list) {
                private.renderAsteriskMemoryUsageStat.call(that, list);
                private.renderAsteriskCpuUsageStat.call(that, list);
                
                that.asteriskWatchFunc = setInterval(function() {                
                    private.getDataSource.call(that, asteriskId, null, function(data) {
                        if (!data || data.length == 0) {
                            return;
                        }
                        var a = data[0],
                            b = list[list.length-1]; // <-- get last rec

                        if (a.id != b.id) {
                            list.splice(0, 1);
                            list.push(a);
                            private.renderAsteriskMemoryUsageStat.call(that, list);
                            private.renderAsteriskCpuUsageStat.call(that, list);
                        }
                    });
                }, that.watchPeriod);               
            });
        },
        setAsteriskWatchOff: function() {
            clearInterval(this.asteriskWatchFunc);
        },
        setOnToolbarWatchBtn: function() {
            var btn = this.el.find('#asterisk-statistic-toolbar .k-toggle-button');
            
            if (btn) {
                btn.addClass('k-state-active');
            }
        },
        setOffToolbarWatchBtn: function() {
            var btn = this.el.find('#asterisk-statistic-toolbar .k-toggle-button');

            if (btn) {
                btn.removeClass('k-state-active');
            }
        },    
        redraw: function(asteriskId, period) {
            var that = this;

            private.getDataSource.call(this, asteriskId, period, function(data) {
                private.renderAsteriskMemoryUsageStat.call(that, data);
                private.renderAsteriskCpuUsageStat.call(that, data);
            });
        },        
        render: function() {
            var that = this,
                asteriskId = this.asteriskId;

            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-asterisk&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: {
                    asteriskId: asteriskId
                },
                success: function(resp) {
                    var r = JSON.parse(resp),
                        asteriskWatchId = private.getAsteriskWatchId();;
                    
                    if (r.success) {                        
                        var html = asteriskPageTmpl({
                            i18n: that.i18n,
                            data: r.data
                        });
                        that.el.html(html);                                 
                        that.el.find('.combobox').kendoComboBox();
                        that.el.find('.tabstrip').kendoTabStrip({
                            animation:  {
                                open: {
                                    effects: "fadeIn"
                                }
                            }
                        }); 
                        that.el.find('#asterisk-statistic-toolbar').kendoToolBar({
                            items: [{
                                template: '<input class="datePicker" id="dateBegin" value="' + that.defaultPeriod.dateBegin + '"/>', 
                                overflow: 'never'                                             
                            },{
                                template: '<input class="timePicker" id="timeBegin" value="' + that.defaultPeriod.timeBegin + '"/>', 
                                overflow: 'never'                                                                                 
                            },{
                                type: 'separator'
                            },{
                                template: '<input class="datePicker" id="dateEnd" value="' + that.defaultPeriod.dateEnd + '"/>', 
                                overflow: 'never'                                             
                            },{
                                template: '<input class="timePicker" id="timeEnd" value="' + that.defaultPeriod.timeEnd + '"/>', 
                                overflow: 'never'                                                                                 
                            },{
                                type: 'button',
                                icon: 'refresh',
                                text: that.i18n.vatsContent.getStatistics,
                                click: function() {
                                    that.onClickRedrawBtn.call(that);
                                }
                            },{
                                type: 'separator'
                            },{
                                type: 'button', 
                                icon: 'search',
                                text: that.i18n.vatsContent.watch, 
                                togglable: true,
                                selected: asteriskWatchId == null ? false : true,
                                toggle: function() {
                                    that.onClickToggleAsteriskWatchBtn.call(that);
                                }
                            }]                                
                        });   
                        that.el.find(".datePicker").kendoDatePicker({
                            depth: 'month',
                            format: 'yyyy-MM-dd'
                        });                        
                        that.el.find(".timePicker").kendoTimePicker({
                            format: 'HH:mm'
                        }); 
                        if (asteriskWatchId) {
                            private.setAsteriskWatchOn.call(that, asteriskId)
                        } else {
                            private.redraw.call(that, asteriskId, that.defaultPeriod);
                        }
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });
        },
        renderAsteriskMemoryUsageStat: function(data) {
            var that = this;
            
            var getSeries = function() {
                var series = [{
                    name: 'memoryUsage',
                    data: []
                }];
                for (var i in data) {
                    var rec = data[i];

                    for (var j in series) {
                        var s = series[j];
                        s.data.push(rec[s.name]);
                    }
                }
                return series;
            };
            var getCategories = function() {
                var cat = [];

                for (var i in data) {
                    var rec = data[i],
                        tmp = rec.date == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.date.split(' ')[1].split(':'),
                        time = tmp[0] + ':' + tmp[1]; //<-- time without sec                        

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#asterisk-memory-usage').kendoChart({
                title: {
                    position: "top",
                    text: "График загрузки памяти"
                },
                legend: {
                    position: "bottom"
                },
                seriesDefaults: {
                    type: "area",
                    area: {
                        line: {
                            style: "smooth"
                        }
                    }
                },
                series: getSeries(),  
                valueAxis: {
                    labels: {
                      format: "{0} Mb"
                    },                        
                    line: {
                        visible: false
                    },
                    axisCrossingValue: -10                    
                },
                categoryAxis: {
                    categories: getCategories(),
                    majorGridLines: {
                        visible: false
                    }                     
                },
                chartArea: {
                    height: 400
                },                                    
                tooltip: {
                    visible: true,
                    format: "{0} Mb",
                    template: "#= series.name #: #= value # Mb"
                }
            }); 
        },
        renderAsteriskCpuUsageStat: function(data) {
            var that = this;
            
            var getSeries = function() {
                var series = [{
                    name: 'cpuUsage',
                    data: []
                }];
                for (var i in data) {
                    var rec = data[i];

                    for (var j in series) {
                        var s = series[j];
                        s.data.push(rec[s.name]);
                    }
                }
                return series;
            };
            var getCategories = function() {
                var cat = [];

                for (var i in data) {
                    var rec = data[i],
                        tmp = rec.date == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.date.split(' ')[1].split(':'),
                        time = tmp[0] + ':' + tmp[1];

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#asterisk-cpu-usage').kendoChart({
                title: {
                    position: "top",
                    text: "График загрузки ЦП"
                },
                legend: {
                    position: "bottom"
                },
                seriesDefaults: {
                    type: "area",
                    area: {
                        line: {
                            style: "smooth"
                        }
                    }
                },
                series: getSeries(),  
                valueAxis: {
                    labels: {
                      format: "{0} %"
                    },                        
                    line: {
                        visible: false
                    },
                    axisCrossingValue: -10                    
                },
                categoryAxis: {
                    categories: getCategories(),
                    majorGridLines: {
                        visible: false
                    }                     
                },
                chartArea: {
                    height: 400
                },                                    
                tooltip: {
                    visible: true,
                    format: "{0} %",
                    template: "#= series.name #: #= value # %"
                }
            }); 
        },        
        getDataSource: function(asteriskId, period, callback) {
            var that = this;
            
            if (!asteriskId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-asterisk-statistics&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: {
                    period: period,
                    asteriskId: asteriskId
                },                            
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        callback(r.data.list); 
                    } else {                            
                        app.showPopupErrors(r.errors);
                    }                                    
                }
            });            
        }
    };
    return public;
});