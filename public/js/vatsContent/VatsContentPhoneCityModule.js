define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-phone-city.html',
], function($, k, u, common, local, vatsPhoneCity) {
    
    var vatsPhoneCityTmpl = k.template(vatsPhoneCity);
    
    var public = {        
        myModuleName: 'VatsContentPhoneCityModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.cityId = params.treeId.split('-')[1];
            this.countryId = params.treeId.split('-')[0];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSaveBtn: function(btn) {
            var that = this,
                formEl = btn.closest('form'),
                formValue = u.getFormValue(formEl);

            private.updateCityInfo.call(this, formValue, function(err) {
                if (!err) {
                    app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    app.publish('update-city', formValue);
                }
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off().on('click', '.city-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSaveBtn.call(that, $(this));
            });
        },
        render: function() {
            var that = this;
            
            private.getCityInfo.call(that, function(err, data) {
                if (!err) {
                    var html = vatsPhoneCityTmpl({
                        i18n: that.i18n,
                        data: data
                    });
                    that.el.html(html);
                    that.el.find('input[name="countryId"]').kendoComboBox({
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.wwwServerUrl + 'public.php?method=get-country-list',
                                        type: 'post',
                                        success: function(resp) {
                                            var r = JSON.parse(resp);

                                            if (r.success) {
                                                options.success(r.data.list);
                                            }
                                        }
                                    }); 
                                }
                            }
                        },          
                        suggest: true, //<-- into template value already set
                        dataTextField: 'countryName',
                        dataValueField: 'countryId'                        
                    });
                    that.el.find('input[name="phoneType"]').kendoComboBox({
                        dataSource: [{
                            key: 'city',
                            value: 'Городские'
                        },{
                            key: 'federal',
                            value: '8800'                            
                        },{
                            key: 'mobile',
                            value: 'Мобильные'
                        }],
                        suggest: true, 
                        dataTextField: 'value',
                        dataValueField: 'key'                                                
                    });    
                    that.el.find('input[name="phoneDisplayFormat"]').kendoComboBox({
                        dataSource: [{
                            key: 'normal',
                            value: '7(XXX)XXX-XX-XX'
                        },{
                            key: 'advance',
                            value: '7(XXXX)XX-XX-XX'                            
                        }],
                        suggest: true, 
                        dataTextField: 'value',
                        dataValueField: 'key'                                                
                    });                        
                    that.el.find('input[name="range"]').kendoNumericTextBox();
                    that.el.find('.combobox').kendoComboBox();
                    that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });
                    private.renderTable.call(that);
                    private.renderStatistics.call(that);
                }
            });
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
                pageable: false,
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
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
                    type: "column",
                    overlay: {
                        gradient: "none"
                    }
                },
                series: [{
                    field: 'goldPhoneTypeCount',
                    name: 'Золотые',                    
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
                            url: app.getServerApiUrl() + 'phone/get-phone-statistic-city-type',
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
        getCityInfo: function(callback) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    cityId: this.cityId
                };
            
            u.ajaxRequest('phone/get-city', data, function(err, resp) {
                if (!err) {
                    callback && callback(false, resp);
                } else {
                    app.showPopupErrors(resp);
                }
            });
        },
        updateCityInfo: function(data, callback) {
            var that = this,
                data = $.extend(data, {
                    userHash: app.getActiveUserHash(),
                    cityId: this.cityId
                });
                
            u.ajaxRequest('phone/update-city', data, function(err, resp) {
                if (!err) {
                    callback && callback(false, resp);
                } else {
                    app.showPopupErrors(resp);
                }
            });                
        }
    };
    return public;
});