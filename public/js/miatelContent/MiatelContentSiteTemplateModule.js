define([
    'jquery',
    'kendo',
    'util',
    'js/common/lib/codemirror',    
    'js/common/mode/php/php',    
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-site-template.html',
    'text!./templates/miatel-site-template-form.html',
    'css!./css/miatelContent',
    'css!/css/codemirror'
], function($, k, u, cm, php, common, local, templateList, templateForm) {
    
    var templateListTmpl = k.template(templateList),
        templateFormTmpl = k.template(templateForm);
    
    var public = {
        myModuleName: 'MiatelContentSiteTemplateModule',
        myWindow: null,
        myGrid: null,
        run: function(params) {
            var tmp = params.treeId.split('-');
            
            this.el = params.el;
            this.sectionId = tmp[0]; 
            this.subSectionId = tmp[1];
            this.i18n = $.extend(common, local);
            private.render.call(this);        
            private.bindEvents.call(this);                
        },
        onClickTemplateEditBtn: function(btn) {
            var templateId = btn.attr('data-template-id');
            
            if (!templateId) {
                return;
            }
            private.renderPopupEditor.call(this, {
                templateId: templateId
            });
        },
        onClickTemplateDeleteBtn: function(btn) {
            var that = this,
                templateId = btn.attr('data-template-id');
            
            if (!templateId) {
                return;
            }
            if (confirm(this.i18n.confirmDel)) {                
                $.ajax({
                    url: app.getServerApiUrl() + 'site/del-site-template',
                    data: {
                        userHash: app.getActiveUserHash(),
                        templateId: templateId
                    },
                    success: function(resp) {
                        if (resp.success) {
                            that.myWindow.close();
                            private.reloadGrid.call(that);
                        } else {
                            app.showPopupErrors(resp);
                        }
                    }
                });                
            }
        },
        onClickTemplateAddBtn: function() {
            private.renderPopupEditor.call(this, {});
        },
        onClickTemplateSaveBtn: function() {
            var that = this; 
            
            private.updateTemplaceContent.call(this, function() {
                that.myWindow.close();
            });            
        },
        onClickTemplateApplyBtn: function() {
            private.updateTemplaceContent.call(this);
        },
        onClickTemplateCancelBtn: function() {
            this.myWindow.close();
        },        
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.template-edit-btn').on('click', '.template-edit-btn', function(e) {
                that.onClickTemplateEditBtn.call(that, $(this));
            });
            $(document).off('click', '.template-save-btn').on('click', '.template-save-btn', function(e) {
                e.preventDefault();
                that.onClickTemplateSaveBtn.call(that, $(this));
            });            
            $(document).off('click', '.template-cancel-btn').on('click', '.template-cancel-btn', function(e) {
                e.preventDefault();
                that.onClickTemplateCancelBtn.call(that, $(this));                
            });      
            $(document).off('click', '.template-add-btn').on('click', '.template-add-btn', function(e) {
                that.onClickTemplateAddBtn.call(that, $(this));
            });             
            $(document).off('click', '.template-delete-btn').on('click', '.template-delete-btn', function(e) {
                that.onClickTemplateDeleteBtn.call(that, $(this));
            });                
            $(document).off('click', '.template-apply-btn').on('click', '.template-apply-btn', function(e) {
                e.preventDefault();
                that.onClickTemplateApplyBtn.call(that, $(this));
            });            
        },       
        render: function() {
            var that = this,
                html = templateListTmpl({
                i18n: this.i18n,
            });              
            this.el.html(html); 
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }       
                }
            }); 
            private.renderPopupWindow.call(this);
            private.renderTemplateGrid.call(this);                        
        },
        renderPopupWindow: function(callback) {
            var that = this;            
           
           /**
            * ВВ
            * После того, как закрыли окно, я удаляю его из DOM
            * и затем сразу его заново создаю. Создаю 
            * с visible: false
            * Иначе будет глючить codeeditor
            */
            this.el.append('<div id="site-template-popup-edito"></div>');

            this.myWindow = $('#site-template-popup-edito').kendoWindow({
                title: "Редактор",
                modal: true,
                visible: false,
                resizable: false,
                width: 800,
                iframe: true,
                actions: ["Maximize", "Close"],
                maxHeight: "120vh",
                deactivate: function() {
                    this.destroy();
                    private.renderPopupWindow.call(that);
                },
                resize: function(e) {
                    private.resizeCodeEditor.call(that);
                }                    
            }).data("kendoWindow");            
        },        
        renderTemplateGrid: function() {            
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
                                url: app.getServerApiUrl() + 'site/get-site-template-list',
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
                        destroy: function(options) {
                            var rec = options.data.models[0];

                            $.ajax({
                                url: app.getServerApiUrl() + 'site/del-site-template',
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
                            id: "templateId",
                            fields: {
                                templateId: {editable: false, nullable: true},
                                templateLanguageId: {},
                                tempalteLanguageName: {},
                                tempalteCreateDate: {},
                                templateName: {validation: { required: true }},
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
                el = $('#site-template-grid');
                
            that.myGrid = el.kendoGrid({
                dataSource: getDataSource(),   
                columns: [{
                    field: 'templateId',
                    title: 'id',
                    width: 50
                },{
                    field: 'templateName',
                    title: 'Имя',
                },{
                    field: 'templateLanguageName',
                    title: 'Язык',                    
                },{
                    field: 'templateCreateDate',
                    title: 'Дата созадния',                    
                },{                    
                    title: "&nbsp;", 
                    width: "250px" ,
                    template: function(rec) {
                        return '<button onclick="return false;" data-template-id="' + rec.templateId + '" class="k-button k-button-icontext template-edit-btn"><span class="k-icon k-edit"></span>Изменить</button>&nbsp;<button onclick="return false;" data-template-id="' + rec.templateId + '" class="k-button k-button-icontext template-delete-btn"><span class="k-icon k-delete"></span>Удалить</button>';
                    }                    
                }],
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: 'single',
                    allowUnsort: false
                },
                toolbar: '<button onclick="return false;" class="k-button k-button-icontext template-add-btn"><span class="k-icon k-add"></span>Добавить</button>',
                editable: false
            }).data('kendoGrid');          
        },           
        renderPopupEditor: function(rec) {
            var that = this,
                data = $.extend(rec, {
                    userHash: app.getActiveUserHash()
                }),
                url;

            if (typeof rec.templateId != 'undefined') {
                url = app.getServerApiUrl() + 'site/get-site-template'; 
            } else {
                url = app.getServerApiUrl() + 'site/add-site-template';
            }
            $.ajax({
                url: url,
                type: 'post',
                data: data,
                success: function(resp) {
                    if (resp.success) {
                        var html = templateFormTmpl({
                            data: resp.data,
                            u: u
                        });
                        that.myWindow.content(html); 
                                                
                        $('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });
                        $('#templateLanguageId').kendoDropDownList({
                            placeholder: "Выберите язык",
                            dataTextField: "languageName",
                            dataValueField: "languageId",
                            autoBind: true,
                            valuePrimitive: false,
                            value: resp.data.templateLanguageId,
                            dataSource: {
                                serverFiltering: true,
                                transport: {
                                    read: function(options) {
                                        $.ajax({
                                            url: app.getServerApiUrl() + 'site/get-site-language-list',
                                            data: {
                                                userHash: app.getActiveUserHash(),
                                            },
                                            type: 'post',
                                            success: function(resp) {
                                                if (resp.success) {     
                                                    options.success(resp.data.list);
                                                }
                                            }
                                        }); 
                                    }                                
                                }
                            }
                        });                        
                        that.myWindow.center().open();
                        
                        setTimeout(function() {
                            private.renderCodeEditor.call(that);                            
                        }, 400);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            });
        },
        renderCodeEditor: function() {
            var that = this;
            
            var config = {
                lineNumbers: false,
                mode: 'php',
                theme: 'default',
                autofocus: false,
            };
            var chEl = document.getElementById('templateContentHead'),
                cbEl = document.getElementById('templateContentBody');

            if (chEl != null) {
                this.headHtmlEditor = cm.fromTextArea(chEl, config);
                this.headHtmlEditor.on('change', function(cm) {
                    chEl.value = cm.getValue();
                });
                this.headHtmlEditor.setSize('100%', 100);                
            }
            if (cbEl != null) {
                this.bodyHtmlEditor = cm.fromTextArea(cbEl, config);            
                this.bodyHtmlEditor.on('change', function(cm) {
                    cbEl.value = cm.getValue();
                });                
                this.bodyHtmlEditor.setSize('100%', 250);
            }
            setTimeout(function() {
                that.headHtmlEditor.focus();   
                that.headHtmlEditor.setCursor({line: 0, ch: 0});
            }, 50);
        },
        resizeCodeEditor: function() {
            var w = $('#site-template-popup-editor');
            
            if (w) {
                var h = w.height();
                this.bodyHtmlEditor.setSize('100%', h - 300);
            }
        },
        reloadGrid: function() {
            this.myGrid.dataSource.read();
            this.myGrid.refresh();
        },
        updateTemplaceContent: function(callback) {
            var that = this,
                formEl = $('#template-form');
                data = $.extend(u.getFormValue(formEl, false), {
                    userHash: app.getActiveUserHash()
                });                
                
            $.ajax({
                url: app.getServerApiUrl() + 'site/update-site-template',
                data: data,
                success: function(resp) {
                    if (resp.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        private.reloadGrid.call(that);                        
                    } else {
                        app.showPopupErrors(resp);
                    }
                    callback && callback();
                }
            });    
        }
    };
    return public;
});