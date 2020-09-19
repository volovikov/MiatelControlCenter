define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-mvts-cdr-list.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, statisticPage) {

    var cdrListPageTmpl = k.template(statisticPage);

    var public = {
        myModuleName: 'WholesaleCdrListModule',
        gridPageSize: 20,
        defaultPeriod: {
            dateBegin: null,
            timeBegin: null,
            dateEnd: null,
            timeEnd: null
        },
        run: function (params) {
            var tmp = u.getTimeFormatStr(new Date(+new Date() - 1000 * 60 * 60 * 24)),
                pdate = tmp.split(' ')[0],
                t = u.getCurrentTime().split(':'),
                time = t[0] + ':' + t[1]; // no sec
            for (var key in params) {
                this[key] = params[key];
            }
            this.i18n = $.extend(common, local);

            this.defaultPeriod = {
                dateBegin: pdate,
                timeBegin: time,
                dateEnd: u.getCurrentDate(),
                timeEnd: time
            };
            private.bindEvents.call(this);
            private.render.call(this);
        },
        onClickRedrawBtn: function () {
            var period = {
                dateBegin: this.el.find('#dateBegin').val(),
                timeBegin: this.el.find('#timeBegin').val(),
                dateEnd: this.el.find('#dateEnd').val(),
                timeEnd: this.el.find('#timeEnd').val(),
            };
            private.redraw.call(this, this.treeId, period);
        }
    };
    var private = {
        bindEvents: function () {
            var that = this;
        },
        redraw: function (serverId, period) {
            var that = this;

            //private.getDataSource.call(this, this.serverId, period, function(data) {
            private.renderCdrList.call(that);
            //});
        },
        render: function () {
            var that = this;
            var html = cdrListPageTmpl({
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
            that.el.find('#cdr-list-toolbar').kendoToolBar({
                items: [{
                    template: '<input class="datePicker" id="dateBegin" value="' + that.defaultPeriod.dateBegin + '"/>',
                    overflow: 'never'
                }, {
                    template: '<input class="timePicker" id="timeBegin" value="' + that.defaultPeriod.timeBegin + '"/>',
                    overflow: 'never'
                }, {
                    type: 'separator'
                }, {
                    template: '<input class="datePicker" id="dateEnd" value="' + that.defaultPeriod.dateEnd + '"/>',
                    overflow: 'never'
                }, {
                    template: '<input class="timePicker" id="timeEnd" value="' + that.defaultPeriod.timeEnd + '"/>',
                    overflow: 'never'
                }, {
                    type: 'button',
                    icon: 'refresh',
                    text: that.i18n.transit.getCdrList,
                    click: function () {
                        that.onClickRedrawBtn.call(that);
                    }
                }]
            });
            that.el.find(".datePicker").kendoDatePicker({
                depth: 'month',
                format: 'yyyy-MM-dd'
            });
            that.el.find(".timePicker").kendoTimePicker({
                format: 'HH:mm'
            });
            private.renderCdrList.call(that);
        },
        renderCdrList: function (data) {
            var that = this;
            var dataBound = function (e) {
                var grid = $('#cdr-list').data("kendoGrid");
                for (var i = 0; i < grid.columns.length; i++) {
                    grid.autoFitColumn(i);
                }
            };
            var period = {
                dateBegin: this.el.find('#dateBegin').val(),
                timeBegin: this.el.find('#timeBegin').val(),
                dateEnd: this.el.find('#dateEnd').val(),
                timeEnd: this.el.find('#timeEnd').val(),
            };
            this.el.find('#cdr-list').kendoGrid({
                dataSource: private.getDataSource.call(this, this.treeId, period),
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
                sort: {
                    field: "date",
                    dir: "desc"
                },
                columns: [{
                    field: 'cdrId',
                    title: 'CDR ID',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'srcInput',
                    title: 'SRC на входе',
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
                    field: 'srcOut',
                    title: 'SRC на выходе',
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
                    field: 'dst',
                    title: 'DST',
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
                    field: 'date',
                    title: 'Дата',
                    filterable: false
                }, {
                    field: 'duration',
                    title: 'Длительность',
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                eq: "Равно",
                                neq: "Не равно",
                                en: ">",
                                el: "<"
                            }
                        }
                    }
                }, {
                    field: 'starttime',
                    title: 'Начало',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'stoptime',
                    title: 'Конец',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'ringtime',
                    title: 'Время звонка',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'connecttime',
                    title: 'Время соединения',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'zoneName',
                    title: 'Зона',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'techPrefix',
                    title: 'Тех. префикс',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'countRouting',
                    title: 'Кол-во маршрутизации',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'codeName',
                    title: 'код',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'clientId',
                    title: 'Клиент ID',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'partnerId',
                    title: 'Партнер ID',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'costClient',
                    title: 'costClient',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'costPartner',
                    title: 'costPartner',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currencyClientId',
                    title: 'currencyClientId',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currencyExchangeClient',
                    title: 'currencyExchangeClient',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currencyExchangePartner',
                    title: 'currencyExchangePartner',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'currencyPartnerId',
                    title: 'currencyPartnerId',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'durationClient',
                    title: 'durationClient',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'durationPartner',
                    title: 'durationPartner',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'shemTariffClient',
                    title: 'shemTariffClient',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'shemTariffPartner',
                    title: 'shemTariffPartner',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'tariffClient',
                    title: 'tariffClient',
                    sortable: false,
                    filterable: false
                }, {
                    field: 'tariffPartner',
                    title: 'tariffPartner',
                    sortable: false,
                    filterable: false
                }],
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                sortable: {
                    mode: "multiple",
                    allowUnsort: false
                },
                scrollable: true,
                resizable: true,
                dataBound: dataBound,
            });

            /*$('#cdr-list').kendoTooltip({
                filter: "td:nth-child(2)", //,td:nth-child(3),td:nth-child(4)",
                position: "right",
                content: function (e) {
                    var period = {
                        dateBegin: that.el.find('#dateBegin').val(),
                        timeBegin: that.el.find('#timeBegin').val(),
                        dateEnd: that.el.find('#dateEnd').val(),
                        timeEnd: that.el.find('#timeEnd').val()
                    };
                    var result = "";
                    $.ajax({
                        url: app.transitServerUrl + 'cdr.php?method=get-cdr-list-stat',
                        type: 'post',
                        async: false,
                        data: {
                            period: period,
                            number: e.target.text(),
                            type: 'srcInput'
                        },
                        success: function (resp) {
                            result = resp;
                        }
                    });
                    var r = JSON.parse(result);
                    var rr = "ASR: " + r.data.list[0].asr;
                    rr = rr + " <br>Avarage duration call: " + r.data.list[0].acd;
                    rr = rr + " <br>Max duration call: " + r.data.list[0].mcd;
                    rr = rr + " <br>All calls: " + r.data.list[0].count_call;
                    return rr;
                }
            }).data('kendoTooltip');

            $('#cdr-list').kendoTooltip({
                filter: "td:nth-child(3)", //,td:nth-child(3),td:nth-child(4)",
                position: "right",
                content: function (e) {
                    var period = {
                        dateBegin: that.el.find('#dateBegin').val(),
                        timeBegin: that.el.find('#timeBegin').val(),
                        dateEnd: that.el.find('#dateEnd').val(),
                        timeEnd: that.el.find('#timeEnd').val()
                    };
                    var result = "";
                    $.ajax({
                        url: app.transitServerUrl + 'cdr.php?method=get-cdr-list-stat',
                        type: 'post',
                        async: false,
                        data: {
                            period: period,
                            number: e.target.text(),
                            type: 'srcOut'
                        },
                        success: function (resp) {
                            result = resp;
                        }
                    });
                    var r = JSON.parse(result);
                    var rr = "ASR: " + r.data.list[0].asr;
                    rr = rr + " <br>Avarage duration call: " + r.data.list[0].acd;
                    rr = rr + " <br>Max duration call: " + r.data.list[0].mcd;
                    rr = rr + " <br>All calls: " + r.data.list[0].count_call;
                    return rr;
                }
            }).data('kendoTooltip');

            $('#cdr-list').kendoTooltip({
                filter: "td:nth-child(4)", //,td:nth-child(3),td:nth-child(4)",
                position: "right",
                content: function (e) {
                    var period = {
                        dateBegin: that.el.find('#dateBegin').val(),
                        timeBegin: that.el.find('#timeBegin').val(),
                        dateEnd: that.el.find('#dateEnd').val(),
                        timeEnd: that.el.find('#timeEnd').val()
                    };
                    var result = "";
                    $.ajax({
                        url: app.transitServerUrl + 'cdr.php?method=get-cdr-list-stat',
                        type: 'post',
                        async: false,
                        data: {
                            period: period,
                            number: e.target.text(),
                            type: 'dst'
                        },
                        success: function (resp) {
                            result = resp;
                        }
                    });
                    var r = JSON.parse(result);
                    var rr = "ASR: " + r.data.list[0].asr;
                    rr = rr + " <br>Avarage duration call: " + r.data.list[0].acd;
                    rr = rr + " <br>Max duration call: " + r.data.list[0].mcd;
                    rr = rr + " <br>All calls: " + r.data.list[0].count_call;
                    return rr;
                }
            }).data('kendoTooltip');*/
        },
        getDataSource: function (serverId, period, callback) {
            var that = this;

            return new kendo.data.DataSource({
                transport: {
                    read: function (options) {
                        $.ajax({
                            url: app.wholesaleServerUrl + 'mvts.php?method=get_cdr_list',
                            type: 'post',
                            data: {
                                sort: options.data.sort,
                                skip: options.data.skip,
                                take: options.data.take,
                                period: period,
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
                        id: "cdrId",
                        fields: {
                            cdrId: {},
                            srcOut: {},
                            dst: {},
                            date: {}
                        }
                    }
                },
                autoSync: true,
                batch: true,
                sort: ({ field: "date", dir: "desc" }),
                pageSize: that.gridPageSize,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true
            });
        }
    };
    return public;
});
