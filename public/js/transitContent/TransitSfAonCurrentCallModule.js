define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-sf-aon-current-call.html',
    'css!./css/transitContent'
], function($, k, u, common, local, statisticPage) {

    var cdrListPageTmpl = k.template(statisticPage);

    var public = {
        myModuleName: 'TransitSfAonCurrentCallModule',
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
              var grid=$('#current-call').data("kendoGrid");
              for(var i=0;i<grid.columns.length;i++){
                grid.autoFitColumn(i);
              }
            };
            this.el.find('#current-call').kendoGrid({
                dataSource: private.getDataSource.call(this),
                sort: {
                    field: "date",
                    dir: "desc"
                },
                columns: [{
                    field: 'dlg_Id',
                    title: 'Dialog ID',
                    sortable: false
                },{
                    field: 'from_uri',    
                    title: 'SRC на входе',
                },{
                    field: 'mangled_from_uri',
                    title: 'SRC на выходе',
                },{
                    field: 'mangled_to_uri',
                    title: 'DST',
                },{
                    field: 'date',
                    title: 'Дата'
                  },{
                    field: 'duration',
                    title: 'длительность (сек.)'
                  },{
                    field: 'zoneName',
                    title:'Зона'
                    }],
                pageable: {
                    refresh: true,
                    pageSizes: [5, 20, 100, 200, 500],
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                scrollable: true,
                resizable: true,
                //dataBound: dataBound,
              });
        },
        getDataSource: function() {
            var that = this; 

            return new kendo.data.DataSource({
                transport: {
                    read: function(options) {
                        $.ajax({
                            url: app.transitServerUrl + 'sf_aon.php?method=get-current-call',
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
                        id: "callId",
                        fields: {
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: 100,                
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true
            });
        }                
    };
    return public;
});
