define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-whitelist-statistic.html',
    'css!./css/transitContent'
], function ($, k, u, common, local, statisticPage) {

    var statisticPageTmpl = k.template(statisticPage);

    var public = {
        myModuleName: 'TransitWhiteListModule',
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
        },
        onClickRedrawBtn1: function () {
            var period = {
                dateBegin: this.el.find('#dateBegin1').val(),
                timeBegin: this.el.find('#timeBegin1').val(),
                dateEnd: this.el.find('#dateEnd1').val(),
                timeEnd: this.el.find('#timeEnd1').val(),
            };
            private.redraw1.call(this, this.treeId, period);
        }
    };
    var private = {
        bindEvents: function () {
            var that = this;


        },
        redraw: function (serverId, period) {
            var that = this;

            private.getDataSource.call(this, serverId, period, function (data) {
                private.renderWhiteListStatistics.call(that, data);
            });
        },
        redraw1: function (serverId, period) {
            var that = this;

            private.getDataSource1.call(this, serverId, period, function (data) {
                private.renderWhiteListStatisticsNumber.call(that, data);
            });
        },
        render: function () {
            var that = this;
            var html = statisticPageTmpl({
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
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-whitelist-stat',
                data: {
                    period: that.defaultPeriod
                },
                type: 'post',
                success: function (resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {

                        that.el.find('#whitelist-statistic-toolbar').kendoToolBar({
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
                                    text: that.i18n.transit.getStatistics,
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
                        private.renderWhiteListStatistics.call(that, r.data.list);
                    } else {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }
                }
            });
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-whitelist-stat-number',
                data: {
                    period: that.defaultPeriod
                },
                type: 'post',
                success: function (resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        that.el.find('#whitelist-statistic-number-toolbar').kendoToolBar({
                            items: [{
                                    template: '<input class="datePicker1" id="dateBegin1" value="' + that.defaultPeriod.dateBegin + '"/>',
                                    overflow: 'never'
                                }, {
                                    template: '<input class="timePicker1" id="timeBegin1" value="' + that.defaultPeriod.timeBegin + '"/>',
                                    overflow: 'never'
                                }, {
                                    type: 'separator'
                                }, {
                                    template: '<input class="datePicker1" id="dateEnd1" value="' + that.defaultPeriod.dateEnd + '"/>',
                                    overflow: 'never'
                                }, {
                                    template: '<input class="timePicker1" id="timeEnd1" value="' + that.defaultPeriod.timeEnd + '"/>',
                                    overflow: 'never'
                                }, {
                                    type: 'button',
                                    icon: 'refresh',
                                    text: that.i18n.transit.getStatistics,
                                    click: function () {
                                        that.onClickRedrawBtn1.call(that);
                                    }
                                }]
                        });
                        that.el.find(".datePicker1").kendoDatePicker({
                            depth: 'month',
                            format: 'yyyy-MM-dd'
                        });
                        that.el.find(".timePicker1").kendoTimePicker({
                            format: 'HH:mm'
                        });
                        private.renderWhiteListStatisticsNumber.call(that, r.data.list);
                    } else {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }
                }
            });
        },
        renderWhiteListStatistics: function (data) {
            var that = this;

            var getSeries = function () {
                var series = [{
                        name: 'allCalls',
                        data: []
                    }, {
                        name: 'nonhit',
                        data: []
                    }, {
                        name: 'hit',
                        data: []
                    }];
                for (var i in data) {
                    var rec = data[i];

                    for (var j in series) {
                        var s = series[j];
                        s.data.push(rec[s.name]);
                    }
                }
                return series;
            };
            var getCategories = function () {
                var cat = [];

                for (var i in data) {
                    var rec = data[i];
                    tmp = rec.date == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.date.split(' ')[1].split(':'),
                            time = tmp[0] + ':' + tmp[1]; //<-- time without sec

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#whitelist-statistic').kendoChart({
                transition: false,
                title: {
                    position: "top",
                    text: "График эффективности работы белых списков"
                },
                legend: {
                    position: "bottom"
                },
                seriesDefaults: {
                    type: "area",
                    area: {
                        line: {
                            style: "smooth"
                        }
                    }
                },
                series: getSeries(),
                valueAxis: {
                    labels: {
                        format: "{0}"
                    },
                    line: {
                        visible: false
                    },
                    axisCrossingValue: -10
                },
                categoryAxis: {
                    categories: getCategories(),
                    majorGridLines: {
                        visible: false
                    },
                    labels: {
                        rotation: 90
                    }
                },
                chartArea: {
                    height: 400
                },
                tooltip: {
                    visible: true,
                    format: "{0}",
                    template: "#= series.name #: #= value # "
                }
            });
        },
        renderWhiteListStatisticsNumber: function (data) {
            var that = this;

            var getSeries = function () {
                var series = [{
                        name: 'new Number',
                        data: []
                    }];
                for (var i in data) {
                    var rec = data[i];

                    for (var j in series) {
                        var s = series[j];
                        s.data.push(rec['newCount']);
                    }
                }
                return series;
            };
            var getCategories = function () {
                var cat = [];

                for (var i in data) {
                    var rec = data[i];
                    tmp = rec.date == "" ? "0000-00-00 00:00:00".split(' ')[1].split(':') : rec.date.split(' ')[1].split(':'),
                            time = tmp[0] + ':' + tmp[1]; //<-- time without sec

                    cat.push(time);
                }
                return cat;
            };
            that.el.find('#whitelist-statistic-number').kendoChart({
                transition: false,
                title: {
                    position: "top",
                    text: "График добавления номеров в белый список"
                },
                legend: {
                    position: "bottom"
                },
                seriesDefaults: {
                    type: "area",
                    area: {
                        line: {
                            style: "smooth"
                        }
                    }
                },
                series: getSeries(),
                valueAxis: {
                    labels: {
                        format: "{0}"
                    },
                    line: {
                        visible: false
                    },
                    axisCrossingValue: -10
                },
                categoryAxis: {
                    categories: getCategories(),
                    majorGridLines: {
                        visible: false
                    },
                    labels: {
                        rotation: 90
                    }
                },
                chartArea: {
                    height: 400
                },
                tooltip: {
                    visible: true,
                    format: "{0}",
                    template: "#= series.name #: #= value # "
                }
            });
        },
        getDataSource: function (serverId, period, callback) {
            var that = this;

            if (!serverId) {
                return;
            }
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-whitelist-stat',
                type: 'post',
                data: {
                    period: period
                },
                success: function (resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        callback(r.data.list);
                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        },
        getDataSource1: function (serverId, period, callback) {
            var that = this;

            if (!serverId) {
                return;
            }
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-whitelist-stat-number',
                type: 'post',
                data: {
                    period: period
                },
                success: function (resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        callback(r.data.list);
                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        }
    };
    return public;
});