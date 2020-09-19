/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @returns {AdminContentModule_L10.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-phone-type.html',
], function($, k, u, common, local, adminPhoneType) {
    
    var adminPhoneTypeTmpl = k.template(adminPhoneType);
    
    var public = {        
        myModuleName: 'AdminContentPhoneTypeModule',
        phoneTypeMinCost: 5,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);      
            this.countryId = params.treeId.split('-')[0];
            this.cityId = params.treeId.split('-')[1];            
            this.type = params.treeId.split('-')[2];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickChangeCostBtn: function() {
            var that = this,
                value = this.el.find('.phoneTypeCost').val(),
                data = {
                    userHash: app.getActiveUserHash(),
                    cost: value,
                    countryId: this.countryId,
                    cityId: this.cityId,
                    type: this.type
                };

            if (value) {
                u.ajaxRequest('update-phone', data, function(err, resp) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);                        
                        private.reloadTable.call(that);
                    }
                });
            }
        }
    };
    var private = {
        reloadTable: function() {
            if (!this.table) {
                return;
            }
            this.table.dataSource.read();
            this.table.refresh();
        },
        bindEvents: function() {
            var that = this;

            $(document).off('click', '#phone-type-cost-form-submit-btn').on('click', '#phone-type-cost-form-submit-btn', function() {
                that.onClickChangeCostBtn.call(that);
            });
        },
        render: function() {
            var html = adminPhoneTypeTmpl({
                i18n: this.i18n,
                phoneTypeCost: this.phoneTypeMinCost
            });
            this.el.html(html);
            this.el.find('.combobox').kendoComboBox();
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });            
            private.renderTable.call(this);
        },
        renderTable: function() {
            var that = this;

            var phoneTypeDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'gold',
                            text: 'Золотой'
                        },{
                            value: 'silver',
                            text: 'Серебрянный'
                        },{ 
                            value: 'bronza',
                            text: 'Бронзовый'                    
                        },{
                            value: 'other',
                            text: 'Простой'
                        },{
                            value: 'offline',
                            text: 'Offline'
                        },{
                            value: 'private',
                            text: 'private'
                        }]
                    });
            };            
            this.table = this.el.find('#phone-type').kendoGrid({
                columns: [{ 
                    field: 'phoneId',
                    title: '№',
                    width: '60px'
                },{
                    field: 'phone',
                    title: 'Номер'                    
                },{ 
                    field: 'type',
                    title: 'Тип',
                    editor: phoneTypeDropDownEditor,
                    template: function(row) {
                        return that.i18n.phoneType[row.type];
                    }
                },{ 
                    field: 'cost',
                    title: 'Цена'
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
            })
            .data('kendoGrid');
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
                            url: app.getServerApiUrl() + 'get-phone-list',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(),
                                cityId: that.cityId,
                                countryId: that.countryId,
                                type: that.type,
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
                    update: function(options) {
                        var data = options.data.models[0];

                        $.ajax({
                            url: app.getServerApiUrl() + 'update-phone',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(),
                                phone: data.phone, //<-- not need!!
                                phoneId: data.phoneId,
                                type: data.type
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
                        if (typeof resp.data == 'undefined') {
                            private.reloadTable.call(that);
                        } else {
                            return resp.data.list || [];
                        }                        
                    },
                    model: {
                        id: "phoneId",
                        fields: {
                            phoneId: {editable: false},
                            companyOwnerId: {editable: false},
                            cost: {editable: false},
                            countryId: {editable: false},
                            phone: {editable: false},
                            cityId: {editable: false},
                            type: {defaultValue: { value: 1}}
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
    };
    return public;
});