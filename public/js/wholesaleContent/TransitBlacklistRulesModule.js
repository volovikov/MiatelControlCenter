define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/transit-blacklist-rules.html',
    'css!./css/wholesaleContent'
], function($, k, u, common, local, blacklistRules) {

    var blacklistRulesTmpl = k.template(blacklistRules);

    var public = {
        myModuleName: 'TransitBlacklistRulesModule',
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
            html = blacklistRulesTmpl({
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
            private.renderBlacklistRulesTable.call(this);            
        },
        renderBlacklistRulesTable: function() {
          var statusRuleEditor=function(container,options){
            $('<input required data-text-field="value" data-value-field="value" data-bind="value:'+options.field+'"/>')
              .appendTo(container)
              .kendoDropDownList({
                autoBind:true,
                dataSource:[{
                  value: 'yes'
                },{
                  value: 'no'
                }]
            });
          };
            var that = this;
            this.el.find('#rules-list').kendoGrid({
                filterable:{
                  extra:false,
                  operators:{
                    string:{
                      like: "Start with"
                    }
                  }
                },
                columns: [{
                    field: 'nameFilter',
                    title: 'Имя правила',
                },{
                    field: 'active',
                    title: 'В работе',
                    filterable:false,
                    editor: statusRuleEditor
                },{
                    field: 'dataE',
                    hidden: true
                },{
                    field: 'info',    
                    title: 'Ремарка',
                    filterable:false
                },{
                    command: ["destroy"],
                    title: "&nbsp",
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
                            url: app.transitServerUrl + 'blacklist.php?method=get-rules',
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
                              nameFilter:model.nameFilter,
                              dataE:model.dataE,
                              info:model.info,
                              active:model.active
                            };

                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=add-rules',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    data.nameFilter = r.data.nameFilter;
                                    data.active=r.data.active;
                                    options.success({data:data});                                    
                                    app.publish('add-rules', data);
                                }
                            }
                        });
                    },
                    update: function(options) {
                        var model = options.data.models[0],
                            data = {
                              nameFilter:model.nameFilter,
                              dataE:model.dataE,
                              info:model.info,
                              active:model.active
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=set-rules',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('update-rules', data);
                                }
                            }
                        });                        
                    }, 
                    destroy: function(options) {
                        var model = options.data.models[0],
                            data = {
                                nameFilter: model.nameFilter,
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=del-rules',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data: data});
                                    app.publish('del-rules', data);
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
                        id: "nameFilter",
                        fields: {
                          nameFilter:{},
                          info:{},
                          dataE:{},
                          active:{}
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