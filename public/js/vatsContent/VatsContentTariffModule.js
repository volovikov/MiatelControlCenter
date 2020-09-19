define([
    'jquery',
    'kendo',
    'util',    
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-tariff-form.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsTariffForm) {
    
    var vatsTariffFormTmpl = k.template(vatsTariffForm);
    
    var public = {        
        myModuleName: 'VatsContentTariffModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSaveBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.treeId
                });
                
            if (this.validator.validate()) {
                u.ajaxRequest('update-tariff', data, function(err, data) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('update-tariff', data);
                    }
                });                
            }
        },
        onClickDeleteBtn: function() {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    id: that.treeId
                };
            
            if (confirm(this.i18n.confirmDel)) {
                u.ajaxRequest('del-tariff', data, function(err, data) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('del-tariff', data.id);
                    }                    
                });
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
           
           $(document).off('click', '#tariff-form-submit-btn').on('click', '#tariff-form-submit-btn', function(e) {
               e.preventDefault();
               that.onClickSaveBtn.call(that);
           });
           $(document).off('click', '#tariff-form-del-btn').on('click', '#tariff-form-del-btn', function(e) {
               e.preventDefault();
               that.onClickDeleteBtn.call(that);
           });              
        },
        render: function() {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    id: this.treeId
                };
            
            u.ajaxRequest('get-tariff', data, function(err, data) {               
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    html = vatsTariffFormTmpl({
                        i18n: that.i18n,
                        data: data
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
                    that.validator = that.el.find('form').kendoValidator().data("kendoValidator");
                    private.renderCompanyTariffUseTable.call(that);
                }
                that.validator = that.el.find('form').kendoValidator().data("kendoValidator");
            });        
        },
        renderCompanyTariffUseTable: function() {
            var getDataSource = function() {
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
                                url: app.getServerApiUrl() + 'get-tariff-company-use-list',
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
                                        
                                        //resp.data.list = prefetch(resp.data.list);
                                        
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
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: { editable: false, nullable: true },
                                ownerName: {},
                                ownerFamily: {},
                                ownerSurname: {},
                                ownerEmail: {},
                                ownerPhone: {},
                                companyName: {},
                                companyForm: {},
                                companyAction: {},
                                companyWorkerCount: {},
                                tariffId: {},
                                tariffName: {}                         
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });              
            }; 
            this.el.find('#tariff-company-use-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'ownerName',    
                    title: 'Имя'
                },{ 
                    field: 'ownerFamily',
                    title: 'Фамилия'
                },{ 
                    field: 'ownerSurname',
                    title: 'Отчество'
                },{ 
                    field: 'ownerEmail',
                    title: 'E-mail'
                },{ 
                    field: 'ownerPhone',
                    title: 'Тел.',
                },{ 
                    field: 'companyName',
                    title: 'Компания',
                },{ 
                    field: 'companyForm',
                    title: 'Форма комп.'
                },{ 
                    field: 'companyAction',
                    title: 'Сфера'
                },{ 
                    field: 'companyWorkerCount',
                    title: 'Сотр-ов',
                },{ 
                    field: 'tariffName',
                    title: 'Тариф'
                }],                  
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                //toolbar: ["create"],
                editable: false
            });    
        }
    };
    return public;
});