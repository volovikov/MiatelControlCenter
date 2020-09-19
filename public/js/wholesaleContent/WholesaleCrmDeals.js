define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-deals.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmDeals',
        gridPageSize: 20,
        run: function (params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.i18n = $.extend(common, local);

            private.bindEvents.call(this);
            // private.get_calc.call(this);
            private.render.call(this);
        }
    };
    var private = {
        calc: true,
        // get_calc: function () {
        //     var that = this;
        //     $.ajax({
        //         url: app.transitServerUrl + 'crm.php?method=check-deal-calc',
        //         type: 'post',
        //         data: {
        //             user: app.getActiveUser()
        //         },
        //         success: function (resp) {
        //             var r = JSON.parse(resp);
        //             if (r.success) {
        //                 private.calc = r.data.calc;
        //             }
        //             private.render.call(that);
        //         }
        //     });
        // },
        bindEvents: function () {
            var that = this;
        },
        render: function () {
            var that = this;

            html = templateTmpl({
                i18n: that.i18n
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
        // clientMinute: "687537.8333"
        // clientMoney: "23082.875835"
        // eDeal: "2016-09-30 23:59:59"
        // nameDeal: "vr- miatel ?????? 2016"
        // oldNameDeal: "vr- miatel ?????? 2016"
        // partnerMinute: "0.0000"
        // partnerMoney: "0.000000"
        // sDeal: "2016-09-01 00:00:00"
        renderServersTable: function () {
            this.el.find('#crm-deal-list').kendoGrid({
                filterable: {
                    extra: false,
                    operators: {
                        string: {
                            like: "Start with",
                            eq: "Is equal to",
                            neq: "Is not equal to"
                        }
                    }
                },
                columns: [{
                    field: 'nameDeal',
                    title: 'Наименование сделки'                
                }, {
                    field: 'sDeal',
                    title: 'начиная с',
                }, {
                    field: 'eDeal',
                    title: 'до',
                }, {
                    field: 'clientMinute',
                    title: 'минуты клиента',
                }, {
                    field: 'clientMoney',
                    title: 'сумма клиента',
                }, {
                    field: 'partnerMinute',
                    title: 'минуты партнера',
                }, {
                    field: 'partnerMoney',
                    title: 'сумма партнера',
                }, {
                    command: [{name: "скопировать", click: function (e) {
                        e.preventDefault();
                        var tr = $(e.target).closest("tr")
                        var data = this.dataItem(tr);
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=copy_deal_list',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                nameDeal: data.nameDeal
                            },
                            success: function (resp) {
                                var r = JSON.parse(resp);
                                if (r.success) {
                                    $("#crm-deal-list").data("kendoGrid").dataSource.read();
                                    $("#crm-deal-list").data("kendoGrid").refresh();
                                }
                            }
                        });
                    }}],
                    title: " ",
                    width: "110px"
                // }, {
                //     command: [{name: "перерасчет", click: function (e) {
                //         e.preventDefault();
                //         var tr = $(e.target).closest("tr")
                //         var data = this.dataItem(tr);
                //         $.ajax({
                //             url: app.transitServerUrl + 'crm.php?method=recalc-deal',
                //             type: 'post',
                //             data: {
                //                 user: app.getActiveUser(),
                //                 startTime: data.sDeal,
                //                 endTime: data.eDeal,
                //                 nameDeal: data.nameDeal
                //             },
                //             success: function (resp) {
                //                 $("#crm-deal-list").data("kendoGrid").dataSource.read();
                //                 $("#crm-deal-list").data("kendoGrid").refresh();
                //             }
                //         });
                //     }}],
                //     title: " ",
                //     width: "110px",
                //     hidden: private.calc
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: private.getDataSource.call(this),
                detailTemplate: kendo.template($("#detail-template").html()),
                detailInit: private.detailInit,
                detailExpand: function (e) {
                    this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
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
                editable: true,
                toolbar: ["create"]

            });
        },
        // companyId: "91"
        // companyName: "KazTransCom"
        // nameDeal: "ктс сентябрь 2016"



        // costDeal: "5.709000"
        // durationDeal: "63.4333"



        // dealId: "2"
        // startDeal: "2016-09-01 00:00:00"
        // endDeal: "2016-09-30 23:59:59"
        // type: "client"
        // priceDeal: "0.09"
        // infoDeal: ""
        // zoneId: "2178"
        // zoneName: "Egypt, proper"
        getDealZonesDataSource: function (companyId) {
            var that = this;

            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=get_deal_zones_selector',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                companyId: companyId.model.companyId
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
            });
        },

        detailInit: function (e) {
            var detailRow = e.detailRow;
            detailRow.find('.crm-deal-form').kendoGrid({
                columns: [{
                    field: 'dealId',
                    title: '№'
                }, {
                    field: 'startDeal',
                    title: 'начиная с',
                    format: "{0:yyy-MM-dd HH:mm:ss}",
                    editor: function (container, options) {
                        $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                            .appendTo(container)
                            .kendoDateTimePicker({});
                    }
                }, {
                    field: 'endDeal',
                    title: 'до',
                    format: "{0:yyyy-MM-dd HH:mm:ss}",
                    editor: function (container, options) {
                        $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                            .appendTo(container)
                            .kendoDateTimePicker({});
                    }
                }, {
                    field: 'type',
                    title: 'тип',
                    editor: function (container, options) {
                        $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: true,
                                dataSource: [{
                                    value: 'client'
                                }, {
                                    value: 'partner'
                                }]
                            });
                    }
                }, {
                    field: 'operator',
                    title: 'оператор',
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
                    field: 'zone',
                    title: 'зона',
                    template: '#= zoneName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="zoneName" data-value-field="zoneId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.zoneId,
                                text: options.model.zoneName,
                                dataSource: private.getDealZonesDataSource(options),
                                dataBound: function (e) {
                                    this.value(options.model.zoneId);
                                }
                            })
                    }
                }, {
                    field: 'zoneId',
                    title: 'Префиксы',
                    editable: false,
                    sortable: false,
                    filterable: false,
                    template: '<span class="k-icon k-i-search" style="font-size: 0;">#= zoneId #</span>'
                }, {
                    field: 'priceDeal',
                    title: 'цена'
                }, {
                    field: 'durationDeal',
                    title: 'минуты'
                }, {
                    field: 'costDeal',
                    title: 'сумма'
                }, {
                    field: 'infoDeal',
                    title: 'ремарка'
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: {
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=get_deal',
                                type: 'post',
                                data: {
                                    nameDeal: e.data.nameDeal,
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
                        update: function (options) {
                            var model = options.data;
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=set_deal',
                                type: 'post',
                                data: {
                                    dealId: model.dealId,
                                    startDeal: kendo.toString(model.startDeal, "yyyy-MM-dd HH:mm:tt"),
                                    endDeal: kendo.toString(model.endDeal, "yyyy-MM-dd HH:mm:tt"),
                                    type: model.type,
                                    companyId: (model.operator && model.operator.companyId) || model.companyId,
                                    zoneId: (model.zone && model.zone.zoneId) || model.zoneId,
                                    priceDeal: model.priceDeal,
                                    infoDeal: model.infoDeal,
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
                        create: function (options) {
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=add_deal',
                                type: 'post',
                                data: {
                                    user: app.getActiveUser(),
                                    nameDeal: e.data.nameDeal
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
                            var model = options.data;
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=del_deal',
                                type: 'post',
                                data: {
                                    dealId: model.dealId,
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
                            id: "dealId",
                            fields: {
                                dealId: {editable: false},
                                startDeal: {},
                                endDeal: {},
                                type: {},
                                companyId: {},
                                zoneId: {},
                                priceDeal: {},
                                durationDeal: {editable: false},
                                costDeal: {editable: false},
                                infoDeal: {}
                            }
                        }

                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                    pageSize: 5,
                    autoSync: true
                },
                pageable: false,
                sortable: false,
                scrollable: true,
                resizeable: true,
                editable: true,
                dataBound: function (e) {
                    for (var i = 0; i < e.sender.columns.length; i++)
                        e.sender.autoFitColumn(i);
                },
                toolbar: ["create"]
            });
            // get_zones_prefix_list на входе - zoneId

            $('#crm-deal-list').kendoTooltip({
                filter: "td:nth-child(7)", //,td:nth-child(3),td:nth-child(4)",
                position: "right",
                content: function (e) {
                    var result = "";
                    $.ajax({
                        url: app.wholesaleServerUrl + 'crm.php?method=get_zones_prefix_list',
                        type: 'post',
                        async: false,
                        data: {
                            zoneId: e.target.text(),
                            user: app.getActiveUser()
                        },
                        success: function (resp) {
                            result = resp;
                        }
                    });
                    var r = JSON.parse(result);
                    var rr1 = 'Префиксы:<br>';
                    var rr = '';
                    if(r.success){
                        $.each(r.data.list, function (id, val) {
                            rr += "<br>" + val.zonePrefix;
                        });
                    }
                    return rr1 + rr.slice(4);
                }
            }).data('kendoTooltip');
        },
        getDataSource: function () {
            var that = this;

            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=get_deal_list',
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
                    create: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=add_deal_list',
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
                    update: function (options) {
                        var model = options.data.models[0];
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=set_deal_list',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                nameDeal: model.nameDeal,
                                oldNameDeal: model.oldNameDeal
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
                            url: app.wholesaleServerUrl + 'crm.php?method=del_deal_list',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                nameDeal: model.nameDeal
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
                        id: "nameDeal",
                        fields: {
                            nameDeal: {},
                            eDeal: {editable: false},
                            sDeal: {editable: false},
                            clientMinute: {editable: false},
                            clientMoney: {editable: false},
                            partnerMinute: {editable: false},
                            partnerMoney: {editable: false}
                        }
                    }
                },
                autoSync: true,
                batch: true,
                pageSize: that.gridPageSize,
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




