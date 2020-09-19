define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/transit-sf-aon-cdr.html',
    'css!./css/wholesaleContent'
], function($, k, u, common, local, statisticPage) {

    var cdrListPageTmpl = k.template(statisticPage);

    var public = {
        myModuleName: 'TransitSfAonCdrModule',
        gridPageSize: 20,
        defaultPeriod: {
            dateBegin: null,
            timeBegin: null,
            dateEnd: null,
            timeEnd: null
        },
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
                        var html = cdrListPageTmpl({
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
                        private.renderPage.call(that);
        },

        renderPage: function(data) {
            var that = this;
            var dataBound=function(e){
              var grid=$('#sf-aon-cdr').data("kendoGrid");
              for(var i=0;i<grid.columns.length;i++){
                grid.autoFitColumn(i);
              }
            };
            this.el.find('#sf-aon-cdr').kendoGrid({
                dataSource: private.getDataSource.call(this),
                columns: [{
                    field: 'cdrId',
                    title: 'CDR ID',
                    sortable: false
                },{
                    field: 'srcInput',    
                    title: 'SRC на входе',
                },{
                    field: 'srcOut',
                    title: 'SRC на выходе',
                },{
                    field: 'dst',
                    title: 'DST',
                },{
                    field: 'date',
                    title: 'Дата',
                },{
                    field: 'ipaddr',
                    title: 'IP addr',
                },{
                    field: 'clientId',
                    title: 'Клиент ID',
                },{
                    field: 'code',
                    title: 'Статус'
                }],
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                scrollable: true,
                resizable: true,
                dataBound: dataBound
              });
        },
        getDataSource: function() {
            var that = this; 

            return new kendo.data.DataSource({
                sort:[{
                  field: 'date',
                  dir: 'desc'}],
                transport: {
                    read: function(options) {
                        $.ajax({
                            url: app.transitServerUrl + 'sf_aon.php?method=get-cdr',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip: options.data.skip,
                                take: options.data.take,
                                filter: options.data.filter,
                                user:app.getActiveUser()
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
                        id: "cdrId",
                        fields: {
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
