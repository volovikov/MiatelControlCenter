define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-site-menu-form.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, menuForm) {
    
    var menuFormTmpl = k.template(menuForm);
    
    var public = {
        myModuleName: 'MiatelContentSiteMenuModule',
        myMenuItem: null,
        onClickSaveBtn: function(btn) {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    menuParentId: that.myMenuItem.menuParentId,
                    menuId: that.myMenuItem.menuId
                });

            if (this.validator.validate()) {
                u.ajaxRequest('site/update-site-menu', data, function(err, data) {
                    if (err) {
                        app.showPopupErrors(data);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('update-site-menu', data);
                    }
                });
            }
            
        },
        onClickDeleteBtn: function(btn) {
            var that = this,
                menuId = btn.attr('data-menu-id');
            
            if (!menuId) {
                return;
            }
            if (confirm(this.i18n.confirmDel)) {                
                $.ajax({
                    url: app.getServerApiUrl() + 'site/del-site-menu',
                    data: {
                        userHash: app.getActiveUserHash(),
                        menuId: menuId
                    },
                    success: function(resp) {
                        if (resp.success) {
                            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                            app.publish('del-site-menu', {
                                menuId: menuId,
                                menuParentId: that.myMenuItem.menuParentId
                            });
                        } else {
                            app.showPopupErrors(resp);
                        }
                    }
                });                
            }
        },        
        run: function(params) {
            this.el = params.el;
            this.treeId = parseInt(params.treeId) || 1; //<-- 1= root node
            this.i18n = $.extend(common, local);
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.menu-save-btn').on('click', '.menu-save-btn', function(e) {
                e.preventDefault();
                that.onClickSaveBtn.call(that, $(this));
            });
            $(document).off('click', '.menu-delete-btn').on('click', '.menu-delete-btn', function(e) {
                e.preventDefault();
                that.onClickDeleteBtn.call(that, $(this));
            });            
        },       
        render: function() {
            var that = this,
                data = {
                    menuId: this.treeId,
                    userHash: app.getActiveUserHash()
                };
             
            u.ajaxRequest('site/get-site-menu', data, function(err, data) {
                if (!err) {
                    that.myMenuItem = data;
                    
                    var html = menuFormTmpl({
                        i18n: that.i18n,
                        data: data
                    });
    
                    that.el.html(html); 
                    that.el.find('.select').kendoDropDownList();                    
                    that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }       
                        }
                    });                    
                    that.el.find('.datepicker').kendoDatePicker({
                        format: app.getDateFormat()
                    });
                    that.el.find("#menuOrderPositionId").kendoNumericTextBox();
                    that.el.find('.combobox').kendoComboBox();
                    
                    that.validator = that.el.find('.fieldlist').kendoValidator().data("kendoValidator");
                    
                    that.contentDropDownList = that.el.find('#menuContentId').kendoDropDownList({
                        placeholder: "Выберите статью",
                        dataTextField: "contentName",
                        dataValueField: "contentId",
                        autoBind: true,
                        value: data.menuContentId || 0,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'site/get-site-content-list',
                                        data: {
                                            take: -1, //<-- no limit
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {     
                                                resp.data.list.push({
                                                    contentId: 0,
                                                    contentName: 'Не выбрано'
                                                });
                                                options.success(resp.data.list);
                                            }
                                        }
                                    }); 
                                }                                
                            }
                        }
                    }).data('kendoDropDownList');    
                    
                    that.templateDropDownList = that.el.find('#menuTemplateId').kendoDropDownList({
                        placeholder: "Выберите шаблон",
                        dataTextField: "templateName",
                        dataValueField: "templateId",
                        autoBind: true,
                        value: data.menuTemplateId || 0,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'site/get-site-template-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {     
                                                resp.data.list.push({
                                                    templateId: 0,
                                                    templateName: 'Не выбрано'
                                                });
                                                options.success(resp.data.list);
                                            }
                                        }
                                    }); 
                                }                                
                            }
                        }
                    }).data('kendoDropDownList');   
                    
                    that.menuParentDrowpDownList = that.el.find('#menuParentId').kendoDropDownList({
                        placeholder: "Выберите раздел меню",
                        dataTextField: "menuName",
                        dataValueField: "menuId",
                        autoBind: true,
                        value: data.menuParentId || 1,
                        dataSource: {
                            serverFiltering: true,
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'site/get-site-menu-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
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
                    }).data('kendoDropDownList');    
                    private.renderSubmenu.call(that);
                } else {
                    app.showPopupErrors(data);
                }
            });
        },
        renderSubmenu: function() {            
            var that = this;
            
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'site/get-site-menu-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    menuParentId: that.myMenuItem.menuId
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
                                url: app.getServerApiUrl() + 'site/update-site-menu',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('update-site-menu', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];

                            $.ajax({
                                url: app.getServerApiUrl() + 'site/del-site-menu',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    id: rec.id
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);                                    
                                        app.publish('del-site-menu', {
                                            menuId: rec.menuId,
                                            menuParentId: resp.data.menuParentId
                                        });
                                    }
                                }
                            });
                        },
                        create: function(options) {
                            var data = $.extend(options.data.models[0], {
                                userHash: app.getActiveUserHash(), 
                                menuParentId: that.myMenuItem.menuId
                            });
                            $.ajax({
                                url: app.getServerApiUrl() + 'site/add-site-menu',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        data.menuId = resp.data.menuId;
                                        app.publish('add-site-menu', data);
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
                                menuId: {editable: false, nullable: true},
                                menuName: {validation: { required: true }},
                                menuParentId: {defaultValue: that.myMenuItem.menuId},
                                menuContentId: {editable: false},
                                menuContentName: {editable: false},
                                menuOrderPosition: {defaultValue: 1}
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
                el = $('#site-submenu-grid');
                
            el.kendoGrid({
                dataSource: getDataSource(),
                columns: [{
                    field: 'menuId',
                    title: 'id',
                    template: function(row) {
                        return '<a href="/#section/miatel/tree/site/site/' + row.menuId + '">' + row.menuId + '</a>';
                    },
                    width: 50
                },{
                    field: 'menuName',
                    title: 'Имя'
                },{
                    field: 'menuContentName',
                    title: 'Содержание',
                    template: function(row) {
                        if (row.menuContentId === null) {
                            return '';                            
                        } else if (row.menuContentId == 0) {
                            return '';                            
                        } else {
                            return row.menuContentName;
                        }                        
                    },
                    encoded: false 
                },{
                    field: 'menuOrderPosition',
                    title: 'Позиция'                    
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
                toolbar: ["create"],
                editable: true            
            });          
        }
    };
    return public;
});