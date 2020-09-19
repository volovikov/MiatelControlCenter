/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @returns {AdminContentModule_L10.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-phone-all.html',
], function($, k, u, common, local, adminPhoneAll) {
    
    var adminPhoneAllTmpl = k.template(adminPhoneAll);
    
    var public = {        
        myModuleName: 'AdminContentPhoneAllModule',
        gridPageSize: 20,
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
            var html = adminPhoneAllTmpl({
                i18n: this.i18n
            });
            this.el.html(html);
            this.el.find('.combobox').kendoComboBox();
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });            
            private.renderCountryTable.call(this);
            private.renderStatistics.call(this);
        },
        renderCountryTable: function() {
            this.el.find('#phone-all').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{ 
                    field: 'countryName',
                    title: 'Название'
                },{
                    field: 'countryPhoneHave',
                    title: 'Кол-во номеров'                    
                },{ 
                    field: 'countryPhoneUse',
                    title: 'Используется'
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
                editable: false
            });                 
        },
        renderStatistics: function() {
            var that = this;
            
            this.el.find('#phone-all-statistic').kendoChart({
                title: {
                    position: "bottom",
                    text: "Занятость номеров"
                },
                //seriesColors: ['#9de219', '#90cc38', '#068c35', '#006634', '#004d38', '#033939'],
                seriesDefaults: {
                    type: "column"
                },
                series: [{
                    field: 'countryPhoneHave',
                    name: 'Кол-во номеров'
                },{
                    field: 'countryPhoneUse',
                    name: 'Используется'
                }],
                dataSource: private.getDataSource.call(that),
                categoryAxis: {
                    field: "countryName",
                    labels: {
                        rotation: -90
                    },
                    majorGridLines: {
                        visible: false
                    }
                },
                legend: {
                    position: "top"
                },
                chartArea: {
                    height: 400
                },                
                valueAxis: {
//                    labels: {
//                        format: "N0"
//                    },
                    line: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    //template: "N0"
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
                            url: app.getServerApiUrl() + 'get-phone-statistic-country',
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
                        return resp.data.statistic;
                    },
                    model: {
                        id: "id",
                        fields: {
                            id: { editable: false, nullable: true },
                            countryName: {},
                            countryPhoneHave: {},
                            countryPhoneUse: {},
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: app.getGridPageSize(),                
                serverPaging: true,
                serverSorting: true
            });              
        },                                
    };
    return public;
});