define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-aon-pull.html',
    'css!./css/transitContent'
], function($, k, u, common, local, aonpull) {

    var aonPullTmpl = k.template(aonpull);

    var public = {
        myModuleName: 'TransitAonPullModule',
        gridPageSize: 20,
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
            html = aonPullTmpl({
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
            private.renderAonPullTable.call(this);            
        },
        renderAonPullTable: function() {
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
            this.el.find('#pull-list').kendoGrid({
                filterable:{
                  extra:false,
                  operators:{
                    string:{
                      like: "Start with",
                      eq:"=",
                      neq:"<>"
                    }
                  }
                },
                columns: [{
                    field: 'pullId',
                    title: '№',
                    width: '50px',
                    sortable: false,
                    filterable:false
                },{
                    field: 'pullName',
                    title: 'Пулл'
                },{
                    field: 'client',    
                    title: 'Клиент',
                    editor: mvtsClientsDropDownEditor,
                    template: "#= clientName #"
                },{
                    field: 'pullInfo',
                    title: 'Ремарка',
                    sortable: false,
                    filterable:false
                },{
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "90px"
                }],                
                dataSource: private.getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: true,
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
                        $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=get-pull',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip:options.data.skip,
                                take:options.data.take,
                                filter:options.data.filter
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
                                pullId: model.pullId,
                                pullInfo: model.pullInfo,
                                clientId: model.client.clientId,
                                clientName: model.client.clientName,
                                pullName: model.pullName
                            };

                        $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=add-pull',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    data.pullId = r.data.pullId;
                                    options.success({data:data});                                    
                                    app.publish('add-pull', data);
                                }
                            }
                        });
                    },
                    update: function(options) {
                        var model = options.data.models[0],
                            data = {
                                pullId: model.pullId,
                                pullInfo: model.pullInfo || '',
                                clientId: (model.client && model.client.clientId) || model.clientId,
                                clientName: (model.client && model.client.clientName) || model.clientName,
                                pullName: model.pullName
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=set-pull',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('update-pull', data);
                                }
                            }
                        });                        
                    }, 
                    destroy: function(options) {
                        var model = options.data.models[0],
                            data = {
                                pullId: model.pullId,
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=del-pull',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('del-pull', data);
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
                        id: "pullId",
                        fields: {
                            pullId: {editable: false, nullable: true},
                            pullName: {},
                            client: {defaultValue: {clientName: ''}},
                            pullInfo: {}
                        }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,                
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true
            });                 
        }
    };
    return public;
});