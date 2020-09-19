define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-currency.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmCurrency',
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
        // currencyExchange: "0.01563"
        // currencyId: "643"
        // currencyName: "RUB"
        // inUse: "1"
        renderServersTable: function () {
            this.el.find('#crm-currency-list').kendoGrid({
                columns: [{
                    field: 'currencyId',
                    title: '№',
                    width: '50px',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currencyName',
                    title: 'Валюта',
                    width: "120px"
                }, {
                    field: 'inUse',
                    title: 'Используется',
                    template: function(e) {
                        if(e.inUse === "0"){
                            return '<input type="checkbox" name="checkEnd" class="checkbox"/>';
                        } else if (e.inUse === "1") {
                            return '<input type="checkbox" name="checkEnd" class="checkbox" checked/>';
                        }
                    }
                }],
                dataSource: private.getDataSource.call(this),
                dataBound: function () {
                    $(".checkbox").bind("change", function (e) {
                        var row = $(this).closest("tr"),
                            grid = $("#crm-currency-list").data("kendoGrid"),
                            dataItem = grid.dataItem(row);
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=set_currency',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                currencyId: dataItem.currencyId,
                                inUse: function () {
                                    if (e.target.checked) {
                                        return '1';
                                    }
                                    return '0';
                                }
                            },
                            success: function(resp) {
                                var parsedResp = $.parseJSON(resp);
                                if (parsedResp.success) {
                                    app.showPopupMsg('good', 'ОК', 'Данные сохранены успешно');
                                } else {
                                    app.showPopupMsg('bad', 'Ошибка', 'Код ошибки ' + parsedResp.errors);
                                }
                            }
                        });
                    });
                },
                pageable: {
                    refresh: true,
                    pageSizes: [20, 50, 100],
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                editable: true
            });
        },
        getDataSource: function () {
            var that = this;
            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=get_currency_list',
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
                    // update: function (options) {
                    //     var model = options.data.models[0];
                    //     $.ajax({
                    //         url: app.wholesaleServerUrl + 'crm.php?method=set_jurisdiction',
                    //         type: 'post',
                    //         data: {
                    //             user: app.getActiveUser(),
                    //             currencyId: model.currencyId,
                    //             inUse: model.inUse
                    //         },
                    //         success: function (resp) {
                    //             var r = JSON.parse(resp);
                    //
                    //             if (r.success) {
                    //                 options.success(r);
                    //             } else {
                    //                 options.error();
                    //             }
                    //         }
                    //     });
                    // },
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
                            currencyId: {editable: false},
                            currencyName: {editable: false},
                            inUse: {}
                        }
                    }
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,
                serverPaging: true,
                serverSorting: true
            });
        }
    };
    return public;
});
