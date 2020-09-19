define([
    'jquery',
    'kendo',
    'util',
    'js/common/lib/codemirror',    
    'js/common/mode/php/php',    
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-site-news.html',
    'text!./templates/miatel-site-news-form.html',
    'css!./css/miatelContent',
    'css!/css/codemirror'
], function($, k, u, cm, php, common, local, newsList, newsForm) {
    
    var newsListTmpl = k.template(newsList),
        newsFormTmpl = k.template(newsForm);
    
    var public = {
        myModuleName: 'MiatelContentSiteNewsModule',
        myWindow: null,
        myGrid: null,
        run: function(params) {
            var tmp = params.treeId.split('-');
            
            this.el = params.el;
            this.sectionId = tmp[0]; 
            this.subSectionId = tmp[1];
            this.i18n = $.extend(common, local);
            private.bindEvents.call(this);
            private.render.call(this);            
        },
        onClickNewsEditBtn: function(btn) {
            var newsId = btn.attr('data-news-id');
            
            if (!newsId) {
                return;
            }
            private.renderPopupEditor.call(this, {
                newsId: newsId
            });
        },
        onClickNewsDeleteBtn: function(btn) {
            var that = this,
                newsId = btn.attr('data-news-id');
            
            if (!newsId) {
                return;
            }
            if (confirm(this.i18n.confirmDel)) {
                $.ajax({
                    url: app.getServerApiUrl() + 'site/del-site-news',
                    data: {
                        userHash: app.getActiveUserHash(),
                        newsId: newsId
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
        onClickNewsAddBtn: function() {
            private.renderPopupEditor.call(this, {});
        },
        onClickNewsSaveBtn: function() {
            var that = this,
                formEl = $('#site-news-form');
                data = $.extend(u.getFormValue(formEl, false), {
                    userHash: app.getActiveUserHash()
                });                
            
            $.ajax({
                url: app.getServerApiUrl() + 'site/update-site-news',
                data: data,
                success: function(resp) {
                    if (resp.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        that.myWindow.close();
                        private.reloadGrid.call(that);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            });            
        },
        onClickNewsCancelBtn: function() {
            this.myWindow.close();
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.news-edit-btn').on('click', '.news-edit-btn', function(e) {
                that.onClickNewsEditBtn.call(that, $(this));
            });
            $(document).off('click', '.news-save-btn').on('click', '.news-save-btn', function(e) {
                e.preventDefault();
                that.onClickNewsSaveBtn.call(that, $(this));
            });            
            $(document).off('click', '.news-cancel-btn').on('click', '.news-cancel-btn', function(e) {
                e.preventDefault();
                that.onClickNewsCancelBtn.call(that, $(this));                
            });      
            $(document).off('click', '.news-add-btn').on('click', '.news-add-btn', function(e) {
                that.onClickNewsAddBtn.call(that, $(this));
            });             
            $(document).off('click', '.news-delete-btn').on('click', '.news-delete-btn', function(e) {
                that.onClickNewsDeleteBtn.call(that, $(this));
            });    
        },       
        render: function() {
            var html = newsListTmpl({
                i18n: this.i18n
            });              
            this.el.html(html); 
            this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }       
                }
            }); 
            this.el.find('.datepicker').kendoDatePicker({
                format: app.getDateTimeFormat()
            });             
            private.renderPopupWindow.call(this) ;
            private.renderNewsGrid.call(this);                        
        },
        renderPopupWindow: function() {
            var that = this; 
            
            this.el.append('<div id="site-news-popup-editor"></div>');
            
            this.myWindow = this.el.find("#site-news-popup-editor")
                .kendoWindow({
                    title: "Редактор",
                    modal: true,
                    visible: false,
                    resizable: true,
                    width: 800,
                    iframe: true,
                    maxHeight: "120vh",
                    deactivate: function() {
                        this.destroy();
                        private.renderPopupWindow.call(that);
                    }
                }).data("kendoWindow");            
        },
        renderNewsGrid: function() {            
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
                                url: app.getServerApiUrl() + 'site/get-site-news-list',
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
                                url: app.getServerApiUrl() + 'site/del-site-news',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    newsId: rec.newsId
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);                                    
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
                            id: "newsId",
                            fields: {
                                newsId: {editable: false, nullable: true},
                                newsName: {validation: { required: true }},
                                newsCreateDate: {},
                                newsSection: {defaultValue: 'Сервисы АТС'}
                            }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                  
                    serverPaging: true,
                    serverSorting: true
                });  
            };
            var that = this,
                el = $('#site-news-grid');
                
            that.myGrid = el.kendoGrid({
                dataSource: getDataSource(),   
                columns: [{
                    field: 'newsId',
                    title: 'id',
                    width: 50
                },{
                    field: 'newsName',
                    title: 'Имя',
                },{   
                    field: 'newsCreateDate',
                    title: 'Дата'
                },{   
                    field: 'newsSection',
                    title: 'Раздел'                    
                },{
                    title: "&nbsp;", 
                    width: "250px" ,
                    template: function(rec) {
                        return '<button onclick="return false;" data-news-id="' + rec.newsId + '" class="k-button k-button-icontext news-edit-btn"><span class="k-icon k-edit"></span>Изменить</button>&nbsp;<button onclick="return false;" data-news-id="' + rec.newsId + '" class="k-button k-button-icontext news-delete-btn"><span class="k-icon k-delete"></span>Удалить</button>';
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
                toolbar: '<button onclick="return false;" class="k-button k-button-icontext news-add-btn"><span class="k-icon k-add"></span>Добавить</button>',
                editable: false
            }).data('kendoGrid');          
        },           
        renderPopupEditor: function(rec) {
            var that = this,
                data = $.extend(rec, {
                    userHash: app.getActiveUserHash()
                }),
                url;

            if (typeof rec.newsId != 'undefined') {
                url = app.getServerApiUrl() + 'site/get-site-news'; 
            } else {
                url = app.getServerApiUrl() + 'site/add-site-news';
            }
            $.ajax({
                url: url,
                type: 'post',
                data: data,
                success: function(resp) {
                    if (resp.success) {
                        var html = newsFormTmpl({
                            data: resp.data,
                            u: u
                        });
                        that.myWindow.content(html);        
                        $('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });    
                        $('.combobox').kendoComboBox();
                        $('#newsAuthorId').kendoDropDownList({
                            placeholder: "Выберите автора",
                            dataTextField: "name",
                            dataValueField: "id",
                            autoBind: true,
                            valuePrimitive: false,
                            value: resp.data.newsAuthorId,
                            dataSource: {
                                serverFiltering: true,
                                transport: {
                                    read: function(options) {
                                        $.ajax({
                                            url: app.getServerApiUrl() + 'member/get-member-list',
                                            data: {
                                                userHash: app.getActiveUserHash(),
                                                departmentId: 0
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
            var chEl = document.getElementById('newsIntro'),
                cbEl = document.getElementById('newsContent');

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
        reloadGrid: function() {
            this.myGrid.dataSource.read();
            this.myGrid.refresh();
        }
    };
    return public;
});