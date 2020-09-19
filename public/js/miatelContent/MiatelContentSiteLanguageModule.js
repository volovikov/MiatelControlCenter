define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-site-language.html',
    'css!./css/miatelContent',
], function($, k, u, common, local, language) {
    
    var languageTmpl = k.template(language);
    
    var public = {
        myModuleName: 'MiatelContentSiteLanguageModule',
        run: function(params) {
            var tmp = params.treeId.split('-');
            
            this.el = params.el;
            this.sectionId = tmp[1]; 
            this.subSectionId = tmp[0];
            this.i18n = $.extend(common, local);
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
        },       
        render: function() {
            var html = languageTmpl({
                i18n: this.i18n
            });
            this.el.html(html); 
            this.el.find('.combobox').kendoComboBox();
            this.el.find('.select').kendoDropDownList();                    
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }       
                }
            });                    
            this.el.find('.datepicker').kendoDatePicker({
                format: app.getDateFormat()
            });   
            private.renderLanguageGrid.call(this);
        },        
        renderLanguageGrid: function() {            
            var getDataSource = function() {
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
                                url: app.getServerApiUrl() + 'site/get-site-language-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
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
                            var data = $.extend(options.data.models[0], {
                                userHash: app.getActiveUserHash() 
                            });
                            $.ajax({
                                url: app.getServerApiUrl() + 'site/update-site-language',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('update-site-language', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];

                            $.ajax({
                                url: app.getServerApiUrl() + 'site/del-site-language',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    id: rec.id
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);                                    
                                        app.publish('del-site-language', {
                                            id: rec.id,
                                            parentMenuId: resp.data.parentMenuId,
                                            userHash: app.getActiveUserHash()
                                        });
                                    }
                                }
                            });
                        },
                        create: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'site/add-site-language',
                                type: 'post',
                                data: $.extend(options.data.models[0], {
                                    userHash: app.getActiveUserHash(), 
                                    parentMenuId: that.treeId
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('add-site-language', resp.data);
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
                                languageId: {editable: false, nullable: true},
                                languageName: {validation: { required: true }},
                                languageKey: {validation: { required: true }},
                            }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                  
                    serverPaging: false,
                    serverSorting: false
                });  
            };
            var that = this,
                el = $('#site-language-grid');
                
            el.kendoGrid({
                dataSource: getDataSource(),   
                columns: [{
                    field: 'languageId',
                    title: 'id',
                    width: 50
                },{
                    field: 'languageName',
                    title: 'Имя',
                },{
                    field: 'languageKey',
                    title: 'key',
                },{
                    field: 'languageOrderPosition',
                    title: 'Позиция',                    
                }],
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                //toolbar: ["create"],
                editable: false
            });          
        },        
    };
    return public;
});