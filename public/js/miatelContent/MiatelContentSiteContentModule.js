define([
    'jquery',
    'kendo',
    'util',
    'js/common/lib/codemirror',    
    'js/common/mode/php/php',    
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-site-content.html',
    'text!./templates/miatel-site-content-form.html',
    'css!./css/miatelContent',
    'css!/css/codemirror'
], function($, k, u, cm, php, common, local, contentList, contentForm) {
    
    var contentListTmpl = k.template(contentList),
        contentFormTmpl = k.template(contentForm);
    
    var public = {
        myModuleName: 'MiatelContentSiteContentModule',
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
        onClickContentAddBtn: function() {
            private.renderPopupEditor.call(this, {});
        },        
        onClickContentEditBtn: function(btn) {
            var contentId = btn.attr('data-content-id');
            
            if (!contentId) {
                return;
            }
            private.renderPopupEditor.call(this, {
                contentId: contentId
            });
        },
        onClickContentDeleteBtn: function(btn) {
            var that = this,
                contentId = btn.attr('data-content-id');
            
            if (!contentId) {
                return;
            }
            if (confirm(this.i18n.confirmDel)) {                
                $.ajax({
                    url: app.getServerApiUrl() + 'site/del-site-content',
                    data: {
                        userHash: app.getActiveUserHash(),
                        contentId: contentId
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
        onClickContentApplyBtn: function() {
            private.updateContent.call(this);
        },        
        onClickContentSaveBtn: function() {
            var that = this; 
            
            private.updateContent.call(this, function() {
                that.myWindow.close();
            });
        },
        onClickContentCancelBtn: function() {
            this.myWindow.close();
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.content-edit-btn').on('click', '.content-edit-btn', function(e) {
                that.onClickContentEditBtn.call(that, $(this));
            });
            $(document).off('click', '.content-save-btn').on('click', '.content-save-btn', function(e) {
                e.preventDefault();
                that.onClickContentSaveBtn.call(that, $(this));
            });            
            $(document).off('click', '.content-cancel-btn').on('click', '.content-cancel-btn', function(e) {
                that.onClickContentCancelBtn.call(that, $(this));                
            });      
            $(document).off('click', '.content-add-btn').on('click', '.content-add-btn', function(e) {
                that.onClickContentAddBtn.call(that, $(this));
            });             
            $(document).off('click', '.content-delete-btn').on('click', '.content-delete-btn', function(e) {
                that.onClickContentDeleteBtn.call(that, $(this));
            }); 
            $(document).off('click', '.content-apply-btn').on('click', '.content-apply-btn', function(e) {
                e.preventDefault();
                that.onClickContentApplyBtn.call(that, $(this));
            });              
        },       
        render: function() {
            var that = this,
                html = contentListTmpl({
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
            private.renderPopupWindow.call(this);
            private.renderContentGrid.call(this);                        
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
            this.el.append('<div id="site-content-popup-editor"></div>');

            this.myWindow = $('#site-content-popup-editor').kendoWindow({
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
        renderContentGrid: function() {            
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
                                url: app.getServerApiUrl() + 'site/get-site-content-list',
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
                                url: app.getServerApiUrl() + 'site/del-site-content',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    contentId: rec.contentId
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
                            id: "contentId",
                            fields: {
                                contentId: {editable: false, nullable: true},
                                contenteName: {validation: { required: true }},
                                cotentCreateDate: {}
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
                el = $('#site-content-grid');
                
            that.myGrid = el.kendoGrid({
                dataSource: getDataSource(),   
                columns: [{
                    field: 'contentId',
                    title: 'id',
                    width: 50
                },{
                    field: 'contentName',
                    title: 'Имя',
                },{    
                    field: 'contentUrl',
                    title: 'Адрес'
                },{
                    field: 'contentCreateDate',
                    title: 'Дата',                    
                },{
                    title: "&nbsp;", 
                    width: "250px" ,
                    template: function(rec) {
                        return '<button onclick="return false;" data-content-id="' + rec.contentId + '" class="k-button k-button-icontext content-edit-btn"><span class="k-icon k-edit"></span>Изменить</button>&nbsp;<button onclick="return false;" data-content-id="' + rec.contentId + '" class="k-button k-button-icontext content-delete-btn"><span class="k-icon k-delete"></span>Удалить</button>';
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
                toolbar: '<button onclick="return false;" class="k-button k-button-icontext content-add-btn"><span class="k-icon k-add"></span>Добавить</button>',
                editable: false
            }).data('kendoGrid');          
        },           
        renderPopupEditor: function(rec) {
            var that = this,
                data = $.extend(rec, {
                    userHash: app.getActiveUserHash()
                }),
                url;

            if (typeof rec.contentId != 'undefined') {
                url = app.getServerApiUrl() + 'site/get-site-content'; 
            } else {
                url = app.getServerApiUrl() + 'site/add-site-content';
            }
            $.ajax({
                url: url,
                type: 'post',
                data: data,
                success: function(resp) {
                    if (resp.success) {
                        var html = contentFormTmpl({
                            data: resp.data,
                            u: u
                        });
                        that.myWindow.content(html);        
                        $('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });    
                        $('.contentAuthor').kendoDropDownList({
                            placeholder: "Выберите автора",
                            dataTextField: "name",
                            dataValueField: "id",
                            autoBind: true,
                            valuePrimitive: false,
                            value: resp.data.contentAuthorId,
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
                        }, 300);
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
            var chEl = document.getElementById('contentHead'),
                cbEl = document.getElementById('contentBody');

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
            var w = $('#site-content-popup-editor');
            
            if (w) {
                var h = w.height();
                this.bodyHtmlEditor.setSize('100%', h - 300);
            }
        },        
        reloadGrid: function() {
            this.myGrid.dataSource.read();
            this.myGrid.refresh();
        },
        updateContent: function(callback) {
            var that = this,
                formEl = $('#site-content-form');
                data = $.extend(u.getFormValue(formEl, false), {
                    userHash: app.getActiveUserHash()
                });
                
            $.ajax({
                url: app.getServerApiUrl() + 'site/update-site-content',
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