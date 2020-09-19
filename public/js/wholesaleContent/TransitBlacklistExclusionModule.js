define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/transit-blacklist-exclusion.html',
    'css!./css/wholesaleContent'
], function($, k, u, common, local, aonpull) {

    var aonPullTmpl = k.template(aonpull);

    var public = {
        myModuleName: 'TransitBlacklistExclusionModule',
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
            this.el.find('#blacklist-exclusion').kendoGrid({
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
                  field: 'idE',
                  title: '№',
                  filterable:false,
                  sortable:false,
                  width: '50px'
                },{
                    field: 'typeE',
                    title: 'Тип',
                    editor:function(c,o){
                      $('<input required data-text-field="value" data-value-field="value" data-bind="value:'+o.field+'"/>')
                      .appendTo(c)
                      .kendoDropDownList({
                        autoBind: true,
                        dataSource:[{value:'src'},{value:'dst'},{value:'client'},{value:'partner'}]
                      });
                    }
                },{
                    field: 'dataE',
                    title: 'Данные'
                },{
                    field: 'infoE',    
                    title: 'Ремарка',
                    filterable:false,
                    sortable:false,
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
                            url: app.transitServerUrl + 'blacklist.php?method=get-exclusion',
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
                                idE: model.idE,
                                infoE: model.infoE,
                                dataE: model.dataE,
                                typeE: model.typeE
                            };

                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=add-exclusion',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    data.idE = r.data.idE;
                                    data.typeE=r.data.dataE;
                                    options.success({data:data});                                    
                                }
                            }
                        });
                    },
                    update: function(options) {
                        var model = options.data.models[0],
                            data = {
                                idE: model.idE,
                                infoE: model.infoE,
                                dataE: model.dataE,
                                typeE: model.typeE
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=set-exclusion',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data: data});
                                }
                            }
                        });                        
                    }, 
                    destroy: function(options) {
                        var model = options.data.models[0],
                            data = {
                                idE: model.idE,
                            };
                        $.ajax({
                            url: app.transitServerUrl + 'blacklist.php?method=del-exclusion',
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
                        id: "idE",
                        fields: {
                            typeE: {},
                            dateE: {},
                            infoE: {},
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