define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-.html',
    'css!./css/transitContent'
], function($, k, u, common, local, tmpl) {
    
    var _Tmpl = k.template(tmpl);
    
    var public = {
        myModuleName: 'TransitModule',
        gridPageSize: 20,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);  
            this.id = this.treeId.split('-')[1];
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
            
            html = _Tmpl({
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
            this.el.find('#pull-usage').kendoGrid({
                columns: [{
                    field: 'pullName',    
                    title: 'Пулл'
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
                }
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
                            url: app.transitServerUrl + 'whitelist.php?method=get-white-list',
                            type: 'post',
                            data: {
                                sort: sort,
                                skip: options.data.skip,
                                take: options.data.take,                                
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
                        id: "chimeId",
                        fields: {
                            number: {},
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,                
                serverPaging: true,
                serverSorting: true
            });                 
        }
    };
    return public;
});