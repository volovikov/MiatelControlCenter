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
    'text!./templates/admin-phone-country.html',
], function($, k, u, common, local, adminPhoneCountry) {
    
    var adminPhoneCountryTmpl = k.template(adminPhoneCountry);
    
    var public = {        
        myModuleName: 'AdminContentPhoneCountryModule',
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
            var html = adminPhoneCountryTmpl({
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
            this.el.find('#phone-country').kendoGrid({
                columns: [{
                    field: 'cityId',
                    title: 'id',
                    width: '40px'
                },{ 
                    field: 'cityName',
                    title: 'Название'
                },{
                    field: 'cityPhoneHave',
                    title: 'Кол-во номеров'                    
                },{ 
                    field: 'cityPhoneUse',
                    title: 'Используется'
                },{ 
                    field: 'prefix',
                    title: 'Префикс'
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
            
            this.el.find('#phone-country-chart').kendoChart({
                title: {
                    position: "bottom",
                    text: "Занятость номеров"
                },
                //seriesColors: ['#9de219', '#90cc38', '#068c35', '#006634', '#004d38', '#033939'],
                seriesDefaults: {
                    type: "column"
                },
                series: [{
                    field: 'cityPhoneHave',
                    name: 'Кол-во номеров'
                },{
                    field: 'cityPhoneUse',
                    name: 'Используется'
                }],
                dataSource: private.getDataSource.call(that),
                categoryAxis: {
                    field: "cityName",
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
                            url: app.getServerApiUrl() + 'get-phone-statistic-city',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(),
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
                            cityId: { editable: false, nullable: true },
                            cityName: {},
                            cityPhoneHave: {},
                            cityPhoneUse: {},
                            prefix: {},
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