define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-phone-mobile.html',
], function($, k, u, common, local, vatsPhoneMobile) {
    
    var vatsPhoneMobileTmpl = k.template(vatsPhoneMobile);
    
    var public = {
        myModuleName: 'VatsContentPhoneMobileModule',
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
            var html = vatsPhoneMobileTmpl({
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
            private.renderFedaralPhoneTable.call(this);
            //private.renderStatistics.call(this);
        },
        renderFedaralPhoneTable: function() {
            var that = this;
            
            this.el.find('#phone-mobile').kendoGrid({
                columns: [{
                    field: 'phoneId',
                    title: 'id',
                    width: '50px'
                },{ 
                    field: 'phone',
                    title: 'Телефон'
                },{ 
                    field: 'cost',
                    title: 'Цена'
                },{
                    field: 'companyOwnerId',
                    title: 'Владелец',
                    template: function(row) {
                        if (row.companyOwnerId !== null) {
                            return '<a href="/#section/vats/tree/company/company/' + row.companyOwnerId + '">Перейти</a>';
                        } else {
                            return '';
                        }                          
                    }
                },{
                    field: 'countryName',
                    title: 'Страна'
                },{
                    field: 'cityName',
                    title: 'Город'
                },{
                    field: 'type',
                    title: 'Тип'
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
                            url: app.getServerApiUrl() + 'phone/get-phone-list',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(),
                                skip: options.data.skip,
                                take: options.data.take,
                                sort: sort,
                                category: 'mobile'
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
                        return resp.data.list;
                    },
                    model: {
                        id: "phoneId"
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