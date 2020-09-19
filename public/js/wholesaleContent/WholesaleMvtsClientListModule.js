define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-mvts-client-list.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'CrmClientModule',
        gridPageSize: 20,
        run: function (params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.i18n = $.extend(common, local);
            private.bindEvents.call(this);
            private.render.call(this);
        }
    };
    var private = {
        bindEvents: function () {
            var that = this;
        },
        render: function () {
            var that = this;

            html = templateTmpl({
                i18n: that.i18n,
            });
            that.el.html(html);
            that.el.find('.combobox').kendoComboBox();
            that.el.find('.tabstrip').kendoTabStrip({
                animation: {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
            private.renderServersTable.call(this);
        },
        // companyId: "1"
        // companyName: "7Time"
        // isActive: "yes"
        // isClient: "yes"
        // isPartner: "no"
        // ownerId: "111"
        // ownerMvtsId: "01"
        // ownerMvtsName: "MIATEL LLC"
        renderServersTable: function () {
            this.el.find('#crm-client-list').kendoGrid({
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
                columns: [{
                    field: 'clientId',
                    title: 'id',
                    width: '50px',
                    // template: function (item) {
                    //     return ('<a href=/#section/transit/tree/crm/crm/1-' + item.id + '>' + item.id + '</a>')
                    // },
                    sortable: false,
                    filterable: false
                }, {
                    field: 'mvtsName',
                    title: 'Клиент'
                }, {
                    field: 'mvtsId',
                    title: 'mvts Id'
                }, {
                    field: 'balans',
                    title: 'Баланс',
                    filterable: false
                }, {
                    field: 'blocking_reason',
                    title: 'Причина блокировки',
                    sortable: false,
                    filterable: false
                /*}, {
                    field: 'manager',
                    title: 'Менеджер',
                    template: '#= userName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="userName" data-value-field="roleId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.roleId,
                                text: options.model.userName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.transitServerUrl + 'crm.php?method=get-manager-list',
                                                type: 'post',
                                                data: {
                                                    user: app.getActiveUser()
                                                },
                                                success: function (resp) {
                                                    var r = JSON.parse(resp);
                                                    if (r.success) {
                                                        options.success(r.data.list);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                },
                                dataBound: function (e) {
                                    this.value(options.model.roleId);
                                }
                            })
                    }*/
                /*}, {
                    field: 'owner',
                    title: 'Юрисдикция',
                    template: '#= ownerName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="name" data-value-field="operatorId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.operatorId,
                                text: options.model.name,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.transitServerUrl + 'crm.php?method=get-jur',
                                                type: 'post',
                                                data:{
                                                    user: app.getActiveUser()
                                                },
                                                success: function (resp) {
                                                    var r = JSON.parse(resp);

                                                    if (r.success) {
                                                        options.success(r.data.list);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                },
                                dataBound: function (e) {
                                    this.value(options.model.operatorId);
                                }
                            });
                    }*/
                }, {
                    field: 'isActive',
                    title: 'Активен',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'isClient',
                    title: 'Клиент',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'isPartner',
                    title: 'Партнер',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'ownerMvtsId',
                    title: 'Id владельца MVTS'
                }, {
                    field: 'ownerMvtsName',
                    title: 'Имя владельца MVTS'
                }],
                dataSource: private.getDataSource.call(this),
                // detailTemplate: kendo.template($("#detail-template").html()),
                /*detailInit: private.detailInit,
                detailExpand: function (e) {
                    this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                },*/
                pageable: {
                    refresh: true,
                    pageSizes: [20, 100, 200, 500],
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                editable: false
            });
        },
        detailInit: function (e) {
            var detailRow = e.detailRow;
            detailRow.find('.client-invoice-detail').kendoGrid({
                columns: [{
                    field: 'acountName',
                    title: 'Счет'
                }, {
                    field: 'balans',
                    title: 'Остаток на счете'
                }, {
                    field: 'currencyId',
                    title: 'Валюта',
                    width: "70px"
                }, {
                    field: "info",
                    title: "Ремарка"
                }, {
                    field: "block",
                    hidden: true
                }],
                dataSource: {
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-client-invoice',
                                type: 'post',
                                data: {
                                    clientId: e.data.clientId,
                                    user: app.getActiveUser()
                                },
                                success: function (resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        options.success(r);
                                    } else {
                                        options.error();
                                    }
                                }
                            });
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        data: function (resp) {
                            if (typeof resp.data == 'undefined') {
                                app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]); //<-- error params get
                            } else if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }
                        },
                        model: {
                            fields: {
                            }
                        }

                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                    pageSize: 5
                },
                pageable: false,
                sortable: false,
                scrollable: true,
                resizeable: true,
                dataBound: function (e) {
                    var rows = e.sender.tbody.children();
                    for (var i = 0; i < rows.length; i++) {
                        var row = $(rows[i]);
                        var dataItem = e.sender.dataItem(row);
                        var block = dataItem.get("block");
                        if (block == 1)
                            row.addClass("block-background");
                    }
                    for (var i = 0; i < e.sender.columns.length; i++)
                        e.sender.autoFitColumn(i);
                }
            });
        },
        getDataSource: function () {
            var that = this;

            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'mvts.php?method=get_client_list',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip: options.data.skip,
                                take: options.data.take,
                                filter: options.data.filter,
                                user: app.getActiveUser()
                            },
                            success: function (resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success(r);
                                } else {
                                    options.error();
                                }
                            }
                        });
                    },
                    /*update: function (options) {
                        var model = options.data.models[0];
                        $.ajax({
                            url: app.transitServerUrl + 'crm.php?method=set-client-list',
                            type: 'post',
                            data: {
                                id: model.id,
                                user: app.getActiveUser(),
                                roleId:(model.manager && model.manager.roleId) || model.roleId,
                                ownerId:(model.owner && model.owner.operatorId) || model.operatorId
                            },
                            success: function (resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    options.success(r);
                                } else {
                                    options.error();
                                }
                            }
                        });
                    },*/
                    parameterMap: function (options, operation) {
                        if (operation !== 'read' && options.models) {
                            return {models: kendo.stringify(options.models)};
                        }
                    }
                },
                schema: {
                    total: function (resp) {
                        return resp.data.total;
                    },
                    data: function (resp) {
                        if (typeof resp.data == 'undefined') {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]); //<-- error params get
                        } else if (typeof resp.data.list == 'undefined') {
                            return resp.data;
                        } else {
                            return resp.data.list;
                        }
                    },
                    model: {
                        id: "id",
                        fields: {
                            id: {editable: false},
                            clientName: {editable: false},
                            balans: {editable: false},
                            currencyName: {editable: false},
                            blocking_reason: {editable: false},
                            isActive: {editable: false},
                            ownerName: {editable: false},
                            manager: {}
                        }
                    }
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,
                // sort: ({ field: "manager", dir: "desc" }),
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                dataBound: function (e) {
                    for (var i = 0; i < e.sender.columns.length; i++)
                        e.sender.autoFitColumn(i);
                }
            });
        }
    };
    return public;
});


