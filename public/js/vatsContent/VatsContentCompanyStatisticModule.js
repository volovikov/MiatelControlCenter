define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-company-statistic.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsCompanyStatistic) {

    var vatsCompanyStatisticTmpl = k.template(vatsCompanyStatistic);

    var commonMessageObj = {
        id: 0,
        companyName: 'Для всех'
    };
    var public = {
        grid: null,
        myModuleName: 'VatsContentCompanyStatisticModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);          
                
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickRequestBtn: function(btn) {
            var that = this,
                recId = btn.attr('data-rec-id'),
                data = {
                    recId: recId
                };
            
            if (!recId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-company-action-detail&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        private.showProtocolDetails.call(that, r.data.request);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            });            
        },
        onClickResponseBtn: function(btn) {
            var that = this,
                recId = btn.attr('data-rec-id'),
                data = {
                    recId: recId
                };
            
            if (!recId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-company-action-detail&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        private.showProtocolDetails.call(that, r.data.response);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            }); 
        },         
    };
    var private = {
        bindEvents: function() {
            var that = this;
          
            $(document).off('click', '.request-detail-btn').on('click', '.request-detail-btn', function(e) {
                that.onClickRequestBtn.call(that, $(this));
            });
            $(document).off('click', '.response-detail-btn').on('click', '.response-detail-btn', function(e) {
                that.onClickResponseBtn.call(that, $(this));
            });            
        },
        render: function() {
            var that = this;
            
            html = vatsCompanyStatisticTmpl({
                i18n: that.i18n
            });
            that.el.html(html);
            that.wnd = this.el.find("#protocol-details")
                .kendoWindow({
                    title: "Details",
                    modal: true,
                    visible: false,
                    resizable: true,
                    width: 700,
                    maxHeight: "90vh"
                }).data("kendoWindow");
            that.el.find('.combobox').kendoComboBox();
            that.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            }); 
            private.renderCompanyTable.call(this);
            private.renderCompanyAction.call(this);
            private.renderStatistics.call(this);
            private.renderMessagesTable.call(this);
        },        
        renderStatistics: function() {
            
        },
        renderCompanyAction: function() {
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
                                url: app.voiceipServerUrl + 'private.php?method=get-company-action-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    filter: options.data.filter,
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
                    serverFiltering: true,
                    serverPaging: true,
                    serverSorting: true
                });              
            };     
            this.grid = this.el.find('#company-action').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px',
                    filterable: false
                },{
                    field: 'companyName',
                    title: 'companyName'
                },{
                    field: 'date',    
                    title: 'data',
                    filterable: false
                },{
                    title: 'request',
                    template: function(row) {
                        return '<button data-rec-id="' + row.id + '" class="k-button request-detail-btn">Показать</button>'
                    },                    
                    width: "180px"
                },{
                    title: 'response',
                    template: function(row) {
                        return '<button data-rec-id="' + row.id + '" class="k-button response-detail-btn">Показать</button>'
                    },
                    width: "180px"
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
                filterable: {
                    extra: false,
                    operators: {
                        string:{
                            like: "Начинается с",
                            eq: "Равно",
                            neq: "Не равно"
                        }
                    }
                },
                editable: false
            }).data('kendoGrid');            
        },
        renderCompanyTable: function() {
            var that = this; 

            var selectCompanyFormColumnFilter = function(el) {
                el.kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [{
                        text: 'Открытое Акционерное Общество (ОАО)',
                        value: 'oao'
                    },{
                        text: 'Закрытое Акционерное Общество (ЗАО)',
                        value: 'zao'
                    },{
                        text: 'Публичное Акционерное Общество (ПАО)',
                        value: 'pao'
                    },{
                        text: 'Акционерное Общество (АО)',
                        value: 'ao'
                    },{
                        text: 'Открытое Акционерное Общество (ОАО)',
                        value: 'ooo'
                    },{
                        text: 'Другая',
                        value: 'other'
                    }]
                });
            };
            var selectCompanyVersionColumnFilter = function(el) {
                el.kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [{
                        text: 'Юридические лица',
                        value: 'ur'
                    },{
                        text: 'Физические лица',
                        value: 'fiz'
                    },{
                        text: 'Идивидуальный предприниматель',
                        value: 'ip'
                    }]
                });
            };
            var selectContractColumnFilter = function(el) {
                el.kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [{
                        text: 'Не подписан',
                        value: 'free'
                    },{
                        text: 'На проверке',
                        value: 'inprogress'
                    },{
                        text: 'Проверен',
                        value: 'checked'
                    },{
                        text: 'Подписан',
                        value:'signed'
                    }]
                });
            };
            var selectTariffColumnFilter = function(el) {
                el.kendoDropDownList({
                    dataSource: {
                        transport: {
                            read: function(options) {
                                $.ajax({
                                    url: app.getServerApiUrl() + 'get-tariff-list',
                                    data: {
                                        userHash: app.getActiveUserHash(),                                                                                
                                    },
                                    type: 'post',
                                    success: function(resp) {
                                        if (!resp || typeof resp == undefined) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        } else if (!resp.success) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        } else {
                                            var arr = [];
                                            
                                            for (var i in resp.data.list) {
                                                arr.push(resp.data.list[i].name);
                                            }
                                            options.success(arr);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            };
            var userMobilePhoneMaskedInput = function(container, options) {
                $('<input value="' + options.model.ownerPhone +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '99999999999'
                    });
            };  
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
                                url: app.getServerApiUrl() + 'get-company-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    id: that.treeId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    filter: options.data.filter,
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
                        update: function(options)  {
                            var v = options.data.models[0];
                            v.ownerPhone = u.getServerPhoneFormatStr(v.ownerPhone);

                            $.ajax({
                                url: app.getServerApiUrl() + 'update-company',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                                success: function(resp) {
                                    if (resp.success) {
                                        resp.data = private.prefetch(resp.data);
                                        options.success(resp);
                                        app.publish('update-company', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];

                                   // some
                        },
                        create: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'add-company',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
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
                                ownerName: {},
                                ownerFamily: {},
                                ownerSurname: {},
                                ownerEmail: {},
                                ownerPhone: {},
                                companyName: {},
                                companyForm: {},
                                companyAction: {},
                                companyWorkerCount: {},
                                tariffId: {editable: false},
                                tariffName: {}
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                });
            };                        
            this.el.find('#company-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px',
                    template: function(row) {
                        return '<a href="/#section/vats/tree/company/company/' + row.id + '">' + row.id + '</a>';
                    }                    
                },{
                    field: 'companyName',
                    title: 'Компания'
                },{
                    field: 'userGlobalId',
                    title: 'userGlobalId',
                    width: 150
                },{
                    field: 'owner',    
                    title: 'Представитель'                    
                },{ 
                    field: 'director',
                    title: 'Директор'
                },{ 
                    field: 'ownerEmail',
                    title: 'E-mail'
                }, {
                    field: 'ownerPhone',
                    title: 'Тел.',
                    editor: userMobilePhoneMaskedInput
                },{ 
                    field: 'companyVersion',
                    title: 'Юр.статус.',
                    filterable: {
                        operators: {
                            string: {
                                eq: "Равно"              
                            }   
                        },
                        ui: selectCompanyVersionColumnFilter
                    }
                },{ 
                    field: 'companyForm',
                    title: 'Форма комп.',
                    filterable: {
                        operators: {
                            string: {
                                eq: "Равно"              
                            }   
                        },
                        ui: selectCompanyFormColumnFilter
                    }                    
                },{
                    field: 'lastCallDate',
                    title: 'Посл.звонок',
                    filterable: false,
                    sortable: false
                },{
                    field: 'phoneList',
                    title: 'Абн.номер',
                    encoded: false,
                    template: function(row) {
                        return row.phoneList.split(',').join('<br>');
                    }
                },{
                    field: 'userBalance',
                    title: 'Баланс'
                },{ 
                    field: 'tariffId',
                    title: 'Тариф',                    
                    template: function(row) {
                        return row.tariffName;
                    },
                    filterable: {
                        operators: {
                            string: {
                                eq: "Равно"              
                            }   
                        },
                        ui: selectTariffColumnFilter
                    }
                },{
                    field: 'statusContract',
                    title: 'Договор',
                    template: function(row) {
                        if (row.statusContract == 'free') {
                            return 'Не подписан';
                        } else if (row.statusContract == 'checked') {
                            return 'На проверке';
                        } else if (row.statusContract == 'signed') {
                            return 'Подписан';
                        }
                    },
                    filterable: {
                        operators: {
                            string: {
                                eq: "Равно"              
                            }   
                        },
                        ui: selectContractColumnFilter
                    }
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
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
                filterable: {
                    extra: false,
                    operators: {
                        string:{
                            like: "Начинается с",
                            eq: "Равно",
                            neq: "Не равно"
                        }
                    }
                },
                //toolbar: ["create"],
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
                var user = app.getActiveUser();
                
                $('<input data-text-field="userName" data-value-field="id" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        dataValueField: 'id',
                        dataTextField: 'userName',
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
                                            var arr = [];
                                            
                                            if (r.success) {
                                                for (var i in r.data.list) {
                                                    var el = r.data.list[i];
                                                    arr.push({
                                                        id: el.id,
                                                        userName: el.ownerFamily + ' ' + el.ownerName + ' ' + el.ownerSurname
                                                    });
                                                }
                                                options.success(arr);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        }
                    });               
            };
            var messageTargetTemplate = function(row) {
                var arr = row.messageTarget || [],
                    html = [];

                if (!arr) {
                    return '';
                } else if (arr.forEach) {
                    arr.forEach(function(el) {
                        html.push(el.companyName);
                    });                    
                } else {
                    $.each(arr, function(el) {
                        html.push(el.companyName);
                    });
                }
                return html.join(',');
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
                                            r.data.list.push(commonMessageObj);
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
                                        url: app.serverUrl + 'api/member/get-member-list',
                                        data: {
                                            userHash: app.getActiveUserHash(),
                                            departmentId: 0
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
                        destroy: function(options) {
                            var rec = options.data.models[0],
                                data = {
                                    messageId: rec.id
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
                                messageTarget: [commonMessageObj],
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
                                messageType: {defaultValue: 'info'},
                                messageDate: {defaultValue: u.getCurrentDateTime()},
                                messageAuthorId: {},
                                messageAuthorName: {},
                                messageTargetId: {},
                                messageShort: {},
                                messageFull: {},
                                messageReadId: {},
                                messageReadName: {}
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
            this.el.find('#common-messages-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'messageType',
                    title: 'Тип',
                    editor: messageTypeDropDownEditor,
                    template: function(row) {
                        return that.i18n.vatsContent.msgType[row.messageType] || that.i18n.vatsContent.msgType['info'];
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
                    title: 'Вступление',
                    encoded: false
                },{
                    field: 'messageFull',
                    title: 'Сообщение',
                    encoded: false
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
        showProtocolDetails: function(data) {
            function getJsonStr(str) {
                var parsedDataItem = JSON.parse(str);
                return JSON.stringify(parsedDataItem, undefined, 2);
            }
            function syntaxHighlight(json) {
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                    var cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }
            function output(inp) {
                var wrapRequest = document.createElement('pre');
                wrapRequest.innerHTML = inp;
                return wrapRequest;
            }
            this.wnd.content(output(syntaxHighlight(getJsonStr(data))));
            this.wnd.center().open();
        }        
    };
    return public;
});