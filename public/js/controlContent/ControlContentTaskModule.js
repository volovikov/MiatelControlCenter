define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/controlContent.js',    
    'text!./templates/control-task-form.html',
    'text!./templates/control-task-comment.html',
    'css!./css/controlContent'
], function($, k, u, common, local, controlTaskForm, controlTaskComment) {
    
    var controlTaskTmpl = k.template(controlTaskForm),
        controlTaskCommentTmpl = k.template(controlTaskComment);        
    
    var public = {
        myModuleName: 'ControlContentTaskFormModule',
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);
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
                u.ajaxRequest('update-task', data, function(err, data) {
                    if (err) {
                        app.showPopupErrors(data);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    }
                });                 
                //private.updateTaskRecursive.call(that, data);  //<-- возможно нужно перенести в дерево?              
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
                u.ajaxRequest('del-task', data, function(err, resp) {
                    if (err) {
                        app.showPopupMsg('good', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('del-task', {
                            id: data.id,
							parentTaskId: resp.parentTaskId,
                            userHash: app.getActiveUserHash()
                        });
                        window.location.hash = '#section/control/tree/tasks/task/' + data.parentTaskId;
                    }
                });    
            }
        },
        onClickSubmitCommentBtn: function() {
            var that = this,
                user = app.getActiveUser(),
                comment = $('#task-comment-textarea').val(),
                data = {
                    taskId: this.taskId,
                    commentAuthorId: user.id,
                    commentDate: u.getCurrentDate(),
                    comment: comment,
                    commentAuthorName: user.name,
                    userHash: app.getActiveUserHash()
                };
                
            if (comment) {
                u.ajaxRequest('add-task-comment', data, function(err, resp) {
                    if (err) {
                        app.showPopupErrors(resp);
                    }
                });
            }
        },
        onClickDeleteTaskCommentBtn: function(el) {
            var taskCommentId = el.attr('data-task-comment-id'),
                data = {
                    taskCommentId: taskCommentId,
                    userHash: app.getActiveUserHash() 
                };

            if (taskCommentId) {
                u.ajaxRequest('del-task-comment', data, function(err, resp) {
                    if (err) {
                        app.showPopupErrors(resp);
                    }
                });
            }            
        },
        onPasteImageFromClipboard: function(e) {
            var taht = this,
                e = e.originalEvent,
                items = e.clipboardData.items;
                
            for (var i = 0; i < items.length; ++i) {
                if (items[i].kind == 'file' && items[i].type.indexOf('image/') !== -1) {
                    var blob = items[i].getAsFile();                    
                    window.URL = window.URL || window.webkitURL;                    
                    var blobUrl = window.URL.createObjectURL(blob),
                        img = document.createElement('img');
                
                    img.src = blobUrl;
                    var logBox = document.getElementById('control-task-comment-list');
                    
                    logBox.appendChild(img);
                }
            }
        },
        onUpdateFormValue: function(data) {
            var formEl = this.el.find('form');

            if (typeof data.taskExecutorId != 'undefined') {
                data.taskExecutorId = data.taskExecutorId.split(',');
            }
            if (formEl) {
                u.setFormValue(formEl, data);
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
            $(document).off('click', '#task-comment-submit-btn').on('click', '#task-comment-submit-btn', function(e) {
                that.onClickSubmitCommentBtn.call(that);
            });
            $(document).on('keydown', '#task-comment-textarea', function(e) {                
                if (e.keyCode == 13) {
                    if (e.shiftKey) {
                        $(this).val($(this).val() + '\n');
                    } else {
                        e.preventDefault();
                        that.onClickSubmitCommentBtn.call(that);
                    }
                }
            });                        
            app.subscribe('add-task-comment', this.myModuleName, function(data) {
                private.pushTaskComment.call(that, data);
            });
            $(document).off('click', '#control-task-comment-list .k-i-close').on('click', '#control-task-comment-list .k-i-close', function(e) {
               that.onClickDeleteTaskCommentBtn.call(that, $(this).parent());
            });
            app.subscribe('del-task-comment', this.myModuleName, function(data) {
                private.delTaskComment.call(that, data);
            });   
            $(document).on('paste', function(e) {
                that.onPasteImageFromClipboard.call(that, e);
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

            u.ajaxRequest('get-task', data, function(err, data) {
                if (!err) {
                    private.getUserList.call(that, function(userList) {
                        that.userList = userList;
                        that.taskInfo = data;
                        data.taskExecutorId = data.taskExecutorId.split(',');

                        var html = controlTaskTmpl({
                            i18n: that.i18n,
                            data: data,
                            userList: userList
                        });
                        that.el.html(html);                        
                        that.el.find('.tabstrip').kendoTabStrip({animation:{open: {effects: 'fadeIn'}}});
                        that.el.find('.combobox').kendoComboBox();  
                        that.el.find('.miltiple-combobox').kendoMultiSelect({
                            tagMode: 'multiple'
                        });
                        that.el.find('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });                        
                        that.validator = that.el.find('.fieldlist').kendoValidator().data("kendoValidator");
                        private.renderSubtaskGrid.call(that);
                        private.renderCommentList.call(that);
                    });
                }
            });
        },
        renderCommentList: function() {
            var that = this,
                dialog = $('#control-task-comment-list'),
                data = {
                    taskId: this.taskId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-task-comment-list', data, function(err, data) {
                if (!err) {
                    var comment;
                        html = [];
       
                    for (var i in data.list) {
                        comment = data.list[i];
                        html.push(private.getCommentHtml.call(that, comment));
                    }
                    dialog.html(html.join(''));
                    private.commentListScrollTop();
                }
            });
        },
        getCommentHtml: function(comment) {
            var user = app.getActiveUser();

            comment.comment = comment.comment.replace(/\n/g, '<br>'); //<-- replace to <br>

            return controlTaskCommentTmpl({
                data: comment,
                direction: this.taskInfo.taskExecutorId == comment.commentAuthorId ? 'from' : 'to',
                userRole: user.role
            });
        },
        pushTaskComment: function(comment) {
            var commentList = $('#control-task-comment-list'),
                textarea = $('#task-comment-textarea');
            
            if (commentList) {
                commentList.append(
                    private.getCommentHtml.call(this, comment)
                );
                textarea.val('');
                private.commentListScrollTop();
            }
        },
        delTaskComment: function(data) {
            if (data && data.taskCommentId) {
                var el = $('#task-comment-' + data.taskCommentId);
                
                if (el) {
                    el.parent().parent().remove();
                }
            }
        },
        commentListScrollTop: function() {
            var commentList = $('#control-task-comment-list');            
            commentList.scrollTop(99999);
        }, 
        getUserList: function(callback) {
            var that = this; 
            
            u.ajaxRequest('get-mcc-user-list', {userHash: app.getActiveUserHash()}, function(err, data) {
                if (!err) {
                    callback(data.list);
                } else {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });
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
                            url: app.getServerApiUrl() + 'get-task-list',
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
                        var workBegin = options.data.models[0].workBegin,
                            workEnd = options.data.models[0].workEnd;
             
                        options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                        options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);
                        
                        $.ajax({
                            url: app.getServerApiUrl() + 'update-task',
                            type: 'post',
                            data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash(), parentTaskId: that.taskId}),
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    //app.publish('update-task', resp.data);
                                }
                            }
                        });                        
                    },
                    destroy: function(options) {
                        var rec = options.data.models[0];

                        $.ajax({
                            url: app.getServerApiUrl() + 'del-task',
                            type: 'post',
                            data: {userHash: app.getActiveUserHash(), id: rec.id},
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('del-task', {
                                        id: rec.id,
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
                            url: app.getServerApiUrl() + 'add-task',
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
                            taskExecutorId: {editable: false, defaultValue: {id: app.getActiveUser().id}},
                            taskExecutor: {defaultValue: {value: app.getActiveUser().name}},
                            workBegin: { type: "date"},
                            workEnd: { type: "date",  nullable: true },
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
        },
        renderSubtaskGrid: function() { 
            var that = this;
            
            var statusDropDownEditor = function(container, options) {
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
                $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
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
                        }]
                    });
            };
            var usersDropDownEditor = function(container, options) { 
                return; 
                
                $("<select name='taskExecutorId' data-text-field='name' data-value-field='id' multiple='multiple' data-bind='value: taskExecutorId'/>")
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        tagMode: 'multiple',
                        dataSource: that.userList || []         
                    });
            };            
            this.el.find('#control-subtask-grid').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px',
                    template: function(row) {
                        return '<a href="#section/control/tree/tasks/task/' + row.id + '">' + row.id + '</a>';
                    }
                },{
                    field: 'subject',    
                    title: 'Тема',
                    width: '35%'
                },{ 
                    field: 'status',
                    title: 'Статус',
                    editor: statusDropDownEditor,                     
                },{ 
                    field: 'priority',
                    title: 'Приоритет',
                    editor: priorityDropDownEditor 

                },{ 
                    field: 'taskExecutorId',
                    title: 'Исполнитель',
                    //editor: usersDropDownEditor,
                    template: function(row) {
                        if (typeof row.taskExecutor == 'undefined') {
                            return app.getActiveUser().name || '';
                        } else {
                            var executors = row.taskExecutorId.split(','),
                                html = [];
                        
                            for (var i in executors) {
                                var e = executors[i];
                                html.push(private.getTaskExecutorName.call(that, e));
                            }
                            return html.join(',');
                        }                        
                    }                    
                },{ 
                    field: 'workBegin',
                    format: '{0: yyyy-MM-dd HH:mm:ss}',
                    title: 'Начало' 
                },{ 
                    field: 'complete',
                    title: 'Выполнено',
                    editor: completeDropDownEditor, 
                    template: function(row) {
                        if (typeof row.complete == 'string') {
                            return "<div class='grid-progress-bar'><span class='progress' style='width:" + row.complete + "'><span class='value p" + row.complete.replace('%', '')+"'>" + row.complete +  "</span></span></div>";
                        }
                    }
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
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
            });               
        },       
        getTaskExecutorName: function(executorId) {
            if (!this.userList) {
                return;
            }
            for (var i in this.userList) {
                var u = this.userList[i];
                
                if (u.id == executorId) {
                    return u.name;
                }
            }
        },
        updateTaskRecursive: function(task) {
            var that = this;
            
            u.ajaxRequest('update-task', task, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);

                    if (task.parentTaskId && task.parentTaskId != 0 && task.parentTaskId != 'null') {
                        var data = {
                            id: task.parentTaskId,
                            status: task.status,
                            userHash: app.getActiveUserHash()
                        };
                        private.updateTaskRecursive.call(that, data);
                    }
                }
            });            
        }
    };
    return public;
});