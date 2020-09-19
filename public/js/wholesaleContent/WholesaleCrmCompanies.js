define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-companies.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmCompanies',
        gridPageSize: 50,
        run: function (params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.i18n = $.extend(common, local);
            this.id = this.treeId.split('-')[1];
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
        // groupZoneId: "1"
        // groupZoneName: "MVTS"
        // jId: "0"
        // memberId: "0"
        // memberName: "--назначить--"
        // name: "--назначить--"
        renderServersTable: function () {
            this.el.find('#crm-companies-list').kendoGrid({
                columns: [{
                    field: 'companyId',
                    title: '№',
                    width: '50px',
                    // template: function (item) {
                    //     return ('<a href=/#section/transit/tree/crm/crm/1-' + item.tId + '>' + item.id + '</a>')
                    // },
                    sortable: false,
                    filterable: false
                }, {
                    field: 'companyName',
                    title: 'Название компании',
                    filterable: {
                        extra: false,
                        operators: {
                            string:{
                                like: "Начинается с",
                                eq: "Равно",
                                neq: "Не равно"
                            }
                        }
                    }
                }, {
                    // field: 'groupZone',
                    field: 'groupZoneName',
                    title: 'Группы зон префиксов',
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
                    // template: '#= groupZoneName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="groupZoneName" data-value-field="groupZoneId" data-bind="value: groupZoneId"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: true,
                                value: options.model.groupZoneId,
                                text: options.model.groupZoneName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_group_zones_selector',
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
                                    this.value(options.model.groupZoneId);
                                }
                            })
                    }
                }, {
                    // field: 'jurisdiction',
                    field: 'name',
                    title: 'Юрисидикция',
                    // sortable: false,
                    filterable: false,
                    // template: '#= name #',
                    editor: function (container, options) {
                        $('<input required data-text-field="name" data-value-field="jId" data-bind="value: jId"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: true,
                                value: options.model.jId,
                                text: options.model.name,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_jurisdiction_selector',
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
                                    this.value(options.model.jId);
                                }
                            })
                    }
                }, {
                    // field: 'member',
                    field: 'memberName',
                    title: 'Менеджер',
                    // sortable: false,
                    filterable: false,
                    // template: '#= memberName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="memberName" data-value-field="memberId" data-bind="value: memberId"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: true,
                                value: options.model.memberId,
                                text: options.model.memberName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_manager_selector',
                                                type: 'post',
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
                                    this.value(options.model.memberId);
                                }
                            });
                    }
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: private.getDataSource.call(this),
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
                pageable: {
                    refresh: true,
                    pageSizes: [50, 150, 500],
                    buttonCount: 5
                },
                sortable: {
                    mode: "multiple",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            });
        },
        getDataSource: function () {
            var that = this;
            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=get_company_list',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip: options.data.skip,
                                take: options.data.take,
                                filter: options.data.filter,
                                user: app.getActiveUser(),
                                typeTree: that.id
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
                    create: function (options) {
                        var model = options.data.models[0];
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=add_company',
                            type: 'post',
                            data: {
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
                    destroy: function (options) {
                        var model = options.data.models[0];
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=del_company',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                companyId: model.companyId
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
                    update: function (options) {
                        var model = options.data.models[0];
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=set_company',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                companyId: model.companyId,
                                companyName: model.companyName,
                                groupZoneId: (model.groupZone && model.groupZone.groupZoneId) || model.groupZoneId,
                                jId: (model.jurisdiction && model.jurisdiction.jId) || model.jId,
                                memberId: (model.member && model.member.memberId) || model.memberId
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
                        id: "companyId",
                        fields: {
                            companyName: {},
                            groupZoneId: {},
                            jId: {},
                            memberId: {}
                        }
                    }
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,
                serverFiltering: true,
                serverPaging: true,
                serverSorting: true
            });
        }
    };
    return public;
});
