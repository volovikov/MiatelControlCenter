define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-aon-prefix.html',
    'css!./css/transitContent'
], function($, k, u, common, local, aonPrefix) {
    
    var aonPrefixTmpl = k.template(aonPrefix);
    
    var public = {
        myModuleName: 'TransitAonPrefixModule',
        gridPageSize: 20,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.id=this.treeId.split('-')[1];
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
            html = aonPrefixTmpl({
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
            private.renderServersTable.call(this);            
        },
        renderServersTable: function() {
            this.el.find('#aon-prefix').kendoGrid({
                filterable: {
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
                    field: 'prefixId',    
                    title: '№',
                    sortable: false,
                    width: '50px',
                    filterable:false
                  },{
                    field: 'prefix',
                    title: 'Префикс'
                  },{
                    field: 'info',
                    title: 'Ремарка',
                    sortable: false
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
                editable: true,
                toolbar: ["create"]
            });              
        },
        getDataSource: function() {
            var that = this; 

            return new kendo.data.DataSource({
                transport: {
                    read: function(options) {
                        $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=get-prefix',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip: options.data.skip,
                                take: options.data.take,
                                filter: options.data.filter,                                
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
                    create: function(options){
                      var model=options.data.models[0],
                          data={
                            prefixId:model.prefixId,
                            prefix:model.prefix,
                            info:model.info
                          };
                      $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=add-prefix',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    data.prefixId=r.data.prefixId;
                                    options.success({data:data});
                                    app.publish('add-prefix',data);
                                }
                            }
                      });
                    },
                    destroy: function(options){
                      var model=options.data.models[0],
                          data={
                            prefixId:model.prefixId
                          };
                      $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=del-prefix',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data:data});
                                    data.prefixId=r.data.prefixId;
                                    app.publish('del-prefix',data);
                                }
                            }
                      });
                    },
                    update: function(options){
                      var model=options.data.models[0],
                          data={
                            prefixId:model.prefixId,
                            prefix:model.prefix,
                            info:model.info || ''
                          };
                      $.ajax({
                            url: app.transitServerUrl + 'aon.php?method=set-prefix',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success({data:data});
                                    data.prefixId=r.data.prefixId;
                                    app.publish('update-prefix',data);
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
                        id: "prefixId",
                        fields: {
                            prefixId: {editable:false,nullable:true},
                            prefix: {},
                            info: {}
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,                
                serverPaging: true,
                serverSorting: true,
                serverFiltering:true
            });                 
        }
    };
    return public;
});
