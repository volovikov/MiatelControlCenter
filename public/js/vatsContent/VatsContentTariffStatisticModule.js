define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-tariff-statistic.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsTariffStatistic) {
    
    var vatsTariffStatisticTmpl = k.template(vatsTariffStatistic);
    
    var public = {        
        myModuleName: 'VatsContentTariffStatisticModule',
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
          
            app.subscribe('update-tariff', that.myModuleName, function() {
                that.chart.dataSource.read();
                that.chart.refresh();
            });
        },
        render: function() {
            var that = this;
            
            html = vatsTariffStatisticTmpl({
                i18n: that.i18n
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
            private.renderTariffTable.call(this);
            private.renderStatistics.call(this);
        },
        getDataSource: function() {
            var that = this; 

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
                            url: app.getServerApiUrl() + 'get-tariff-list',
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
                                    options.success(resp);
                                } else {
                                    options.error();
                                }
                            }
                        });
                    },
                    update: function(options)  {
                        $.ajax({
                            url: app.getServerApiUrl() + 'update-tariff',
                            type: 'post',
                            data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('update-tariff', resp.data);
                                }
                            }
                        });                        
                    },
                    destroy: function(options) {
                        $.ajax({
                            url: app.getServerApiUrl() + 'del-tariff',
                            type: 'post',
                            data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('del-tariff', resp.data.id);
                                }
                            }
                        }); 
                    },
                    create: function(options) {
                        $.ajax({
                            url: app.getServerApiUrl() + 'add-tariff',
                            type: 'post',
                            data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('add-tariff', resp.data);
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
                            mvtsRatePlanId: {},
                            color: {defaultValue: {text: 'red'}},
                            name: {},
                            descr: {},
                            cost: {},
                            active: {defaultValue: {value: 1}}
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: app.getGridPageSize(),                
                serverPaging: true,
                serverSorting: true
            });              
        },                        
        renderStatistics: function() {
            var that = this;
            
            this.chart = this.el.find('#vats-tariff-statistic').kendoChart({
                title: {
                    position: "bottom",
                    text: "Количество компаний по тарифам"
                },
                legend: {
                    visible: false
                },
                chartArea: {
                    background: "",
                    height: 400
                },
                //seriesColors: ['#9de219', '#90cc38', '#068c35', '#006634', '#004d38', '#033939'],
                seriesDefaults: {
                    labels: {
                        visible: true,
                        background: "transparent",
                        position: "outsideEnd",
                        template: "#= category # - #= kendo.format('{0:P}', percentage)#",
                    },
                    type: 'pie',
                    overlay: {
                        gradient: 'none'
                    }
                },
                series: [{
                    field: 'quantityUse',
                    categoryField: 'name',
                    colorField: 'color'
                }],
                dataSource: private.getDataSource.call(that),
                tooltip: {
                    visible: true,
                    template: "#= category # - #= kendo.format('{0:P}', percentage) #"
                }
            }).data('kendoChart');             
        },
        renderTariffTable: function() {
            var that = this;
            
            var selectColorDropDownEditor = function(container, options) {
                $('<input required data-text-field="value" data-value-field="text" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'white',
                            value: 'Белый'
                        },{
                            text: 'orange',
                            value: 'Оранжевый'
                        },{
                            text: 'yellow',
                            value: 'Желтый'
                        },{
                            text: 'green',    
                            value: 'Зеленый'
                        },{
                            text: 'red',
                            value: 'Красный'
                        }]
                    });
            };            
            var selectActiveDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Активный',
                            value: '1'
                        },{
                            text: 'Не активный',
                            value: '0'
                        }]
                    });
            };                        
            var mvtsTariffDropDownEditor = function(container, options) {
                    $('<input required data-text-field="name" data-value-field="id" data-bind="value:' + options.field + '"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            autoBind: true,
                            dataSource: {
                                transport: {
                                    read: function(options) {
                                        $.ajax({
                                            url: app.voiceipServerUrl + 'proxy.php?method=get-mvts-tariff-list',
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
                            }                            
                        });
            };            
            this.el.find('#vats-tariff-grid').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px',
                    template: function(row) {
                        return '<a href="#section/vats/tree/tariff/tariff/'+ row.id +'">' + row.id + '</a>';
                    }
                },{
                    field: 'mvtsRatePlanId',
                    title: 'Вн.тариф',
                    editor: mvtsTariffDropDownEditor
                },{
                    field: 'color',    
                    title: 'Цвет',
                    //editor: selectColorDropDownEditor,
                    template: function(row) {
                        return '<div style="background-color:' + row.color +'; text-align: center; height: 21px; line-height: 21px;">' + row.color + '</div>';                        
                    }
                },{ 
                    field: 'name',
                    title: 'Название'
                },{ 
                    field: 'cost',
                    title: 'Цена'
                },{ 
                    field: 'active',
                    title: 'Активен',
                    editor: selectActiveDropDownEditor,
                    template: function(row) {
                        if (row.active == '1') {
                            return 'Активен'
                        } else {
                            return 'Не активен';
                        }
                    }
                },{
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "90px"
                }],                
                dataSource: private.getDataSource.call(this),
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