define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/settingsContent.js',
    'text!./templates/settings-whitelist-exceptions-list.html',
    'css!./css/settingsContent'
], function($, k, u, common, local, exceptionsList) {
    
    var exceptionsListTmpl = k.template(exceptionsList);
    
    var public = {
        myModuleName: 'SettingsWhiteListExeptionsModule',
        defaultClientId: '01',
        defaultClientName: 'MIATEL LLC.',
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
            
            html = exceptionsListTmpl({
                i18n: that.i18n,
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
            private.renderExceptionsTable.call(this);            
        },
        renderExceptionsTable: function() {
            var that = this;
            
            var mvtsClientsDropDownEditor = function(container, options) {
                $('<input required data-text-field="clientName" data-value-field="clientId" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: false,
                        value: options.model.clientId,
                        text: options.model.clientName,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.transitServerUrl + 'whitelist.php?method=get-client-list',
                                        type: 'post',
                                        success: function(resp) {
                                            var r = JSON.parse(resp);

                                            if (r.success) {
                                                options.success(r.data.list);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        },
                        dataBound: function(e) {
                            this.value(options.model.clientId);
                        }
                    });
            }; 
            this.el.find('#exceptions-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px'
                },{
                    field: 'client',    
                    title: 'Имя',
                    editor: mvtsClientsDropDownEditor,
                    template: "#= clientName #"
                },{
                    field: 'clientInfo',
                    title: 'Ремарка'
                },{
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "90px"
                }],                
                dataSource: private.getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            });              
        },
        getDataSource: function() {
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
                            url: app.transitServerUrl + 'whitelist.php?method=get-white-client-list',
                            type: 'post',
                            data: {
                                sort: sort
                            },                            
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {                                    
                                    options.success(r);
                                } else {
                                    options.error();
                                }                                    
                            }
                        });
                    },
                    create: function(options) {
                        var model = options.data.models[0],
                            data = {
                                id: model.id,
                                clientInfo: model.clientInfo,
                                clientId: model.client.clientId,
                                clientName: model.client.clientName
                            };

                        $.ajax({
                            url: app.transitServerUrl + 'whitelist.php?method=add-white-client',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    data.id = r.data.id;
                                    options.success({data:data});                                    
                                    app.publish('add-whitelist-client', data);
                                }
                            }
                        });
                    },
                    update: function(options) {
                        var model = options.data.models[0],
                            data = {
                                id: model.id,
                                clientInfo: model.clientInfo || '',
                                clientId: (model.client && model.client.clientId) || model.clientId,
                                clientName: (model.client && model.client.clientName) || model.clientName
                            };
                            
                        $.ajax({
                            url: app.transitServerUrl + 'whitelist.php?method=update-white-client-property',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                
                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('update-whitelist-client', data);
                                }
                            }
                        });                        
                    }, 
                    destroy: function(options) {
                        var model = options.data.models[0],
                            data = {
                                id: model.id,
                                clientInfo: model.clientInfo,
                                clientId: model.clientId,
                                clientName: model.clientName
                            };
                            
                        $.ajax({
                            url: app.transitServerUrl + 'whitelist.php?method=del-white-client',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('del-whitelist-client', data);
                                } else {
                                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
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
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]); //<-- error params get   
                        } else if (typeof resp.data.list == 'undefined') {
                            return resp.data;
                        } else {
                            return resp.data.list;
                        }                        
                    },
                    model: {
                        id: "id",
                        fields: {
                            id: {editable: false, nullable: true},
                            clientInfo: {},
                            client: {defaultValue: {clientName: ''}}
                        }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: app.getGridPageSize(),                
                serverPaging: true,
                serverSorting: true
            });                 
        }
    };
    return public;
});