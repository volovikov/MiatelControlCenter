define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-department.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, miatelDepartment) {
    
    var miatelDepartmentTmpl = k.template(miatelDepartment);
    
    var public = {
        myModuleName: 'MiatelContentDepartment',
        defaultRole: 'Менеджер',
        defaultPosition: 'Менеджер',
        run: function(params) {
            var that = this,
                data = {
                    id: params.treeId,
                    userHash: app.getActiveUserHash()
                };
            
            this.el = params.el;
            this.departmentId = params.treeId;
            this.i18n = $.extend(common, local);            
            
            u.ajaxRequest('member/get-department', data, function(err, data) {
                if (!err) {
                    that.departmentName = data && data.name || '';
                } else {
                    app.showPopupError(data);
                }
            });
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

        },
        reloadTable: function() {
            if (!this.table) {
                return;
            }
            this.table.dataSource.read();
            this.table.refresh();
        },        
        render: function() {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                },                
                html = miatelDepartmentTmpl({
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
            private.renderDepartmentsMemberTable.call(this);
        },
        renderDepartmentsMemberTable: function() {
            var that = this; 

            var memberBirthDayEditor = function(container, options) {
                $('<input name="birthday" required data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDatePicker({
                        culture: "ru-RU",
                        format: 'yyyy-MM-dd'                        
                    });
            };
            var memberPositionDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'Директор',
                            text: 'Директор'
                        },{
                            value: 'Руководитель отдела',
                            text: 'Руководитель отдела'
                        },{ 
                            value: 'Инженер',
                            text: 'Инженер'                    
                        },{
                            value: 'Менеджер',
                            text: 'Менеджер'
                        }]
                    });                
            };
            var memberRoleDropDownEditor = function(container, options) {
                $('<input data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        multiple: true,                        
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'member/get-role-list',
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
                    }).data('kendoMultiSelect');                
            };
            var memberAccessDropDownEditor = function(container, options) {
                $('<input data-text-field="name" data-value-field="id" data-bind="value:sectionAccessCode"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        multiple: true,                        
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'get-mcc-section-tree',
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
                            },
                            group: {field: 'section'},
                        }                        
                    }).data('kendoMultiSelect');
            };
            var memberDepartmentDropDownEditor = function(container, options) {
                $('<input required data-text-field="name" data-value-field="id" data-bind="value:departmentId"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'member/get-department-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {
                                                options.success(resp.data.list);
                                            } else {
                                                app.showPopupErrors(resp.data.errors);
                                            }                                                   
                                        }
                                    }); 
                                }
                            }
                        }                        
                    }).data('kendoDropDownList');
            };
            var getDataSource = function() {
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
                                url: app.getServerApiUrl() + 'member/get-member-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    departmentId: that.departmentId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                    } else {
                                        app.showPopupErrors(resp);
                                    }
                                }
                            });
                        },
                        update: function(options) {
                            var value = options.data.models[0],
                                data = $.extend(value, {
                                    userHash: app.getActiveUserHash(),
                                    birthday: u.getTimeFormatStr(value.birthday)
                                });
                                
                            $.ajax({
                                url: app.getServerApiUrl() + 'member/update-member',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {      
                                        options.success({data:data});
                                        
                                        if (data.departmentId != that.departmentId) {
                                            app.publish('del-member', {
                                                departmentId: that.departmentId,
                                                id: value.id
                                            });
                                            app.publish('add-member', {
                                                departmentId: data.departmentId,
                                                id: data.id,
                                                name: data.name
                                            });                                            
                                            private.reloadTable.call(that);
                                        } else {
                                            app.publish('update-member', data);
                                        }                                                                                
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            var value = options.data.models[options.data.models.length-1]; //<-- last rec
                
                            $.ajax({
                                url: app.getServerApiUrl() + 'member/del-member',
                                type: 'post',
                                data: $.extend(value, {
                                    userHash: app.getActiveUserHash()
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        app.publish('del-member', value);
                                        private.reloadTable.call(that);
                                    }
                                }
                            });                            
                        },
                        create: function(options) {
                            var value = {
                                departmentId: that.departmentId
                            };                            
                            $.ajax({
                                url: app.getServerApiUrl() + 'member/add-member',
                                type: 'post',
                                data: $.extend(value, {
                                    userHash: app.getActiveUserHash()
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        delete value.userHash;
                                        
                                        value = $.extend(value, {
                                            id: resp.data.id,
                                            name: '',
                                            departmentName: that.departmentName
                                        });
                                        options.success({data:value});
                                        app.publish('add-member', value);
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
                            if (typeof resp.data.list != 'undefined') {
                                return resp.data.list;
                            } else {
                                return resp.data;
                            }
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: {editable: false, nullable: true},
                                name: {},
                                login: {},
                                email: {},
                                birthday: {type: 'date',  format: '{0:yyyy-MM-dd}'},
                                position: {defaultValue: {text: that.defaultPosition}},
                                role: {defaultValue: {text: that.defaultRole}},
                                sectionAccessCode: {},
                                departmentId: {defaultValue: {value:that.departmentId}},
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
            this.table = this.el.find('#department-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'name',    
                    title: 'Название'
                },{ 
                    field: 'login',
                    title: 'login'
                }, {
                    field: 'email',
                    title: 'email'
                },{
                    field: 'innerPhoneNumber',
                    title: 'Вн.номер'
                },{
                    field: 'birthday',
                    title: 'День рожд.',
                    format: '{0:yyyy-MM-dd}',
                    editor: memberBirthDayEditor
                },{
                    field: 'position',
                    title: 'Должность',
                    editor: memberPositionDropDownEditor,
                    template: function(v) {
                        if (!v.position) {
                            return '';
                        } else if (typeof v.position == 'string') {
                            return v.position;
                        } else {
                            return v.position.text;
                        }
                    }
                },{ 
                    field: 'role',
                    title: 'Роль',
                    template: function(v) {
                        if (!v.role) {
                            return '';
                        } else if (typeof v.role == 'string') {
                            return v.role;
                        } else {
                            var html = [];
                            
                            v.role.forEach(function(e) {
                                html.push(e.text);
                            });
                            return html.join(',');
                        }
                    },
                    editor: memberRoleDropDownEditor
                },{
                    field: 'sectionAccessCode',
                    title: 'Доступ',
                    template: function(v) {
                        var html = [],
                            elem = v.sectionAccessCode || [];

                        elem.forEach(function(e) {
                            html.push(e.name);
                        });        
                        return html.join(',');
                    },
                    editor: memberAccessDropDownEditor
                },{ 
                    field: 'departmentId',
                    title: 'Отдел',
                    template: function(v) {
                        return v.departmentName;
                    },
                    editor: memberDepartmentDropDownEditor
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
                }],                
                dataSource: getDataSource(),
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
        }        
    };
    return public;
});