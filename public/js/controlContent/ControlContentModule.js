/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} controlContent
 * @returns {ControlContentModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/controlContent.js',
    'text!./templates/control-notServed-form.html',
    'text!./templates/control-notServed-statistic.html',
    'text!./templates/control-served-form.html',
    'text!./templates/control-served-statistic.html',    
    'text!./templates/control-served-statistic-group.html',
    'css!./css/controlContent'
], function($, k, u, common, local, controlNotServedForm, controlNotServedStatistic,
controlServedForm, controlServedStatistic, controlServedStatisticGroup) {
    
    var controlNotServedFormTmpl = k.template(controlNotServedForm),
        controlNotServedStatisticTmpl = k.template(controlNotServedStatistic),
        controlServedFormTmpl = k.template(controlServedForm),
        controlServedStatisticTmpl = k.template(controlServedStatistic),
        controlServedStatisticGroupTmpl = k.template(controlServedStatisticGroup);
    
    var public = {
        myModuleName: 'ControlContentModule',
        run: function(params) {
            if (typeof params[0] != 'undefined') {
                this.treeKey = params[0].value;                
            }
            if (typeof params[1] != 'undefined') {
                this.treeId = params[1].value;
            }
            this.el = params.el;
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('windows-resize', this.myModuleName, function(size) {
                private.resize.call(that, size);
            }); 
            app.subscribe('hash-change', this.myModuleName, function(hashRec) {
                if (typeof hashRec[1] == 'undefined') {
                    that.treeKey = that.defaultTreeKey;                
                } else {
                    that.treeKey = hashRec[1].value;                
                }
                if (typeof hashRec[2] == 'undefined') {
                    that.treeId = that.defaultTreeId;
                } else {
                    that.treeId = hashRec[2].value;
                }
                private.render.call(that);
            });            
        },
        render: function() {
            var that = this;
            
            switch (this.treeKey) {
                case 'notServed':
                    return private.renderNotServedClients.call(this, this.treeId);
                    
                case 'served':
                    return private.renderServedClients.call(this, this.treeId);
                    
                case 'tasks':
                    requirejs(['js/controlContent/ControlContentTaskModule'], function(module) {
                        module.run({
                            el: that.el,
                            taskId: that.treeId
                        });                        
                    });                    
                    break;
            }
        },
        renderNotServedClients: function(treeId) {
            var html; 
            
            switch (treeId) {
                case '2':
                case '4':
                    html = controlNotServedFormTmpl({
                        i18n: this.i18n
                    });                    
                    break;
                    
                case '1':
                    html = controlNotServedStatisticTmpl({
                        i18n: this.i18n
                    });                      
                    break
            }
            this.el.html(html); 
            this.el.find('.combobox').kendoComboBox();
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });            
        },
        renderServedClients: function(treeId) {
            var html; 
            
            switch (treeId) {
                case '22':
                case '23':
                case '44':
                case '55':
                    html = controlServedFormTmpl({
                        i18n: this.i18n
                    });                    
                    break;
                    
                case '1':
                    html = controlServedStatisticTmpl({
                        i18n: this.i18n
                    });      
                    break;
                    
                case '2':
                case '4':
                case '5':
                    html = controlServedStatisticGroupTmpl({
                        i18n: this.i18n
                    });      
                    break;                    
            }            
            this.el.html(html); 
            this.el.find('.combobox').kendoComboBox();
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });
            this.el.find('#control-served-clients-grid').kendoGrid({
                columns: [{
                    field: 'innerNumber',
                    title: 'Номер' 
                },{
                    field: 'userName',    
                    title: 'Название группы' 
                },{ 
                    field: 'userEmail',
                    title: 'Кол-во' 
                },{
                    command: ["edit", "destroy"], 
                    title: "&nbsp;",
                    width: "200px"
                }],                
                dataSource: [{ 
                    innerNumber: '1', 
                    userName: 'Позвонить в течении дня' ,
                    userEmail: '3',
                },{
                    innerNumber: '2', 
                    userName: 'Ждем оплаты' ,
                    userEmail: '5',
                },{
                    innerNumber: '3', 
                    userName: 'Оплатили' ,
                    userEmail: '1',
                }],
                toolbar: ["create"],
                editable: "inline"
            });            
            this.el.find('#control-served-clients-group-grid').kendoGrid({
                columns: [{
                    field: 'innerNumber',
                    title: 'Номер' 
                },{
                    field: 'userName',    
                    title: 'Фио' 
                },{ 
                    field: 'userEmail',
                    title: 'Компания' 
                },{ 
                    field: 'contacts',
                    title: 'Контактов' 
                },{
                    command: ["edit", "destroy"], 
                    title: "&nbsp;",
                    width: "200px"
                }],                
                dataSource: [{ 
                    innerNumber: '1', 
                    userName: 'Пользователь 1' ,
                    userEmail: 'Миател',
                    contacts: 50
                },{
                    innerNumber: '1', 
                    userName: 'Пользователь 2' ,
                    userEmail: 'Миател',
                    contacts: 11
                },{
                    innerNumber: '1', 
                    userName: 'Пользователь 3' ,
                    userEmail: 'Миател',
                    contacts: 3
                }],
                toolbar: ["create"],
                editable: "inline"
            });                        
            this.el.find('#control-served-clients-group-contacts').kendoGrid({
                columns: [{
                    field: 'innerNumber',
                    title: 'id',
                    width: '50px'
                },{
                    field: 'userName',    
                    title: 'Клиент' 
                },{ 
                    field: 'userEmail',
                    title: 'Тип контакта' 
                },{ 
                    field: 'contacts',
                    title: 'Ремарка' ,
                    width: '30%'
                },{
                    command: ["edit", "destroy"], 
                    title: "&nbsp;",
                    width: "200px"
                }],                
                dataSource: [{ 
                    innerNumber: '1', 
                    userName: 'Пользователь 1' ,
                    userEmail: 'Звонок',
                    contacts: 'Позвонил. Пообщались. Сказал что еще думают. Договорились перезвонить'
                },{
                    innerNumber: '2', 
                    userName: 'Пользователь 2' ,
                    userEmail: 'E-mail',
                    contacts: 'Пришло письмо с просьбой сделать что то. Не могу сказать что'
                },{
                    innerNumber: '3', 
                    userName: 'Пользователь 5' ,
                    userEmail: 'Чат',
                    contacts: 'Переписка в чате'
                }],
                toolbar: ["create"],
                editable: "inline"
            });                                    
            this.el.find('#control-served-clients-statistic').kendoChart({
                title: {
                    text: "Количество пользователей \n в группах"
                },
                legend: {
                    visible: false
                },
                chartArea: {
                    height: 400
                },
                seriesDefaults: {
                    type: "bar"
                },
                series: [{
                    name: "Кол-во клиентов",
                    data: [3, 5, 1]
                }],
                valueAxis: {
                    max: 10,
                    line: {
                        visible: false
                    },
                    minorGridLines: {
                        visible: true
                    },
                    labels: {
                        rotation: "auto"
                    }
                },
                categoryAxis: {
                    categories: ["Позвонить в течении дня", "Ждем оплаты", "Оплатили"],
                    majorGridLines: {
                        visible: false
                    }
                },
                tooltip: {
                    visible: true,
                    template: "#= series.name #: #= value #"
                }
            });             
        },        
        resize: function(size) {
            var offset = 250,
                w = parseInt(size.w) - 498;

            this.el.css('width', w);
            this.el.find('.main-content-wrapper').css('height', size.h-offset-17);
            //this.el.find('.fieldlist').css('height', size.h-offset-56);
        }
    };
    return public;
});