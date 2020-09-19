define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/settingsContent.js',
    'text!./templates/settings-property-server.html',
    'css!./css/settingsContent'
], function($, k, u, common, local, serverPage) {
    
    var serverPageTmpl = k.template(serverPage);
    
    var public = {
        myModuleName: 'SettingsServerModule',
        defaultOffset: 1,
        serverWatchFunc: null,
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
            this.serverId = this.treeId;
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
            private.delServerWatchId.call(this);
            private.setServerWatchOff.call(this);
            private.setOffToolbarWatchBtn.call(this);
            private.redraw.call(this, this.treeId, period);
        },
        onClickToggleServerWatchBtn: function() {
            var serverWatchId = private.getServerWatchId();

            if (serverWatchId) {
                private.setServerWatchOff.call(this);
                private.delServerWatchId();
            } else {
                private.setServerWatchOn.call(this, this.serverId);
                private.setServerWatchId(this.serverId);
            }                                                
        },        
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
        
        },
        getServerWatchId: function() {
            var storage = app.getStorage();
            return storage.get('serverWatchId');            
        },
        delServerWatchId: function() {
            var storage = app.getStorage();
            storage.remove('serverWatchId');
        },
        setServerWatchId: function(val) {
            var storage = app.getStorage();
            storage.set('serverWatchId', val);
        },
        setServerWatchOn: function(serverId) {
            var that = this;

            requirejs(['js/settingsContent/data/server-free-fill-list'], function(list) {
                private.renderServerMemoryUsageStat.call(that, list);
                private.renderServerDiskUsageStat.call(that, list);                
                
                that.serverWatchFunc = setInterval(function() {                
                    private.getDataSource.call(that, serverId, null, function(data) {
                        if (!data || data.length == 0) {
                            return;
                        }
                        var a = data[0],
                            b = list[list.length-1]; // <-- get last rec

                        if (a.recId != b.recId) {
                            list.splice(0, 1);
                            list.push(a);
                            private.renderServerMemoryUsageStat.call(that, list);
                            private.renderServerDiskUsageStat.call(that, list);
                        }
                    });
                }, that.watchPeriod);               
            });
        },
        setServerWatchOff: function() {
            clearInterval(this.serverWatchFunc);
        },
        setOnToolbarWatchBtn: function() {
            var btn = this.el.find('#server-statistic-toolbar .k-toggle-button');
            
            if (btn) {
                btn.addClass('k-state-active');
            }
        },
        setOffToolbarWatchBtn: function() {
            var btn = this.el.find('#server-statistic-toolbar .k-toggle-button');

            if (btn) {
                btn.removeClass('k-state-active');
            }
        },        
        redraw: function(serverId, period) {
            var that = this;

            private.getDataSource.call(this, serverId, period, function(data) {
                private.renderServerMemoryUsageStat.call(that, data);
                private.renderServerDiskUsageStat.call(that, data);
            });
        },
        render: function() {
            var that = this,
                serverId = this.treeId;

            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-server&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: {
                    serverId: serverId
                },
                success: function(resp) {
                    var r = JSON.parse(resp),
                        serverWatchId = private.getServerWatchId();

                    if (r.success) {     
                        var html = serverPageTmpl({
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
                        that.el.find('#server-statistic-toolbar').kendoToolBar({
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
                                text: that.i18n.settings.getStatistics,
                                click: function() {
                                    that.onClickRedrawBtn.call(that);
                                }
                            },{
                                type: 'separator'
                            },{
                                type: 'button', 
                                icon: 'search',
                                text: that.i18n.settings.watch, 
                                togglable: true,
                                selected: serverWatchId == null ? false : true,
                                toggle: function() {
                                    that.onClickToggleServerWatchBtn.call(that);
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
                        private.renderAsteriskTable.call(that, serverId);  
                        
                        if (serverWatchId) {
                            private.setServerWatchOn.call(that, serverId)
                        } else {
                            private.redraw.call(that, serverId, that.defaultPeriod);
                        }
                    } else {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }                                        
                }
            });
        },
        renderAsteriskTable: function(serverId) {
            var getDataSource = function() {
                var that = this; 

                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=get-asterisk-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    serverId: serverId
                                },
                                success: function(resp) {
                                    var r;

                                    if (!resp || typeof resp == 'undefined') {
                                        options.error();
                                    } else {
                                        try {
                                            r = JSON.parse(resp);
                                            
                                            if (r.success) {
                                               options.success(r);
                                            } else {
                                               options.error();
                                            }
                                        } catch(e) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        }                                    
                                    }
                                }
                            });
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "asteriskId",
                            fields: {                                
                                asteriskId: {editable: false},
                                activity: {editable: false},
                                port: {editable: false},
                                pid: {editable: false},
                                companyName: {editable: false}
                           }
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                  
            };
            this.el.find('#asterisk-list').kendoGrid({
                columns: [{
                    field: 'asteriskId',
                    title: 'id',
                    width: '40px'
                },{ 
                    field: 'companyName',
                    title: 'Компания'
                },{ 
                    field: 'activity',
                    title: 'Состояние'
                },{ 
                    field: 'port',
                    title: 'port'
                },{ 
                    field: 'pid',
                    title: 'pid'
                }],                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                editable: false
            });             
        },
        renderServerMemoryUsageStat: function(data) {
            var that = this;
            
            var getSeries = function() {
                var series = [{
                    name: 'memoryTotal',
                    data: []
                },{
                    name: 'memoryFree',
                    data: []
                },{
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
                        tmp = rec.time == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.time.split(' ')[1].split(':'),
                        time = tmp[0] + ':' + tmp[1]; //<-- time without sec

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#server-memory-usage').kendoChart({
                transition: false,
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
                    },
                    labels: {
                        rotation: 90
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
        renderServerDiskUsageStat: function(data) {
            var that = this;            
            
            var getSeries = function() {
                var series = [{
                    name: 'discTotalSpace',
                    data: []
                },{
                    name: 'discFreeSpace',
                    data: []
                },{
                    name: 'discUsageSpace',
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
                        tmp = rec.time == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.time.split(' ')[1].split(':'),
                        time = tmp[0] + ':' + tmp[1]; //<-- time without sec

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#server-disk-usage').kendoChart({
                transition: false,
                title: {
                    position: "top",
                    text: "График потребления дискового пространства"
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
                      format: "{0} Gb"
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
                    },
                    labels: {
                        rotation: 90
                    }
                },
                chartArea: {
                    height: 400
                },                                    
                tooltip: {
                    visible: true,
                    format: "{0} Gb",
                    template: "#= series.name #: #= value # Gb"
                }
            }); 
        },        
        getDataSource: function(serverId, period, callback) {
            var that = this;
            
            if (!serverId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-server-statistics&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: {
                    period: period,
                    serverId: serverId
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