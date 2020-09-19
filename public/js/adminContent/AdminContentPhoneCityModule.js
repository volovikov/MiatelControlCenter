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
    'text!./templates/admin-phone-city.html',
], function($, k, u, common, local, adminPhoneCity) {
    
    var adminPhoneCityTmpl = k.template(adminPhoneCity);
    
    var public = {        
        myModuleName: 'AdminContentPhoneCityModule',
        gridPageSize: 20,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.cityId = params.treeId.split('-')[1];
            this.countryId = params.treeId.split('-')[0];
            private.bindEvents.call(this);
            private.render.call(this); 
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

        },
        render: function() {
            var html = adminPhoneCityTmpl({
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
            private.renderTable.call(this);
            private.renderStatistics.call(this);
        },
        renderTable: function() {
            this.el.find('#phone-city').kendoGrid({
                columns: [{ 
                    field: 'goldPhoneTypeCount',
                    title: 'Золотые'
                },{
                    field: 'silverPhoneTypeCount',
                    title: 'Серебрянные'                    
                },{ 
                    field: 'otherPhoneTypeCount',
                    title: 'Простые'
                },{ 
                    field: 'bronzaPhoneTypeCount',
                    title: 'Бронзовые'                    
                },{
                    field: 'privatePhoneTypeCount',
                    title: 'Private'                    
                },{
                    field: 'offlinePhoneTypeCount',
                    title: 'Offline'                    
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
            
            this.el.find('#phone-city-chart').kendoChart({
                title: {
                    position: "bottom",
                    text: "Распределение номеров"
                },
                //seriesColors: ['#9de219', '#90cc38', '#068c35', '#006634', '#004d38', '#033939'],
                seriesDefaults: {
                    type: "column"
                },
                series: [{
                    field: 'goldPhoneTypeCount',
                    name: 'Золотые'
                },{
                    field: 'goldPhoneTypeCount',
                    name: 'Серебрянные'
                },{ 
                    field: 'bronzaPhoneTypeCount',
                    title: 'Бронзовые'                    
                },{
                    field: 'otherPhoneTypeCount',
                    name: 'Простые'
                },{
                    field: 'privatePhoneTypeCount',
                    name: 'Private'                    
                },{
                    field: 'offlinePhoneTypeCount',
                    name: 'Offline'
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
                        $.ajax({
                            url: app.getServerApiUrl() + 'get-phone-statistic-city-type',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(),
                                cityId: that.cityId,
                                countryId: that.countryId
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
                            bronzaPhoneTypeCount: {},
                            goldPhoneTypeCount: {},
                            silverPhoneTypeCount: {},
                            otherPhoneTypeCount: {}
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