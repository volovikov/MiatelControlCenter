define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-task-comment.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, miatelTaskComment) {
    
    var miatelTaskCommentTmpl = k.template(miatelTaskComment);
    
    var public = {
        myModuleName: 'MiatelContentTaskCommentModule',
        mySectionName: 'miatel',
        commentImageMaxWidth: 400,        
        el: null,
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);                        
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickSubmitCommentBtn: function() {
            var that = this,                
                comment = $('#task-comment-textarea').val();
        
            private.sendCommentToServer.call(that, comment, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                }
            });    
        },
        onClickDeleteTaskCommentBtn: function(el) {
            var taskCommentId = el.attr('data-task-comment-id'),
                data = {
                    taskCommentId: taskCommentId,
                    userHash: app.getActiveUserHash() 
                };

            if (taskCommentId) {
                u.ajaxRequest('task/del-task-comment', data, function(err, resp) {
                    if (err) {
                        app.showPopupErrors(resp);
                    }
                });
            }            
        },
        onPasteImageFromClipboard: function(e) {
            var that = this,
                e = e.originalEvent,
                items = e.clipboardData.items,
                imageComment = '';
                
            var getRndFileName = function() {
                return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10) + '.png'; //<-- save into server PNG format file
            };
            for (var i = 0; i < items.length; ++i) {
                if (items[i].kind == 'file' && items[i].type.indexOf('image/') !== -1) {
                    var imageBlob = items[i].getAsFile(),
                        imageName = getRndFileName();                        
                    
                    private.sendCommentImageToServer.call(that, imageBlob, imageName, function(err, resp) {  
                        if (err) {
                            app.showPopupErrors(resp);
                        } else {
                            imageComment = '<a href="javascript:;" class="comment-popup-image" data-image-src="/files/' + resp.fname + '"><img src="/files/' + resp.resizeFileName + '"></a>';

                            private.sendCommentToServer.call(that, imageComment, function(err, resp) {
                                if (err) {
                                    app.showPopupErrors(resp);
                                }
                            });                                                                                    
                        }                        
                    });
                }
            }
        },
        onClickShowPopupImage: function(el) {
            var image = el.attr('data-image-src'),
                win = $('#image-popup-window');
            
            if (image) {
                win.html('<img src="' + image + '">');
                win.kendoWindow({
                    animation: {
                        open: {
                            duration: 100
                        },
                        close: {
                            duration: 100
                        }
                    },
                    modal: true,
                    visible: false,
                    title: 'Изображение',
                    actions: ['maximize', 'close'],
                    width: '70%',
                    height: '80%',
                    resizable: true
                }).data("kendoWindow").center().open();
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.comment-popup-image').on('click', '.comment-popup-image', function(e) {
                e.preventDefault();
                that.onClickShowPopupImage.call(that, $(this));
;            });
            $(document).off('click', '#task-comment-submit-btn').on('click', '#task-comment-submit-btn', function(e) {
                that.onClickSubmitCommentBtn.call(that);
            });
            $(document).off('keydown', '#task-comment-textarea').on('keydown', '#task-comment-textarea', function(e) {                
                if (e.keyCode == 13) {
                    if (e.shiftKey) {
                        return;
                    } else {
                        e.preventDefault();
                        that.onClickSubmitCommentBtn.call(that);
                        return true;
                    }
                }
            });                        
            app.subscribe('add-task-comment', this.myModuleName, function(data) {
                private.pushTaskComment.call(that, data);
            });
            $(document).off('click', '#miatel-task-comment-list .k-i-close').on('click', '#miatel-task-comment-list .k-i-close', function(e) {
                var commentEl = $(this).parent().find('.task-comment');
                that.onClickDeleteTaskCommentBtn.call(that, commentEl);
            });
            app.subscribe('del-task-comment', this.myModuleName, function(data) {
                private.delTaskComment.call(that, data);
            });   
            $(document).off('paste').on('paste', function(e) {
                that.onPasteImageFromClipboard.call(that, e);
            });
        },        
        render: function() {
            var that = this,
                el = this.el,
                data = {
                    taskId: this.taskId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('task/get-task-comment-list', data, function(err, data) {
                if (!err) {
                    var comment;
                        html = [];
       
                    for (var i in data.list) {
                        comment = data.list[i];
                        html.push(private.getCommentHtml.call(that, comment));
                    }
                    el.html(html.join(''));
                    private.commentListScrollTop(el);
                }
            });            
        },
        getCommentHtml: function(comment) {            
            var getMainUserRole = function() {
                var user = app.getActiveUser();     
              
                switch (user.role)  {
                    case 'Директор':
                    case 'Руководитель отдела':
                    case 'Инженер':
                        return 'admin';
                        
                    default:
                        return '';
                }
            };

            comment.comment = comment.comment.replace(/\n/g, '<br>'); //<-- replace to <br>
            
            var math = this.taskInfo.taskExecutorId.toString() == comment.commentAuthorId.toString(),
                direction = math ? 'to' : 'from';

            return miatelTaskCommentTmpl({
                data: comment,
                direction: direction,
                userRole: getMainUserRole()
            });
        },       
        pushTaskComment: function(comment) {
            var el = $('#miatel-task-comment-list'),
                textarea = $('#task-comment-textarea');

            if (el && this.taskId == comment.taskId) {
                el.append(
                    private.getCommentHtml.call(this, comment)
                );
                textarea.val('');
                private.commentListScrollTop(el);
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
        commentListScrollTop: function(el) {
            el.scrollTop(99999);
        }, 
        sendCommentToServer: function(comment, callback) {
            var that = this,
                user = app.getActiveUser(),
                data = {
                    taskId: this.taskId,
                    taskSubject: this.taskInfo.subject,
                    commentAuthorId: user.id,
                    commentDate: u.getCurrentDate(),
                    comment: comment || null,
                    commentAuthorName: user.name,
                    userHash: app.getActiveUserHash()
                };
                
            if (comment) {
                u.ajaxRequest('task/add-task-comment', data, function(err, resp) {
                    callback && callback(err, resp);
                });
            }            
        },
        sendCommentImageToServer: function(imageBlob, imageName, callback) {
            var fd = new FormData();
                fd.append('file', imageBlob, imageName);            
                
            $.ajax({
                type: 'post',
                url: app.serverUrl + 'upload-image', 
                data: fd,
                processData: false,
                contentType: false
            }).done(function(resp) {
                if (!callback) {
                    return;
                } else {
                    callback(!resp.success, resp.data);
                }
            });
        }
    };
    return public;
});