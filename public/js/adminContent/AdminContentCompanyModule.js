/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminCompanyForm
 * @returns {AdminContentCompanyModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-company-form.html',
    'css!./css/adminContent'
], function($, k, u, common, local, adminCompanyForm) {
    
    var adminCompanyFormTmpl = k.template(adminCompanyForm);
    
    var public = {        
        myModuleName: 'AdminContentCompanyModule',
        userGlobalId: null, //<-- place info after load this module
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
                u.ajaxRequest('update-company', data, function(err, data) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('update-company', data);
                    }
                });                
            }
        },
        onClickDeleteBtn: function() {
            var that = this;
            
            if (confirm(this.i18n.confirmDel)) {
                $.ajax({
                    url: app.voiceipServerUrl + 'private.php?method=del-company&mccRootPassword=' + app.getMccRootPassword(),
                    type: 'post',
                    data: {
                        userGlobalId: that.userGlobalId
                    },
                    success: function(resp) {
                        try {
                            var r = JSON.parse(resp);
                            
                            if (r.success) {
                                app.publish('good', that.i18n.info.title, that.i18n.info.saveComplete);
                                app.publish('del-company', that.treeId);
                            } else {
                                app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                            }
                        } catch (e) {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                        }                        
                    }
                }); 
            }
        },
        onClickContractSignBtn: function(btn) {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    companyId: that.treeId
                });
                
            if (this.validator.validate()) {
                private.createPartner.call(that, function(partner) {
                    private.createPartnerContract.call(that, partner.partnerId, function() {
                        private.createCompanyBills.call(that, partner.partnerId, function() {
                            private.updateCompany.call(that, $.extend(data, {partnerId: partner.partnerId, contractStatus: 'signed'}), function() {
                                private.removeContractSignBtn.call(that);
                                private.setContractSign.call(that);
                                app.publish('update-company', $.extend(data, {
                                    contractStatus: 'signed'
                                }));                                        
                            });
                        });
                    });
                });
            }
        }        
    };
    var private = {
        bindEvents: function() {
            var that = this;

           $(document).off('click', '.user-form-submit-btn').on('click', '.user-form-submit-btn', function(e) {
               e.preventDefault();
               that.onClickSaveBtn.call(that);
           });
           $(document).off('click', '.user-form-del-btn').on('click', '.user-form-del-btn', function(e) {
               e.preventDefault();
               that.onClickDeleteBtn.call(that);
           }); 
           $(document).off('click', '.contract-sign-btn').on('click', '.contract-sign-btn', function(e) {
               e.preventDefault();
               that.onClickContractSignBtn.call(that, $(e));
           });
        },
        render: function() {
            var that = this,
                data = {
                    id: this.treeId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-company', data, function(err, data) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    if (!data.userNodeServerUrl) {
                        data.userNodeServerUrl = app.voiceipServerUrl;
                    } else {
                        data.userNodeServerUrl = data.userNodeServerUrl + '/api/';
                    }                    
                    if (data.esignFileUrl) {
                        data.esignFile = data.esignFileUrl;
                        data.esignFileUrl = data.userNodeServerUrl + 'private.php?method=get-contract-content&mccRootPassword=' + app.getMccRootPassword() + '&content=' + data.esignFileUrl + '&userGlobalId=' + data.userGlobalId;
                    }
                    data.ownerPhone = u.getMainPhoneFormatStr(data.ownerPhone);
                    that.userGlobalId = data.userGlobalId;
                    that.companyInfo = data;
                    
                    html = adminCompanyFormTmpl({
                        i18n: that.i18n,
                        user: data
                    });
                    that.el.html(html); 
       
                    var cb = that.el.find('#tariff-list').kendoComboBox({
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.wwwServerUrl + 'public.php?method=get-tariff-list',
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
                        dataTextField: 'name',
                        dataValueField: 'tariffId'                        
                    }).data('kendoComboBox');
                    
                    cb.value(data.tariffId);
                    
                    that.el.find('.combobox').kendoComboBox();
                    that.el.find('#ownerPhone').kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
                    that.tabStrip = that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });  
                    that.validator = that.el.find('form').kendoValidator({
                        rules: {
                            myRule: function(input) {
                                return private.isCompanyFormValid.call(that, input);
                            }
                        }
                    }).data("kendoValidator");                    
                    
                    private.renderInnerUsersTable.call(that);
                    private.renderAonListTable.call(that);
                    private.renderHistoryCallTable.call(that);
                    private.renderActionLogTable.call(that);
                    private.renderMessagesTable.call(that);
                    private.renderDocumentsTable.call(that);
                }
            });        
        },
        renderAonListTable: function() {
            var phoneNumberMaskedInput = function(container, options) {
                $('<input value="' + options.model.phone +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '7(000)9999999'
                    });
            };            
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
                                url: app.voiceipServerUrl + 'private.php?method=get-aon-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    userGlobalId: that.userGlobalId
                                },
                                success: function(resp) {
                                    var r;

                                    if (!resp || typeof resp == 'undefined') {
                                        options.error();
                                    } else {
                                        try {
                                            r = JSON.parse(resp);
                                            
                                            if (r.success) {
                                               options.success(r);
                                            } else {
                                               options.error();
                                            }
                                        } catch(e) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        }                                    
                                    }
                                }
                            });
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];
                            
                            if (rec.type || rec.countryName || rec.cityName) {
                                return false;
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=del-aon&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.userGlobalId,
                                    number: rec.phone
                                },
                                success: function(resp) {
                                    try {
                                        var r = JSON.parse(resp);
                                        
                                        if (r.success) {
                                            options.success(r);
                                            app.publish('del-aon', r.data);
                                        } else {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);    
                                        }
                                    } catch(e) {
                                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                    }
                                }
                            }); 
                        },   
                        update: function(options) {
                            return this.create(options);
                        },
                        create: function(options) {
                            var data = $.extend(options.data.models[0], {
                                userGlobalId: that.userGlobalId
                            });
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=add-aon&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    try {
                                        var r = JSON.parse(resp);

                                        if (r.success) {
                                            r.data.phone = u.getMainPhoneFormatStr(r.data.phone);
                                            options.success(r);
                                            app.publish('add-aon', r.data);
                                        } else {
                                            options.error();
                                        }
                                    } catch(e) {
                                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
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
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "phone",
                            fields: {                                
                                phone: {},
                                type: {editable: false},
                                cityName: {editable: false},
                                countryName: {editable: false},
                           }
                        },
                        // BB
                        // in future replace prefetch to schema->parse at all
                        //
                        parse: function(data) {
                            if ($.isArray(data)) {
                                for (var i in data) {
                                    var el = data[i];
                                    el.phone = u.getMainPhoneFormatStr(el.phone);
                                }
                            } else {
                                data.phone = u.getMainPhoneFormatStr(data.phone);
                            }
                            return data;                            
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                               
            };     
            this.el.find('#aon-list').kendoGrid({
                columns: [{
                    field: 'phone',    
                    title: 'Номер',
                    editor: phoneNumberMaskedInput,
                    width: '25%'
                },{ 
                    field: 'type',
                    title: 'Тип'
                },{ 
                    field: 'countryName',
                    title: 'Страна'
                },{ 
                    field: 'cityName',
                    title: 'Город',
                },{
                    title: '&nbsp;',
                    width: '110px',
                    template: function(r) {
                        if (!r.type && !r.cityName && !r.countryName) {
                            return '<a class="k-button k-button-icontext k-grid-delete" href="javascript:;"><span class="k-icon k-delete"></span>Delete</a>';
                        } else {
                            return '';
                        }
                    }
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
                toolbar: ["create"],
                editable: true
            });           
        },
        renderInnerUsersTable: function() {
            var prefetch = function(data) {
                if ($.isArray(data)) {
                    for (var i in data) {
                        var el = data[i];
                        el.phoneAon = u.getMainPhoneFormatStr(el.phoneAon);
                        el.userMobilePhone = u.getMainPhoneFormatStr(el.userMobilePhone);
                        el.userRomingNumber = u.getMainPhoneFormatStr(el.userRomingNumber);
                    }
                } else {
                    data.phoneAon = u.getMainPhoneFormatStr(data.phoneAon);
                    data.userMobilePhone = u.getMainPhoneFormatStr(data.userMobilePhone);
                    data.userRomingNumber = u.getMainPhoneFormatStr(data.userRomingNumber);
                }
                return data;
            };
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
                                url: app.getServerApiUrl() + 'get-inner-user-list',
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
                                        resp.data.list = prefetch(resp.data.list);
                                        options.success(resp);
                                    } else {
                                        options.error();
                                    }
                                }
                            });
                        },
                        update: function(options)  {
                            var v = options.data.models[0];

                            v.userMobilePhone = u.getServerPhoneFormatStr(v.userMobilePhone);
                            v.userRomingNumber = u.getServerPhoneFormatStr(v.userRomingNumber);
                            v.phoneAon = u.getServerPhoneFormatStr(v.phoneAon);

                            $.ajax({
                                url: app.getServerApiUrl() + 'update-inner-user',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                                success: function(resp) {
                                    if (resp.success) {
                                        resp.data = private.prefetch(resp.data);
                                        options.success(resp);
                                        app.publish('update-inner-user', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            // BB
                            // not work!
                            
                            return;                             
                        },
                        create: function(options) {
                            var workBegin = options.data.models[0].workBegin,
                                workEnd = options.data.models[0].workEnd;

                            options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                            options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);

                            $.ajax({
                                url: app.getServerApiUrl() + 'add-task',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash(), parentTaskId: that.taskId}),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('add-task', resp.data);
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
                                userFullName: {},
                                innerPhoneNumber: {},
                                userEmail: {},
                                userMobilePhone: {},
                                userRomingNumber: {},
                                phoneAon: {},
                                phoneAonList: {},
                                phoneCallUpTime: {},
                                phoneRedirect: {},
                                phoneTalkRec: {}                            
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
            var redirectDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Вкл',
                            value: 'on'
                        },{
                            text: 'Выкл',
                            value: 'off'
                        }]
                    });
            };      
            var phoneTalkRecDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Вкл',
                            value: 'on'
                        },{
                            text: 'Выкл',
                            value: 'off'
                        }]
                    });
            };
            var phoneCallUpTimeDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: '5 сек',
                            value: '5'
                        },{
                            text: '10 сек',
                            value: '10'
                        },{
                            text: '30 сек',    
                            value: '30'
                        },{
                            text: '1 мин',
                            value: '60'
                        },{
                            text: '2 мин',
                            value: '120'
                        },{
                            tex: '5 мин',
                            value: '300'
                        }]
                    });
            };
            var phoneAonDropDownEditor = function(container, options) {
                var aon = options.model.phoneAon,
                    list = options.model.phoneAonList.split(','),
                    arr = [];

                for (var i in list) {
                    var p = list[i];

                    arr.push({
                        value: u.getMainPhoneFormatStr(p)
                    });
                }    
                var cb = $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: arr
                    }).data('kendoDropDownList');

                cb.value({value: aon});
            };
            var userRomingNumberMaskedInput = function(container, options) {
                $('<input value="' + options.model.userRomingNumber +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
            };
            var userMobilePhoneMaskedInput = function(container, options) {
                $('<input value="' + options.model.userMobilePhone +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
            };            
            this.el.find('#inner-users-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'userFullName',    
                    title: 'Имя',
                    width: '25%'
                },{ 
                    field: 'innerPhoneNumber',
                    title: 'Вн.номер'
                },{ 
                    field: 'userEmail',
                    title: 'E-mail'
                },{ 
                    field: 'userMobilePhone',
                    title: 'Моб.телефон',
                    editor: userMobilePhoneMaskedInput
                },{ 
                    field: 'userRomingNumber',
                    title: 'Номер в роуменге',
                    editor: userRomingNumberMaskedInput
                },{ 
                    field: 'phoneAon',
                    title: 'АОН' ,
                    width: '120px',
                    editor: phoneAonDropDownEditor
                },{ 
                    field: 'phoneCallUpTime',
                    title: 'Вр.дозвона',
                    editor: phoneCallUpTimeDropDownEditor
                },{ 
                    field: 'phoneRedirect',
                    title: 'Переадресация',
                    editor: redirectDropDownEditor,  
                    template: function(row) {
                        if (row.phoneRedirect == 'on') {
                            return "Включен";
                        } else if (row.phoneRedirect == 'off') {
                            return "Выключен";
                        }
                    }                                        
                },{ 
                    field: 'phoneTalkRec',
                    title: 'Запись раз-ра',
                    editor: phoneTalkRecDropDownEditor,  
                    template: function(row) {
                        if (row.phoneTalkRec == 'on') {
                            return "Включен";
                        } else if (row.phoneTalkRec == 'off') {
                            return "Выключен";
                        }
                    }                     
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
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
        },
        renderHistoryCallTable: function() {
            var that = this;
            
            var getDataSource = function() {
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
                                url: app.voiceipServerUrl + 'private.php?method=get-calls-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    userGlobalId: that.userGlobalId,
                                    callType: 'all'
                                },
                                success: function(resp) {
                                    var r;

                                    if (!resp || typeof resp == 'undefined') {
                                        options.error();
                                    } else {
                                        try {
                                            r = JSON.parse(resp);

                                            if (r.success) {
                                               options.success(r);
                                            } else {
                                               options.error(r.errors);
                                               app.showPopupErrors(r.errors);
                                            }
                                        } catch(e) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        }
                                    }                                    
                                }
                            });
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
                                recId: { editable: false, nullable: true },
                                time: {},
                                src: {},
                                dst: {},
                                who: {},
                                duration: {},
                                answerStatus: {},
                                callType: {},
                                file: {}
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
            this.el.find('#history-call-list').kendoGrid({
                columns: [{
                    field: 'recId',
                    title: '№',
                    width: '40px'
                },{
                    field: 'time',    
                    title: 'Время'
                },{ 
                    field: 'src',
                    title: 'Откуда'
                },{ 
                    field: 'dst',
                    title: 'Куда'
                },{ 
                    field: 'who',
                    title: 'Кто',
                },{ 
                    field: 'duration',
                    title: 'Длительность',
                },{ 
                    field: 'file',
                    title: 'Запись',
                    templat: function(row) {
                        return row.file;
                    }
                }],                
                dataSource: getDataSource(),
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
        renderActionLogTable: function() {
            var that = this;
            
            var getDataSource = function() {
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
                                url: app.voiceipServerUrl + 'private.php?method=get-company-actions&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.userGlobalId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
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
                                date: {},
                                companyId: {},
                                companyName: {},
                                request: {},
                                response: {},
                                method: {},
                                typeMethod: {},
                                ipAddress: {}
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
            this.el.find('#action-log-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px'
                },{
                    field: 'date',    
                    title: 'data'
                },{ 
                    field: 'request',
                    title: 'request',
                    width: '30%'
                },{ 
                    field: 'response',
                    title: 'response',
                    width: '30%',
                },{
                    field: 'method',
                    title: 'method',                    
                },{
                    field: 'typeMethod',
                    title: 'typeMethod',                    
                },{
                    field: 'ipAddress',
                    title: 'ipAddress',                    
                }],                
                dataSource: getDataSource(),
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
        renderMessagesTable: function() {
            var that = this;
            
            var dateTimeEditor= function(container, options) {
                $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                    .appendTo(container)
                    .kendoDateTimePicker({});
            };
            var messageTargetTemplate = function(row) {
                var arr = row.messageTarget || [],
                    html = [];

                if (arr && arr.forEach) {
                    arr.forEach(function(el) {
                        html.push(el.companyName);
                    });
                }
                return html.join(',');
            };
            var messageReadTemplate = function(row) {
                var arr = row.messageRead || [],
                    html = [];

                if (!arr) {
                    return '';
                } else if (arr.forEach) {
                    arr.forEach(function(el) {
                        html.push(el.userName);
                    });                    
                } else {
                    $.each(arr, function(el) {
                        html.push(el.userName);
                    });
                }
                return html.join(',');                
            };
            var messageReadDropDownEditor = function(container, options) {
                var company = that.companyInfo,
                    userName = company.ownerFamily + ' ' + company.ownerName + ' ' + company.ownerSurname;

                $('<input data-text-field="userName" data-value-field="id" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        dataValueField: 'id',
                        dataTextField: 'userName',
                        dataSource: [
                            {id: company.id, userName: userName} 
                        ]
                    });               
            };            
            var messageTargetDropDownEditor = function(container, options) {
                $('<input data-text-field="companyName" data-value-field="id" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        dataValueField: 'id',
                        dataTextField: 'companyName',
                        multiple: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.serverUrl + 'api/get-company-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(r) {
                                            if (r.success) {
                                                options.success(r.data.list);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        }                            
                    });
            };            
            var messageAuthorDropDownEditor = function(container, options) {
                $('<input required data-text-field="name" data-value-field="id" data-bind="value:messageAuthorId"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.serverUrl + 'api/get-mcc-user-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(r) {
                                            if (r.success) {
                                                options.success(r.data.list);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        }                            
                    });
            };              
            var messageTypeDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Информационные',
                            value: 'info'
                        },{
                            text: 'Важные',
                            value: 'alert'
                        },{
                            text: 'Критические',    
                            value: 'crytical'
                        }]
                    });
            };            
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
                                url: app.voiceipServerUrl + 'messages.php?method=get-message-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    messageTargetId: that.treeId
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       app.showPopupErrors(r.errors);
                                       options.error();
                                    }
                                }
                            });
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0],
                                data = {
                                    messageId: rec.id,
                                };
                            
                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=del-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        options.success({data: data});
                                        app.publish('del-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
                                        options.error();
                                    }
                                }
                            }); 
                        },   
                        update: function(options) {
                            
                            var data = $.extend(options.data.models[0], {
                                //
                            });                    
                            if (data.messageTarget[0].id == 0) {
                                return; // for all messages not editind
                            }
                            data.messageDate = u.getTimeFormatStr(data.messageDate);

                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=update-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    
                                    if (r.success) {
                                        options.success({data: data});
                                        app.publish('update-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
                                        options.error();
                                    }
                                }
                            });                            
                        },
                        create: function(options) {
                            var data = $.extend(options.data.models[0], {
                                messageAuthorId: app.getActiveUser().id,
                                messageTarget: [{
                                    id: that.companyInfo.id,
                                    companyName: that.companyInfo.companyName
                                }],
                                messageAuthorName: app.getActiveUser().name
                            });
                            data.messageDate = u.getTimeFormatStr(data.messageDate);
                            
                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=add-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    
                                    if (r.success) {
                                        data.id = r.data.id;
                                        options.success({data: data});
                                        app.publish('add-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
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
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {                            
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: 'id',
                            fields: {
                                messageType: {defaultValue: 'info'},
                                messageDate: {defaultValue: u.getCurrentDateTime()},
                                messageAuthorId: {},
                                messageAuthorName: {},
                                messageTarget: {editable: false},
                                messageShort: {},
                                messageFull: {},
                                messageReadId: {},
                                messageReadName: {},
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
            this.el.find('#messages-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'messageType',
                    title: 'Тип',
                    editor: messageTypeDropDownEditor,
                    template: function(row) {
                        return that.i18n.adminContent.msgType[row.messageType] || that.i18n.adminContent.msgType['info'];
                    }
                },{ 
                    field: 'messageDate',
                    title: 'Дата',
                    format: '{0:yyyy-MM-dd HH:mm}',
                    editor: dateTimeEditor
                },{
                    field: 'messageAuthor',
                    title: 'Автор',
                    sortable: false,
                    editor: messageAuthorDropDownEditor,
                    template: function(row) {
                        return row.messageAuthorName
                    }
                },{
                    field: 'messageShort',
                    title: 'Вступление'
                },{
                    field: 'messageFull',
                    title: 'Сообщение'
                },{
                    field: 'messageTarget',
                    title: 'Предназначено',
                    editor: messageTargetDropDownEditor,
                    template: messageTargetTemplate,
                    sortable: false
                },{
                    field: 'messageRead',
                    title: 'Прочитано',
                    template: messageReadTemplate,
                    editor: messageReadDropDownEditor,
                    sortable: false
                },{
                    title: '&nbsp;',
                    width: '110px',
                    template: function(r) {
                        return '<a class="k-button k-button-icontext k-grid-delete" href="javascript:;"><span class="k-icon k-delete"></span>Delete</a>';
                    }
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            });             
        },
        renderDocumentsTable: function() {
            var that = this;
            
            var dateTimeEditor= function(container, options) {
                $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                    .appendTo(container)
                    .kendoDateTimePicker({});
            };
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
                                url: app.voiceipServerUrl + 'documents.php?method=get-document-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.userGlobalId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       app.showPopupErrors(r.errors);
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
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {                            
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: 'id',
                            fields: {
                                num: {editable: false},
                                date: {editable: false, defaultValue: u.getCurrentDateTime()},
                                signed: {editable: false},
                                type: {editable: false},
                                url: {editable: false},
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
            this.el.find('#documents-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'num',
                    title: 'Номер'
                },{ 
                    field: 'date',
                    title: 'Дата',
                    format: '{0:yyyy-MM-dd HH:mm}'
                },{
                    field: 'signed',
                    title: 'Подписано'
                },{
                    field: 'type',
                    title: 'Тип'
                },{
                    field: 'url',
                    title: 'Файл',
                    template: function(r) {
                        return '<a href="' + r.url + ' ">Скачать</a>'
                    }                    
                },{
                    title: '&nbsp;',
                    width: '110px',
                    template: function(r) {
                        return '<a class="k-button k-button-icontext k-grid-delete" href="javascript:;"><span class="k-icon k-delete"></span>Delete</a>';
                    }
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
                editable: true
            });             
        },        
        isCompanyFormValid: function(input) {
            var tab = $('#user-form-tabstrip').find('.k-state-active'),
                control = tab.attr('aria-controls');
            
            if (control != 'user-form-tabstrip-3') {
                return true;
            } else if (input.is("[name=uniqFinanceId]")) {
                return input.val() == '' ? false : true;
            } else {
                return true;
            }
        },
        removeContractSignBtn: function() {
            this.el.find('.contract-sign-btn').remove();
        },
        createPartner: function(callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'proxy.php?method=create-partner&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.adminContent.createPartnerFine);
                        callback(r.data);
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });            
        },
        createPartnerContract: function(partnerId, callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'proxy.php?method=create-partner-contract&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId,
                    partnerId: partnerId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.adminContent.createPartnerContractFine);
                        callback(r.data);
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });             
        },
        createCompanyBills: function(partnerId, callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'bills.php?method=create-company-bills-auto&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId,
                    partnerId: partnerId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.adminContent.billsMakeFine);
                        callback();
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });             
        },
        updateCompany: function(info, callback) {
            var that = this;
            
            u.ajaxRequest('update-company', info, function(err) {
                if (!err) {
                    callback();
                } else {
                    app.showPopupMessage('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });
        },
        setContractSign: function(callback) {
            var that = this,
                data = {
                    userGlobalId: this.userGlobalId,
                    contractNumber: this.companyInfo.contractNumber,
                    signed: 1
                };
            
            $.ajax({
                url: app.voiceipServerUrl + 'documents.php?method=update-contract&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                type: 'post',
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        
                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        }
    };
    return public;
});