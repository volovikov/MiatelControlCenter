define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-groups.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmGroups',
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
        // groupCalc: "0"
        // groupId: "1"
        // groupInfo: ""
        // groupName: "Group 1"
        // groupVisible: "0"
        // leaderId: "1"
        // leaderName: "leader 1"
        renderServersTable: function () {
            this.el.find('#crm-groups-list').kendoGrid({
                columns: [{
                    field: 'groupId',
                    title: '№',
                    width: '50px',
                    // template: function (item) {
                    //     return ('<a href=/#section/transit/tree/crm/crm/1-' + item.tId + '>' + item.id + '</a>')
                    // },
                    sortable: false,
                    filterable: false
                }, {
                    field: 'groupName',
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
                    field: 'groupInfo',
                    title: 'Примечание',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'calc',
                    title: 'Схема расчета маржи',
                    sortable: false,
                    filterable: false,
                    template: '#= groupCalcName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="groupCalcName" data-value-field="groupCalc" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: true,
                                value: options.model.groupCalc,
                                text: options.model.groupCalcName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_group_calc_selector',
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
                                    this.value(options.model.groupCalc);
                                }
                            })
                    }
                }, {
                    field: 'groupVisible',
                    title: 'Видимость группы',
                    sortable: false,
                    filterable: false,
                    template: function(e) {
                        if(e.groupVisible === "0"){
                            return '<input type="checkbox" name="checkEnd" class="checkbox"/>';
                        } else if (e.groupVisible === "1") {
                            return '<input type="checkbox" name="checkEnd" class="checkbox" checked/>';
                        }
                    }
                }, {
                    field: 'lProc',
                    title: 'Процент руководителя группы',
                }, {
                    field: 'leader',
                    title: 'Руководитель',
                    sortable: false,
                    filterable: false,
                    template: '#= leaderName #',
                    editor: function (container, options) {
                        $('<input required data-text-field="leaderName" data-value-field="leaderId" data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                autoBind: false,
                                value: options.model.leaderId,
                                text: options.model.leaderName,
                                dataSource: {
                                    transport: {
                                        read: function (options) {
                                            $.ajax({
                                                url: app.wholesaleServerUrl + 'crm.php?method=get_leader_selector',
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
                                    this.value(options.model.leaderId);
                                }
                            })
                    }
                }, {
                    command: ["destroy"],
                    title: "&nbsp;",
                    width: "90px"
                }],
                dataSource: private.getDataSource.call(this),
                dataBound: function () {
                    $(".checkbox").bind("change", function (e) {
                        var row = $(this).closest("tr"),
                            grid = $("#crm-groups-list").data("kendoGrid"),
                            dataItem = grid.dataItem(row);
                        $.ajax({
                            url: app.wholesaleServerUrl + 'crm.php?method=set_group',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                groupId: dataItem.groupId,
                                groupInfo: dataItem.groupInfo,
                                groupName: dataItem.groupName,
                                lProc: dataItem.lProc,
                                groupCalc: (dataItem.calc && dataItem.calc.groupCalc) || dataItem.groupCalc,
                                leaderId: (dataItem.leader && dataItem.leader.leaderId) || dataItem.leaderId,
                                groupVisible: function () {
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
                    pageSizes: [20, 50, 100],
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
                            url: app.wholesaleServerUrl + 'crm.php?method=get_group_list',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=add_group',
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
                            url: app.wholesaleServerUrl + 'crm.php?method=del_group',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                groupId: model.groupId
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
                            url: app.wholesaleServerUrl + 'crm.php?method=set_group',
                            type: 'post',
                            data: {
                                user: app.getActiveUser(),
                                groupId: model.groupId,
                                groupInfo: model.groupInfo,
                                groupName: model.groupName,
                                lProc: model.lProc,
                                groupCalc: (model.calc && model.calc.groupCalc) || model.groupCalc,
                                groupVisible: model.groupVisible,
                                leaderId: (model.leader && model.leader.leaderId) || model.leaderId                                
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
                        id: "groupId",
                        fields: {
                            groupName: {},
                            groupInfo: {},
                            leaderId: {},
                            groupCalc: {},
                            groupVisible: {},
                            lProc: {}
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
