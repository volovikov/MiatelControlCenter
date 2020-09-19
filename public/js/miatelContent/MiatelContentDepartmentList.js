define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-department-list.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, miatelDepartmentList) {
    
    var miatelDepartmentListTmpl = k.template(miatelDepartmentList);
    
    var public = {
        myModuleName: 'MiatelContentDepartmentList',
        run: function(params) {
            this.el = params.el;
            this.treeId = params.treeId;
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
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                },                
                html = miatelDepartmentListTmpl({
                    i18n: that.i18n,
                    user: data
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
            private.renderDepartmentsTable.call(this);
        },
        renderDepartmentsTable: function() {
            var that = this; 
            
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
                                url: app.getServerApiUrl() + 'member/get-department-list',
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
                        update: function(options) {
                            var value = options.data.models[0];

                            $.ajax({
                                url: app.getServerApiUrl() + 'member/update-department',
                                type: 'post',
                                data: $.extend(value, {
                                    userHash: app.getActiveUserHash()
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success({data:value});
                                        app.publish('update-department', value);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'member/del-department',
                                type: 'post',
                                data: $.extend(options.data.models[0], {
                                    userHash: app.getActiveUserHash()
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('del-department', resp.data);
                                    }
                                }
                            });                            
                        },
                        create: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'member/add-department',
                                type: 'post',
                                data: $.extend(options.data.models[0], {
                                    userHash: app.getActiveUserHash()
                                }),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('add-department', resp.data);
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
                                app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]); //<-- error params get   
                            } else if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: {editable: false, nullable: true},
                                name: {},
                                memberTotal: {editable: false},
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
            this.el.find('#department-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'name',    
                    title: 'Название'
                },{ 
                    field: 'memberTotal',
                    title: 'Кол-во сотрудников'
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
            });                   
        }        
    };
    

    
    return public;
});