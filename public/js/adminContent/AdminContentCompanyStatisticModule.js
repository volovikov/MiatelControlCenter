/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminUserForm
 * @returns {AdminContentUsersStatisticModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-company-statistic.html',
    'css!./css/adminContent'
], function($, k, u, common, local, adminCompanyStatistic) {
    
    var adminCompanyStatisticTmpl = k.template(adminCompanyStatistic);
    
    var сommonMessageObj = {
        id: 0,
        companyName: 'Для всех'
    };
    var public = {        
        myModuleName: 'AdminContentCompanyStatisticModule',
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
            
            html = adminCompanyStatisticTmpl({
                i18n: that.i18n,
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
            private.renderCompanyTable.call(this);
            private.renderStatistics.call(this);
            private.renderMessagesTable.call(this);
        },        
        renderStatistics: function() {
            
        },
        renderCompanyTable: function() {
            var that = this; 
            
            var userMobilePhoneMaskedInput = function(container, options) {
                $('<input value="' + options.model.ownerPhone +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
            };  
            var tariffDropDownEditor = function(container, options) {
                    var cb = $('<input required data-text-field="name" data-value-field="tariffId" data-bind="value:tariffId"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataSource: {
                                transport: {
                                    read: function(options) {
                                        $.ajax({
                                            url: 'http://91.217.178.7/backend/public.php?method=get-tariff-list',
                                            type: 'post',
                                            success: function(resp) {
                                                try {
                                                    var r = JSON.parse(resp);

                                                    if (r.success) {
                                                        options.success(r.data.list);
                                                    }                                                    
                                                } catch(e) {
                                                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                                }
                                            }
                                        }); 
                                    }
                                }
                            },
                            autoBind: true
                        }).data('kendoDropDownList');

                    cb.value(options.model.tariffId);                
            }
            var prefetch = function(data) {
                if ($.isArray(data)) {
                    for (var i in data) {
                        var el = data[i];
                        el.ownerPhone = u.getMainPhoneFormatStr(el.ownerPhone);
                    }
                } else {
                    data.ownerPhone = u.getMainPhoneFormatStr(data.ownerPhone);
                }
                return data;
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
            this.el.find('#company-list').kendoGrid({
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
                    editor: userMobilePhoneMaskedInput
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
                    title: 'Тариф',
                    editor: tariffDropDownEditor
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
                }],                
                dataSource: getDataSource(),
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
                                            r.data.list.push(сommonMessageObj);
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
                                messageTarget: [сommonMessageObj],
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
        }
    };
    return public;
});