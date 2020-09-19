define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-task-form.html',
    'text!./templates/miatel-task-form-group.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, miatelTaskForm, miatelTaskGroupForm) {
    
    var miatelTaskTmpl = k.template(miatelTaskForm),
        miatelTaskGroupTmpl = k.template(miatelTaskGroupForm);
    
    var public = {
        myModuleName: 'MiatelContentTaskModule',
        mySectionName: 'miatel',
        taskInfo: null,
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);                        
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickSaveBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.taskId
                });

            if (this.validator.validate()) {
                u.ajaxRequest('task/update-task', data, function(err, data) {
                    if (err) {
                        app.showPopupErrors(data);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    }
                });
            }
        },
        onClickDeleteBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.taskId
                });
                
            if (confirm(this.i18n.confirmDel)) {
                u.ajaxRequest('task/del-task', data, function(err, resp) {
                    if (err) {
                        app.showPopupMsg('good', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('del-task', {
                            id: data.id,
                            parentTaskId: resp.parentTaskId,
                            userHash: app.getActiveUserHash()
                        });
                        window.location.hash = '#section/' + that.mySectionName + '/tree/tasks/task/' + data.parentTaskId;
                    }
                });    
            }
        },
        onUpdateFormValue: function(data) {
            var formEl = this.el.find('form'),
                disabledElems = ['select[name="status"]', 'select[name="complete"]'],
                disabledControl = ['button.btn-save', 'button.btn-delete'],
                enableStatus = true;

            if (typeof data.taskInspectorId != 'undefined') {
                data.taskInspectorId = data.taskInspectorId.split(',');
            }            
            if (formEl) {
                u.setFormValue(formEl, data);
            }
            if (data.hasChildren == '1') {
                enableStatus = false;
            }
            if (data.status == 'Закрыта') {
                for (var i in disabledControl) {
                    var el = $(disabledControl[i]);
                    el.attr('disabled', 'disabled');
                };
            }  else {
                for (var i in disabledControl) {
                    var el = $(disabledControl[i]);
                    el.removeAttr('disabled');
                }; 
            }   
            for (var i in disabledElems) {
                var el = formEl.find(disabledElems[i]),
                    widget = kendo.widgetInstance($(el));

                if (widget) {
                    widget.enable(enableStatus);
                }
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.btn-save').on('click', '.btn-save', function(e) {
                e.preventDefault();
                that.onClickSaveBtn.call(that);
            });
            $(document).off('click', '.btn-delete').on('click', '.btn-delete', function(e) {
                e.preventDefault();
                that.onClickDeleteBtn.call(that);
            });     
            app.subscribe('update-task', this.myModuleName, function(data) {
                if (data.id == that.taskId) {
                    that.onUpdateFormValue.call(that, data);
                }
            });
        },        
        render: function() {
            var that = this,
                data = {
                    taskId: this.taskId,
                    userHash: app.getActiveUserHash()
                };

            u.ajaxRequest('task/get-task', data, function(err, data) {
                if (!err && typeof data != 'undefined') {
                    that.task = data;

                    private.getMiatelMemberList.call(that, function(userList) {
                        var html; 
                        
                        that.userList = userList;
                        that.taskInfo = data;
                        data.taskInspectorId = data.taskInspectorId.split(',');
                        
                        if (data.hasChildren) {
                            html = miatelTaskGroupTmpl({
                                i18n: that.i18n,
                                data: data,
                                userList: userList,
                                inspectorList: userList
                            });                            
                        } else {
                            html = miatelTaskTmpl({
                                i18n: that.i18n,
                                data: data,
                                userList: userList,
                                inspectorList: userList
                            });                            
                        }                        
                        that.el.html(html);                        
                        that.el.find('.tabstrip').kendoTabStrip({
                            animation:{
                                open: {effects: 'fadeIn'}
                            }
                        });
                        that.el.find('.combobox').kendoComboBox();
                        that.el.find('.miltiple-combobox').kendoMultiSelect({
                            tagMode: 'multiple'
                        });
                        that.el.find('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });     
                        that.el.find('#parentTask').kendoComboBox({
                            placeholder: "Выберите задачу",
                            dataTextField: "subject",
                            dataValueField: "id",
                            filter: "endswith",
                            suggest: true,
                            autoBind: false,
                            minLength: 3,
                            dataSource: {
                                serverFiltering: true,
                                transport: {
                                    read: function(options) {
                                        var q;

                                        if (options.data.filter) {
                                            if (typeof options.data.filter == 'object' && options.data.filter.filters.length > 0) {
                                                q = options.data.filter.filters[0].value;
                                            } else {
                                                return options.error();
                                            }                                            
                                        } else {
                                            return options.error();
                                        }
                                        $.ajax({
                                            url: app.getServerApiUrl() + 'task/get-task-list',
                                            data: {
                                                userHash: app.getActiveUserHash(),
                                                q: q
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
                        }).data('kendoComboBox');
                        
                        that.validator = that.el.find('.fieldlist').kendoValidator().data("kendoValidator");
                        
                        private.renderSubtaskGrid.call(that);
                        private.renderCommentList.call(that);
                        private.renderHistoryList.call(that);
                        
                        if (data.hasChildren) {
                            private.renderReport.call(that);
                        }
                    });
                }
            });
        },
        renderHistoryList: function() {
            var that = this,
                el = $('#miatel-task-history-list'),
                data = {
                    taskId: this.taskId,
                    userHash: app.getActiveUserHash()
                };

            el.kendoGrid({
                dataSource: {
                    transport: {
                        read: function(options) {
                            $.ajax({
                                url: app.getServerApiUrl() + 'task/get-task-history-list',
                                type: 'post',
                                data: data,
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
                        },                        
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
                            id: 'id',
                            fields: {
                                id: {},
                                changeDate: {},
                                changeMessage: {},                            
                            }
                        }
                    },   
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),
                    serverPaging: false,
                    serverSorting: false,                       
                },
                height: 300,
                scrollable: true,  
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                sortable: true,
                columns: [{
                    field: 'id',
                    title: 'id',
                    width: 50
                },{
                    field: 'changeDate',
                    title: 'Дата',
                    width: 140  
                },{
                    field: 'changeMessage',
                    title: 'Сообщение',
                    encoded: false 
                }]
            });          
        },
        renderCommentList: function() {
            var that = this,
                el = $('#miatel-task-comment-list');
            
            requirejs(['js/miatelContent/MiatelContentTaskCommentModule'], function(module) {
                module && module.run({
                    el: el,
                    taskId: that.taskId,
                    taskInfo: that.taskInfo
                });
            });
        },
        renderReport: function() {
            var that = this;
        
            requirejs(['js/miatelContent/MiatelContentTaskReportModule'], function(module) {
                module && module.run({
                    el: that.el,
                    taskId: that.taskId
                });
            });         
        },
        renderSubtaskGrid: function() { 
            var that = this;
        
            requirejs(['js/miatelContent/MiatelContentTaskSubtaskGridModule'], function(module) {
                module && module.run({
                    el: that.el,
                    taskId: that.taskId,
                    taskInfo: that.taskInfo,
                    userList: that.userList
                });
            });             
        },       
        getMiatelMemberList: function(callback) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(), 
                    departmentId: 0,
                    take: 0 //<-- get all members
                };
            
            u.ajaxRequest('member/get-member-list', data, function(err, data) {
                if (!err) {
                    callback(data.list);
                } else {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });
        },        
    };
    return public;
});