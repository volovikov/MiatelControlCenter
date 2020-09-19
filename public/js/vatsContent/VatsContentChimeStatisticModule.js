define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-chime-statistic.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsChimeStatistic) {
    
    var vatsChimeStatisticTmpl = k.template(vatsChimeStatistic);
    
    var public = {        
        myModuleName: 'VatsContentChimeStatisticModule',
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
          
        },
        render: function() {
            var that = this;

            html = vatsChimeStatisticTmpl({
                i18n: that.i18n
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
            private.renderSessionTable.call(this);
            //private.renderStatistics.call(this);
        },
        renderSessionTable: function() {
            var that = this;
            
            var getDataSource = function() {
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
                                url: app.getServerApiUrl() + 'session/get-session-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    id: that.treeId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                    } else {
                                        options.error();
                                    }
                                }
                            });
                        },
                        destroy: function(options) {
                            var data = $.extend(options.data.models[0], {
                                userHash: app.getActiveUserHash()
                            });
                            $.ajax({
                                url: app.getServerApiUrl() + 'session/del-session',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
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
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data == 'undefined') {
                                return [];
                            } else if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: {editable: false, nullable: true },
                                userGlobalId: {editable: false},
                                userHash: {editable: false},
                                connectionDateTime: {editable: false},
                                ownerSession: {editable: false},
                                oldUserHash: {editable: false}
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
            this.el.find('#session-table').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'userGlobalId',
                    title: 'userGlobalId'
                },{
                    field: 'userHash',
                    title: 'userHash'                    
                },{
                    field: 'connectionDateTime',
                    title: 'connectionDateTime'                                        
                },{
                    field: 'ownerSession',
                    title: 'ownerSession'                                                            
                },{
                    field: 'ipAddress',
                    title: 'ipAddress'                    
                },{
                    field: 'oldUserHash',
                    title: 'oldUserHash'                                        
                },{
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "90px"
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
                editable: true
            });             
        }
    };
    return public;
});