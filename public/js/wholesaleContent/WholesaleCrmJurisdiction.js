define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-jur.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmJurisdiction',
        gridPageSize: 20,
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
        // companyId: "111"
        // companyname: "MIATEL LLC" - сортировка и фильтрация
        // country: "RU"
        // currencyId: "643"
        // currencyName: "RUB"
        // directorId: "0"
        // directorName: "--назначить--"
        // name: "MIATEL LLC"
        // nds: "18"
        renderServersTable: function () {
            this.el.find('#crm-jur-list').kendoGrid({
                columns: [{
                    field: 'jId',
                    title: '№',
                    width: '50px',
                    // template: function (item) {
                    //     return ('<a href=/#section/transit/tree/crm/crm/1-' + item.tId + '>' + item.id + '</a>')
                    // },
                    sortable: false,
                    filterable: false
                }, {
                    field: 'name',
                    title: 'Название юрисдикции',
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
                    field: 'country',
                    title: 'Страна',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currency',
                    title: 'Валюта',
                    sortable: false,
                    filterable: false,
                    template: '#= currencyName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="currencyName" data-value-field="currencyId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.currencyId,
                                text: options.model.currencyName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_currency_list',
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
                                    this.value(options.model.currencyId);
                                }
                            })
                    }
                }, {
                    field: 'nds',
                    title: 'Ставка НДС, %',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'company',
                    title: 'Оператор',
                    sortable: false,
                    filterable: false,
                    template: '#= companyName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="companyName" data-value-field="companyId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.companyId,
                                text: options.model.companyName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_company_selector',
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
                                    this.value(options.model.companyId);
                                }
                            });
                    }
                }, {
                    field: 'director',
                    title: 'Директор',
                    sortable: false,
                    filterable: false,
                    template: '#= directorName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="directorName" data-value-field="directorId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.directorId,
                                text: options.model.directorName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_director_selector',
                                                type: 'post',
                                                data: {
                                                    user: app.getActiveUser(),
                                                    typeTree: 1
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
                                    this.value(options.model.directorId);
                                }
                            })
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
        getDataSource: function () {
            var that = this;
            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=get_jurisdiction_list',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=add_jurisdiction',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=del_jurisdiction',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                jId: model.jId
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
                            url: app.wholesaleServerUrl + 'crm.php?method=set_jurisdiction',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                jId: model.jId,
                                name: model.name,
                                currencyId: (model.currency && model.currency.currencyId) || model.currencyId,
                                country: model.country,
                                companyId: (model.company && model.company.companyId) || model.companyId,
                                directorId: (model.director && model.director.directorId) || model.directorId,
                                nds: model.nds
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
                        id: "jId",
                        fields: {
                            jId: {editable: false},
                            name: {},
                            currencyId: {},
                            country: {},
                            companyId: {},
                            directorId: {},
                            nds: {}
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
