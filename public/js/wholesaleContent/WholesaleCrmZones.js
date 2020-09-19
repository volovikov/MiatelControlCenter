define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-zones.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmZones',
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
            private.renderZonesTable.call(this);
        },
        renderZonesTable: function () {
            this.el.find('#crm-zones-list').kendoGrid({
                columns: [{
                    field: 'groupZoneId',
                    title: '№',
                    width: '50px',
                    // template: function (item) {
                    //     return ('<a href=/#section/transit/tree/crm/crm/1-' + item.tId + '>' + item.id + '</a>')
                    // },
                    sortable: false,
                    filterable: false
                }, {
                    field: 'groupZoneName',
                    title: 'Название группы зон',
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
                    field: 'groupZoneInfo',
                    title: 'Описание',
                    sortable: false,
                    filterable: false
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
        detailInit: function (e) {
            var detailRow = e.detailRow;
            detailRow.find('.zones-list').kendoGrid({
                // groupZoneId: "1"
                // groupZoneName: "MVTS"
                // zoneId: "1"
                // zoneInfo: ""
                // zoneName: "AFGHANISTAN MOBILE"
                columns: [{
                    field: 'zoneId',
                    title: '№',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'zoneName',
                    title: 'Название зоны'
                }, {
                    field: 'zoneInfo',
                    title: 'Описание',
                    sortable: false,
                    filterable: false
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: {
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=get_zones_list',
                                type: 'post',
                                data: {
                                    groupZoneId: e.data.groupZoneId,
                                    user: app.getActiveUser(),
                                    sort: options.data.sort,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    filter: options.data.filter
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
                                url: app.wholesaleServerUrl + 'crm.php?method=add_zones',
                                type: 'post',
                                data: {
                                    groupZoneId: e.data.groupZoneId,
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
                                url: app.wholesaleServerUrl + 'crm.php?method=del_zones',
                                type: 'post',
                                data: {
                                    user: app.getActiveUser(),
                                    groupZoneId: e.data.groupZoneId,
                                    zoneId: model.zoneId
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
                                url: app.wholesaleServerUrl + 'crm.php?method=set_zones',
                                type: 'post',
                                data: {
                                    user: app.getActiveUser(),
                                    zoneId: model.zoneId,
                                    zoneName: model.zoneName,
                                    zoneInfo: model.zoneInfo
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
                            id: "zoneId",
                            fields: {
                                zoneId: {editable: false},
                                zoneName: {},
                                zoneInfo: {},
                            }
                        }
                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                    autoSync: true,
                    pageSize: 20,
                    batch: true
                },
                detailTemplate: kendo.template($("#detail-template-prefix").html()),
                detailInit: private.detailInitPrefix,
                detailExpand: function (e) {
                    this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                },
                scrollable: false,
                sortable: true,
                pageable: {
                    refresh: true,
                    pageSizes: [20, 50, 100],
                    buttonCount: 5
                },
                toolbar: ["create"],
                editable: true,
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
        detailInitPrefix: function (e) {
            var detailRow = e.detailRow;
            detailRow.find('.prefix-list').kendoGrid({
                // groupZoneId: "1"
                // groupZoneName: "MVTS"
                // zoneId: "1"
                // zoneInfo: ""
                // zoneName: "AFGHANISTAN MOBILE"
                columns: [{
                    field: 'prefixId',
                    title: '№'
                }, {
                    field: 'zonePrefix',
                    title: 'Префикс зоны'
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: {
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=get_zones_prefix_list',
                                type: 'post',
                                data: {
                                    groupZoneId: e.data.groupZoneId,
                                    zoneId: e.data.zoneId,
                                    user: app.getActiveUser(),
                                    sort: options.data.sort,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    filter: options.data.filter
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
                                url: app.wholesaleServerUrl + 'crm.php?method=add_zones_prefix',
                                type: 'post',
                                data: {
                                    groupZoneId: e.data.groupZoneId,
                                    zoneId: e.data.zoneId,
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
                                url: app.wholesaleServerUrl + 'crm.php?method=del_zones_prefix',
                                type: 'post',
                                data: {
                                    user: app.getActiveUser(),
                                    groupZoneId: e.data.groupZoneId,
                                    zoneId: e.data.zoneId,
                                    prefixId: model.prefixId
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
                                url: app.wholesaleServerUrl + 'crm.php?method=set_zones_prefix',
                                type: 'post',
                                data: {
                                    user: app.getActiveUser(),
                                    zoneId: e.data.zoneId,
                                    prefixId: model.prefixId,
                                    zonePrefix: model.zonePrefix
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
                            id: "prefixId",
                            fields: {
                                prefixId: {editable: false},
                                zonePrefix: {}
                            }
                        }
                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true,
                    pageSize: 20,
                    autoSync: true,
                    batch: true
                },
                scrollable: false,
                sortable: false,
                pageable: {
                    refresh: true,
                    pageSizes: [20, 50, 100],
                    buttonCount: 5
                },
                toolbar: ["create"],
                editable: true,
                filterable: false,
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
                            url: app.wholesaleServerUrl + 'crm.php?method=get_group_zones_list',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=add_group_zones',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=del_group_zones',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                groupZoneId: model.groupZoneId
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
                            url: app.wholesaleServerUrl + 'crm.php?method=set_group_zones',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                groupZoneId: model.groupZoneId,
                                groupZoneName: model.groupZoneName,
                                groupZoneInfo: model.groupZoneInfo
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
                        id: "groupZoneId",
                        fields: {
                            groupZoneId: {editable: false},
                            groupZoneName: {},
                            groupZoneInfo: {}
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
