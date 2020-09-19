define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-task-template-form.html',
    'css!./css/miatelContent'    
], function($, k, u, common, local, taskForm) {
    
    var taskFormTmpl = k.template(taskForm);
    
    var public = {
        myModuleName: 'MiatelContentSubtaskGridModule',
        mySectionName: 'miatel',
        myWindow: null,
        subTaskGrid: null,
        subTaskGridReadonly: null,
        userList: null,
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);     
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickTaskAddBtn: function() {
            var user = app.getActiveUser();
            
            private.showPopupEditor.call(this, {
                taskInspectorId: app.defaultTaskInspectorId || 3, //<!-- super boos everytime
                taskExecutorId: user.id,
                taskAuthorId: user.id,
                priority: 'Нормальный'
            });
        },
        onClickTaskEditBtn: function(btn) {
            var that = this,
                taskId = btn.attr('data-task-id');
            
            if (taskId) {
                private.getTaskInfo.call(that, taskId, function(taskInfo) {
                    private.showPopupEditor.call(that, taskInfo);
                });
            }            
        },
        onClickTaskDeleteBtn: function(btn) {
            var that = this,
                taskId = btn.attr('data-task-id'),
                data = {
                    userHash: app.getActiveUserHash(),
                    id: taskId
                };
            
            if (!taskId) {
                return;
            }
            if (confirm(this.i18n.confirmDel)) {
                private.delTask.call(that, data, function(err, delTask) {
                    if (!err) {
                        var task = $.extend(delTask, {
                            userHash: app.getActiveUserHash()
                        });
                        app.publish('del-task', task);
                    }
                });           
            }            
        },
        onClickTaskCancelBtn: function() {
            private.hidePopupEditor.call(this);
        },
        onClickTaskSaveBtn: function() {
            var that = this,
                formEl = $('#task-form'),
                data = $.extend(u.getFormValue(formEl), {
                    userHash: app.getActiveUserHash()
                });

            var validator = formEl.find('.fieldlist').kendoValidator().data("kendoValidator");

            if (!validator.validate()) {
                return;
            }
            if (typeof data.id == 'undefined') {
                private.addTask.call(that, data, function(err, newTaskData) {
                    if (!err) {
                        var newTask = $.extend(data, newTaskData);
                        private.hidePopupEditor.call(that);
                        // BB
                        // exec nodejs method /task/add-task
                        // nodejs use Socket send event add-task
                        //app.publish('add-task', newTask);
                    }
                });
            } else {
                private.updateTask.call(that, data, function(err, newTaskData) {
                    if (!err) {
                        private.hidePopupEditor.call(that);
                    }                    
                });
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('add-task', this.myModuleName, function(data) {
                if (data.parentTaskId == that.taskId) {
                    private.reloadSubtaskGrid.call(that);
                }
            });
            app.subscribe('del-task', this.myModuleName, function(data) {
                if (data.parentTaskId == that.taskId) {
                    private.reloadSubtaskGrid.call(that);
                }
            });            
            app.subscribe('update-task', this.myModuleName, function(data) {
                if (data.id == that.taskId) {
                    if (data.status == 'Закрыта') {
                        private.setSubtaskGridReadonly.call(that);              
                    }  else {
                        private.resetSubtaskGridReadonly.call(that);                        
                    }   
                } else if (data.parentTaskId == that.taskId) {
                    private.reloadSubtaskGrid.call(that);
                }
            });
            $(document).off('click', '.task-cancel-btn').on('click', '.task-cancel-btn', function(e) {
                e.preventDefault();
                that.onClickTaskCancelBtn.call(that, $(this));
            });             
            $(document).off('click', '.task-edit-btn').on('click', '.task-edit-btn', function(e) {
                that.onClickTaskEditBtn.call(that, $(this));
            });                                        
            $(document).off('click', '.task-delete-btn').on('click', '.task-delete-btn', function(e) {
                that.onClickTaskDeleteBtn.call(that, $(this));
            });                            
            $(document).off('click', '.task-add-btn').on('click', '.task-add-btn', function(e) {
                that.onClickTaskAddBtn.call(that, $(this));
            });
            $(document).off('click', '.task-save-btn').on('click', '.task-save-btn', function(e) {
                that.onClickTaskSaveBtn.call(that, $(this));
            });            
        },        
        render: function() {
            private.renderSubtaskGrid.call(this);
            private.renderPopupWindow.call(this);
        },
        renderPopupWindow: function(callback) {
            var that = this,
                popupDomEl = $('#task-popup-editor');
           
           /**
            * ВВ
            * После того, как закрыли окно, я удаляю его из DOM
            * и затем сразу его заново создаю. Создаю 
            * с visible: false
            * Иначе будет глючить codeeditor
            */
            if (!popupDomEl.length) {
                this.el.append('<div id="task-popup-editor"></div>');
            }
            this.myWindow = $('#task-popup-editor').kendoWindow({
                title: "Задача",
                modal: true,
                visible: false,
                resizable: false,
                width: 700,                
                maxHeight: "120vh",
                deactivate: function() {
                    this.destroy();
                    popupDomEl.remove();
                    private.renderPopupWindow.call(that);
                }
            }).data("kendoWindow");            
        },
        renderSubtaskGrid: function() {
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
                                url: app.getServerApiUrl() + 'task/get-task-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    taskId: that.taskId,
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
                            var taskInspectorId = [],
                                workBegin = options.data.models[0].workBegin,
                                workEnd = options.data.models[0].workEnd;

                            options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                            options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);

                            if (typeof options.data.models[0].taskInspectorId  != 'string') {
                                for (var i in options.data.models[0].taskInspectorId) {
                                    var rec = options.data.models[0].taskInspectorId[i];
                                    taskInspectorId.push(rec.id);
                                }
                                options.data.models[0].taskInspectorId = taskInspectorId.join(',');
                            }  
                            var data = $.extend(options.data.models[0], {
                                userHash: app.getActiveUserHash(), 
                                parentTaskId: that.taskId
                            });
                            $.ajax({
                                url: app.getServerApiUrl() + 'task/update-task',
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('update-task', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];

                            $.ajax({
                                url: app.getServerApiUrl() + 'task/del-task',
                                type: 'post',
                                data: {userHash: app.getActiveUserHash(), id: rec.id},
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);                                    
                                        app.publish('del-task', {
                                            id: rec.id,
                                            parentTaskId: resp.data.parentTaskId,
                                            userHash: app.getActiveUserHash()
                                        });
                                    }
                                }
                            });
                        },
                        create: function(options) {
                            var workBegin = options.data.models[0].workBegin,
                                workEnd = options.data.models[0].workEnd;

                            options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                            options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);

                            $.ajax({
                                url: app.getServerApiUrl() + 'task/add-task',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash(), parentTaskId: that.taskId}),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('add-task', resp.data);
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
                                id: {editable: false, nullable: true},
                                subject: { validation: { required: true }},
                                status: { validation: { required: true }, defaultValue: { value: "Новая"}},
                                priority: {defaultValue: { value: "Нормальный"}},
                                taskAuthorId: {defaultValue: {id: app.getActiveUser().id}},                            
                                taskAuthor: {defaultValue: {value: app.getActiveUser().name}},
                                taskExecutorId: {defaultValue: {id: app.getActiveUser().id}},
                                taskExecutor: {defaultValue: {value: app.getActiveUser().name}},
                                workBegin: { type: "date"},
                                workEnd: { type: "date",  nullable: true },
                                needTime: {defaultValue: {value: 60}},
                                complete: { defaultValue: {value: "0%"} },
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
            var getTaskExecutorName = function(executorId) {
                if (!that.userList) {
                    return;
                }
                for (var i in that.userList) {
                    var u = that.userList[i];

                    if (u.id == executorId) {
                        return u.name;
                    }
                }
            };
            var needTimeDropDownEditor = function(container, options) {
                var dataSource;
                 
                if (options.model.hasChildren == '1') {
                    return $(container).html(u.getFormatedTimeStr(options.model.needTime));
                } else {
                    dataSource = [{
                        value: '60',
                        text: '1 час'
                    },{
                        value: '240',
                        text: '4 часа'
                    },{
                        value: '480',
                        text: '1 день'
                    },{
                        value: '720',
                        text: '1,5 день'
                    },{
                        value: '960',
                        text: '2 дня'
                    },{
                        value: '1200',
                        text: '2,5 дня'
                    },{
                        value: '1440',
                        text: '3 дня'
                    },{
                        value: '1680',
                        text: '3,5 дня'
                    },{
                        value: '1920',
                        text: '4 дня'
                    },{
                        value: '2160',
                        text: '4,5 дня'
                    },{
                        value: '2400',
                        text: '5 дней'
                    }];
                }
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: dataSource
                    });
            };    
            var needTimeTmpl = function(row) {
                return u.getFormatedTimeStr(row.needTime);
            };
            var statusDropDownEditor = function(container, options) {
                if (options.model.hasChildren == '1') {
                    return $(container).html(options.model.status);
                }
                $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'Новая'
                        },{
                            value: 'В работе'
                        },{
                            value: 'Решена'
                        },{
                            value: 'Закрыта'
                        },{
                            value: 'Отклонена'
                        },{
                            value: 'Отложена'
                        }]
                    });
            };     
            var priorityDropDownEditor = function(container, options) {
                $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'Низкий'
                        },{
                            value: 'Нормальный'
                        },{
                            value: 'Высокий'
                        },{
                            value: 'Срочный'
                        },{
                            value: 'Немедленный'
                        }]
                    });
            };   
            var completeDropDownEditor = function(container, options) {
                var dataSource,
                    complete = options.model.complete;
            
                if (options.model.hasChildren == '1') {
                    return $(container).html("<div class='grid-progress-bar'><span class='progress' style='width:" + complete + "'><span class='value p" + complete.replace('%', '')+"'>" + complete +  "</span></span></div>");
                } else {                
                    dataSource = [{
                            value: '0%'    
                        },{
                            value: '10%'
                        },{
                            value: '20%'
                        },{
                            value: '30%'
                        },{
                            value: '40%'
                        },{
                            value: '50%'
                        },{
                            value: '60%'
                        },{
                            value: '70%'
                        },{
                            value: '80%'
                        },{
                            value: '90%'
                        },{
                            value: '100%'
                        }];
                }
                $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: dataSource
                    });
            };
            var executorsDropDownEditor = function(container, options) {                
                $('<input data-text-field="name" data-value-field="id" data-bind="value:taskExecutorId"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,                        
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'member/get-member-list',
                                        data: {
                                            userHash: app.getActiveUserHash(),
                                            departmentId: 0, // all
                                            take: 0 // all
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            var list = [];
                                            
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
            var executorsTmpl = function(row) {                                
                return getTaskExecutorName(row.taskExecutorId);
            };
            var columns = [{
                field: 'id',
                title: '№',
                width: '45px',
                template: function(row) {
                    return '<a href="#section/' + that.mySectionName + '/tree/tasks/task/' + row.id + '">' + row.id + '</a>';
                }
            },{
                field: 'subject',    
                title: 'Тема',
                width: '35%',
                encoded: false
            },{ 
                field: 'status',
                title: 'Статус',
                editor: statusDropDownEditor,  
                template: function(row) {
                    var  status;

                    if (typeof row.status['value'] != 'undefined')  {
                        status = row.status['value'];
                    } else {
                        status = row.status;
                    }
                    if (status == "В работе") {
                        setTimeout(function() {
                             that.subTaskGrid.tbody.find('tr[data-uid="' + row.uid+ '"]').addClass('task-in-work');
                        }, 50);
                    }
                    return status;
                }
            },{ 
                field: 'priority',
                title: 'Приоритет',
                editor: priorityDropDownEditor,
                template: function(row) {
                    if (typeof row.priority['value'] != 'undefined')  {
                        return row.priority['value'];
                    } else {
                        return row.priority;
                    }
                }
            },{ 
                field: 'taskExecutorId',
                title: 'Исполнитель',
                width: '18%',
                editor: executorsDropDownEditor,
                template: executorsTmpl
            },{ 
                field: 'workBegin',
                format: '{0: yyyy-MM-dd HH:mm:ss}',
                title: 'Начало' 
            },{
                field: 'needTime',
                title: 'Пр.время',
                editor: needTimeDropDownEditor,
                template: needTimeTmpl
            },{ 
                field: 'complete',
                title: 'Выполнено',
                editor: completeDropDownEditor, 
                template: function(row) {
                    if (typeof row.complete == 'string') {
                        return "<div class='grid-progress-bar'><span class='progress' style='width:" + row.complete + "'><span class='value p" + row.complete.replace('%', '')+"'>" + row.complete +  "</span></span></div>";
                    }
                }
            }];
            if (this.taskInfo.status != 'Закрыта') {
                columns.push({
                    template: function(rec) {
                        return '<button onclick="return false;" data-task-id="' + rec.id + '" class="k-button k-button-icontext task-edit-btn"><span class="k-icon k-edit"></span>Изменить</button>&nbsp;<button onclick="return false;" data-task-id="' + rec.id + '" class="k-button k-button-icontext task-delete-btn"><span class="k-icon k-delete"></span>Удалить</button>';
                    }, 
                    title: "&nbsp;",
                    width: "200px"
                });
            }     
            this.subTaskGrid = this.el.find('#miatel-subtask-grid').kendoGrid({
                columns: columns,                
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
                toolbar: '<button onclick="return false;" class="k-button k-button-icontext task-add-btn"><span class="k-icon k-add"></span>Добавить</button>',
                editable: true
            }).data('kendoGrid'); 

            this.subTaskGridReadonly = this.el.find('#miatel-subtask-grid-readonly').kendoGrid({
                columns: columns,                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },                
                editable: false
            }).data('kendoGrid');  
            
            if (this.task && this.taskInfo.status == 'Закрыта') {
                private.setSubtaskGridReadonly.call(that);
            }
        },      
        setSubtaskGridReadonly: function() {
            this.subTaskGridReadonly.dataSource.read();
            this.subTaskGridReadonly.refresh();
            $('#miatel-subtask-grid').addClass('hide');
            $('#miatel-subtask-grid-readonly').removeClass('hide');                 
        },
        resetSubtaskGridReadonly: function() {
            $('#miatel-subtask-grid').removeClass('hide');
            $('#miatel-subtask-grid-readonly').addClass('hide');                                     
        },
        reloadSubtaskGrid: function() {
            this.subTaskGrid.dataSource.read();
            this.subTaskGrid.refresh();
            this.subTaskGridReadonly.dataSource.read();
            this.subTaskGridReadonly.refresh();            
        },
        showPopupEditor: function(data) {
            if (typeof data.parentTaskId == 'undefined') {
                data.parentTaskId = this.taskId || 0;
            }
            var w = $('#task-popup-editor'),
                html = taskFormTmpl({
                    u: u,
                    data: data,
                    userList: this.userList
                });
         
            this.myWindow.content(html);

            w.find('.datepicker').kendoDatePicker({
                format: app.getDateTimeFormat()
            });
            w.find('.combobox').kendoComboBox();
            w.find('select[name="taskInspectorId"]').kendoMultiSelect();
            this.myWindow.center().open();
        },
        hidePopupEditor: function() {
            this.myWindow.close();
        },
        getTaskInfo: function(taskId, callback) {
            var data = {
                taskId: taskId,
                userHash: app.getActiveUserHash()
            };
            if (!taskId) {
                return;
            }
            u.ajaxRequest('task/get-task', data, function(err, taskInfo) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    callback && callback(taskInfo);
                }
            });
        },
        updateTask: function(data, callback) {
            var that = this;
            
            u.ajaxRequest('task/update-task', data, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    callback && callback(false, data);
                }
            });
        },        
        addTask: function(data, callback) {
            var that = this;
            
            u.ajaxRequest('task/add-task', data, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    callback && callback(false, data);
                }
            });
        },
        delTask: function(data, callback) {
            var that = this;
            
            u.ajaxRequest('task/del-task', data, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    callback && callback(data);
                }
            });
        }        
    };
    return public;
});