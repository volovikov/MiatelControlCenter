define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-client-form.html',
    'text!./templates/vats-client-form-popup.html',
    'text!./templates/vats-client-comment.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, miatelClientForm, miatelClientFormPopup, miatelClientComment) {
    
    var miatelClientTmpl = k.template(miatelClientForm),
        miatelClientPopupTmpl = k.template(miatelClientFormPopup),
        miatelClientCommentTmpl = k.template(miatelClientComment);
    
    var public = {
        myModuleName: 'VatsContentClientModule',
        mySectionName: 'vats',
        subClientGrid: null,
        userList: null,
        commentImageMaxWidth: 400,
        clientInfo: null, //<-- info about current client
        defaultInspectorId: 3, //<-- Круничный
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);                        
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickAddBtn: function() {
            var user = app.getActiveUser();
            
            private.showPopupEditor.call(this, {
                taskInspectorId: app.defaultTaskInspectorId || 3, //<!-- super boos everytime
                taskExecutorId: user.id,
                taskAuthorId: user.id,
                priority: 'Нормальный'
            });
        },      
        onClickInsertBtn: function() {
            var that = this,
                formEl = $('#client-popup-form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    parentClientId: this.clientId,
                    userHash: app.getActiveUserHash()
                });
                validator = formEl.find('.fieldlist').kendoValidator().data("kendoValidator");
                
            if (validator.validate()) {
                u.ajaxRequest('client/add-client', data, function(err, data) {
                    if (err) {
                        app.showPopupErrors(data);
                    } else {
                        private.hidePopupEditor.call(that);
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    }
                });
            }
        },
        onClickCancelBtn: function() {
            private.hidePopupEditor.call(this);
        },        
        onClickSaveBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.clientId
                });

            if (this.validator.validate()) {
                u.ajaxRequest('client/update-client', data, function(err, data) {
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
                    id: that.clientId
                });
                
            if (confirm(this.i18n.confirmDel)) {
                u.ajaxRequest('client/del-client', data, function(err, resp) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('del-client', {
                            id: data.id,
                            userHash: app.getActiveUserHash()
                        });
                        window.location.hash = '#section/' + that.mySectionName + '/tree/clients/client/' + data.parentClientId;
                    }
                });    
            }
        },
        onClickCallBtn: function() {
            var that = this,
                user = app.getActiveUser(),
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = {
                    //clientGlobalId: formValue.clientGlobalId,
                    clientGlobalId: app.vatsGlobalId,
                    clientPhone: formValue.clientPhone,
                    managerInnerPhoneNumber: user.innerPhoneNumber
                };

            $.ajax({
                url: app.voiceipServerUrl + 'proxy.php?method=make-mvts-call&mccRottPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {

                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        },
        onClickSubmitCommentBtn: function() {
            var that = this,                
                comment = $('#client-comment-textarea').val();
        
            private.sendCommentToServer.call(that, comment, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                } else {
                    private.pushClientComment.call(that, resp);
                }
            });    
        },
        onClickDeleteClientCommentBtn: function(el) {
            var clientCommentId = el.attr('data-client-comment-id'),
                data = {
                    clientCommentId: clientCommentId,
                    userHash: app.getActiveUserHash() 
                };

            if (clientCommentId) {
                u.ajaxRequest('client/del-client-comment', data, function(err, resp) {
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
        onUpdateFormValue: function(data) {
            var formEl = this.el.find('form'),
                disabledElems = ['select[name="status"]', 'select[name="complete"]'],
                disabledControl = ['button.btn-save', 'button.btn-delete'],
                enableStatus = true;

            if (typeof data.clientExecutorId != 'undefined') {
                data.clientExecutorId = data.clientExecutorId.split(',');
            }
            if (typeof data.clientInspectorId != 'undefined') {
                data.clientInspectorId = data.clientInspectorId.split(',');
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
                private.setSubclientGridReadonly.call(this);               
            }  else {
                for (var i in disabledControl) {
                    var el = $(disabledControl[i]);
                    el.removeAttr('disabled');
                }; 
                private.resetSubclientGridReadonly.call(this);
            }   
            for (var i in disabledElems) {
                var el = formEl.find(disabledElems[i]),
                    widget = kendo.widgetInstance($(el));

                if (widget) {
                    widget.enable(enableStatus);
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
        },
        onClickSearchPartnerBtn: function(btn) {
            var partnerId = btn.attr('data-partner-id');

            if (partnerId) {
                app.goto('section/miatel/tree/members/member/' + partnerId);
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.client-add-btn').on('click', '.client-add-btn', function(e) {
                e.preventDefault();
                that.onClickAddBtn.call(that, $(this));
            });
            $(document).off('click', '.comment-popup-image').on('click', '.comment-popup-image', function(e) {
                e.preventDefault();
                that.onClickShowPopupImage.call(that, $(this));
            });
            $(document).off('click', '#btn-client-insert').on('click', '#btn-client-insert', function(e) {
                e.preventDefault();
                that.onClickInsertBtn.call(that, $(this));
            });                                    
            $(document).off('click', '#btn-client-cancel').on('click', '#btn-client-cancel', function(e) {
                e.preventDefault();
                that.onClickCancelBtn.call(that, $(this));
            });                        
            $(document).off('click', '#btn-client-save').on('click', '#btn-client-save', function(e) {
                e.preventDefault();
                that.onClickSaveBtn.call(that);
            });
            $(document).off('click', '#btn-client-delete').on('click', '#btn-client-delete', function(e) {
                e.preventDefault();
                that.onClickDeleteBtn.call(that);
            });
            $(document).off('click', '#btn-client-call').on('click', '#btn-client-call', function(e) {
                e.preventDefault();
                that.onClickCallBtn.call(that);
            });
            $(document).off('click', '#client-comment-submit-btn').on('click', '#client-comment-submit-btn', function(e) {
                that.onClickSubmitCommentBtn.call(that);
            });
            $(document).off('click', '#parnerSearchBtn').on('click', '#parnerSearchBtn', function(e) {
                that.onClickSearchPartnerBtn.call(that, $(this));
            });            
            $(document).off('keydown', '#client-comment-textarea').on('keydown', '#client-comment-textarea', function(e) {                
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
            app.subscribe('add-client-comment', this.myModuleName, function(data) {
                private.pushClientComment.call(that, data);
            });
            app.subscribe('add-client', this.myModuleName, function(data) {
                if (that.clientInfo.id == data.parentClientId) {
                    private.reloadSubclientGrid.call(that);
                }
            });
            $(document).off('click', '#miatel-client-comment-list .k-i-close').on('click', '#miatel-client-comment-list .k-i-close', function(e) {
                var commentEl = $(this).parent().find('.client-comment');
                that.onClickDeleteClientCommentBtn.call(that, commentEl);
            });
            app.subscribe('del-client-comment', this.myModuleName, function(data) {
                private.delClientComment.call(that, data);
            });   
            $(document).off('paste').on('paste', function(e) {
                that.onPasteImageFromClipboard.call(that, e);
            });
            app.subscribe('update-client', this.myModuleName, function(data) {    
                if (data.id == that.clientId) {
                    that.onUpdateFormValue.call(that, data);
                }
            });
        },
        render: function() {
            var that = this,
                user = app.getActiveUser(),
                innerUserPhone = user.innerPhoneNumber || '',
                data = {
                    clientId: this.clientId,
                    userHash: app.getActiveUserHash()
                };

            u.ajaxRequest('client/get-client', data, function(err, data) {
                if (!err) {
                    that.clientInfo = data;

                    private.getUserList.call(that, function(userList) {
                        that.userList = userList;                        
                        data.clientInspectorId = data.clientInspectorId.toString().split(',');
                        
                        var html = miatelClientTmpl({
                            i18n: that.i18n,
                            innerUserPhone: innerUserPhone,
                            data: data,
                            userList: userList,
                            inspectorList: userList
                        });
                        that.el.html(html);                        
                        that.el.find('.tabstrip').kendoTabStrip({
                            animation:{
                                open: {effects: 'fadeIn'}
                            }
                        });
                        that.el.find('.combobox').kendoComboBox({
                            
                        });  
                        that.el.find('.miltiple-combobox').kendoMultiSelect({
                            tagMode: 'multiple'
                        });
                        that.el.find('.datepicker').kendoDatePicker({
                            format: app.getDateTimeFormat()
                        });     
                        that.el.find('#parentClient').kendoComboBox({
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
                                            url: app.getServerApiUrl() + 'client/get-client-list',
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
                        private.renderPartnerField.call(that);
                        private.renderPopupWindow.call(that);
                        private.renderSubclientGrid.call(that);
                        private.renderCommentList.call(that);
                    });
                }
            });
        },
        renderPopupWindow: function(callback) {
            var that = this,
                popupDomEl = $('#client-popup-editor');
           
            if (!popupDomEl.length) {
                this.el.append('<div id="client-popup-editor"></div>');
            }
            this.myWindow = $('#client-popup-editor').kendoWindow({
                title: "Клиент",
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
        renderCommentList: function() {
            var that = this,
                el = $('#miatel-client-comment-list'),
                data = {
                    clientId: this.clientId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('client/get-client-comment-list', data, function(err, data) {
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
        renderPartnerField: function() {
            var that = this,
                partnerCode = this.clientInfo.partnerCode,
                el = this.el.find('#partnerCodeField'),
                html;

            if (el) {
                if (partnerCode != '') {
                    private.getPartnerInfo.call(that, partnerCode, function(partnerInfo) {
                        if (partnerInfo) {
                            var partnerId = partnerInfo.departmentId + '-' + partnerInfo.id;

                            html = '<label for="partnerCode">Наименование партнера</label><span style="width: 100%;"  class="k-textbox k-space-right search-field"><input readonly name="partnerCode" type="text" id="partnerCode"  value="' + partnerInfo.name + '"/><a data-partner-id="' + partnerId + '" id="parnerSearchBtn" href="javascript:;" class="k-icon k-i-search">&nbsp;</a></span>';                        
                        } else {
                            html = '<label for="partnerCode">Партнерский код</label><input name="partnerCode" value="' + that.clientInfo.partnerCode + '" style="width: 100%" class="k-textbox"/>';
                        }
                        el.html(html);
                    });                    
                } else {
                    html = '<label for="partnerCode">Партнерский код</label><input name="partnerCode" value="' + that.clientInfo.partnerCode + '" style="width: 100%" class="k-textbox"/>';
                    el.html(html);
                }                                    
            }
        },
        renderSubclientGrid: function() { 
            var that = this;
            
            var ownerDropDownEditor = function(container, options) {
                var clientExecutors = []; 

                if (typeof options.model.clientExecutorId == 'string') {
                    var tmp = options.model.clientExecutorId.split(',');

                    for (var i in tmp) {
                        var executorId = tmp[i];

                        clientExecutors.push({
                            id: executorId,
                            name: private.getClientExecutorName.call(that, executorId)
                        });
                    }      
                } else if (typeof options.model.clientExecutorId == 'object') {
                    clientExecutors = options.model.clientExecutorId;
                }
                options.model.clientExecutorId = clientExecutors;

                $('<input data-text-field="name" data-value-field="id" data-bind="value:clientOwnerId"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        multiple: true,
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
                    }).data('kendoDropDownList');
            };             
            var columns = [{
                field: 'id',
                title: '№',
                width: '45px',
                filterable: false,
                template: function(row) {
                    return '<a href="#section/' + that.mySectionName + '/tree/clients/client/' + row.id + '">' + row.id + '</a>';
                }
            },{
                field: 'subject',    
                title: 'Наименование',
                width: '35%',
            },{
                field: 'clientOwnerId',
                title: 'Ответственный',
                width: '18%',
                filterable: false,
                editor: ownerDropDownEditor,
                template: function(row) {
                    return row.clientOwnerName
                },
            },{ 
                field: 'registerDatetime',
                title: 'Дата регистрации',
            },{
                field: 'clientTotal',
                title: 'Кол-во',
                filterable: false
            },{
                field: 'clientPhone',
                title: 'Телефон'
            },{
                title: "&nbsp;",
                command: ["destroy"],
                width: "110px"
            }];
            this.subClientGrid = this.el.find('#miatel-subclient-grid').kendoGrid({
                columns: columns,                
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
                filterable: {
                    extra: false,
                    operators: {
                        string:{
                            eq: "Равно",
                        }
                    }
                },
                toolbar: '<button onclick="return false;" class="k-button k-button-icontext client-add-btn"><span class="k-icon k-add"></span>Добавить</button>',
                editable: true
            }).data('kendoGrid');             
        },               
        reloadSubclientGrid: function() {
            this.subClientGrid.dataSource.read();
            this.subClientGrid.refresh();
        },        
        getPartnerInfo: function(partnerCode, callback) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    partnerCode: partnerCode
                };
                
            u.ajaxRequest('member/get-partner', data, function(err, data) {
                if (!err) {
                    callback && callback(data);
                } else {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
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

            return miatelClientCommentTmpl({
                data: comment,
                direction: this.clientInfo.clientExecutorId == comment.commentAuthorId ? 'from' : 'to',
                userRole: getMainUserRole()
            });
        },       
        pushClientComment: function(comment) {
            var el = $('#miatel-client-comment-list'),
                textarea = $('#client-comment-textarea');
        
            if (el && this.clientId == comment.clientId) {
                el.append(
                    private.getCommentHtml.call(this, comment)
                );
                textarea.val('');
                private.commentListScrollTop(el);
            }
        },
        delClientComment: function(data) {
            if (data && data.clientCommentId) {
                var el = $('#client-comment-' + data.clientCommentId);
                
                if (el) {
                    el.parent().parent().remove();
                }
            }
        },
        commentListScrollTop: function(el) {
            el.scrollTop(99999);
        }, 
        getUserList: function(callback) {
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
                            url: app.getServerApiUrl() + 'client/get-client-list',
                            type: 'post',
                            data: {
                                userHash: app.getActiveUserHash(), 
                                clientId: that.clientId,
                                skip: options.data.skip,
                                take: options.data.take,
                                filter: options.data.filter,
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
                        var clientExecutorId = [], clientInspectorId = [],
                            workBegin = options.data.models[0].workBegin,
                            workEnd = options.data.models[0].workEnd;
             
                        options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                        options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);

                        if (typeof options.data.models[0].clientExecutorId  != 'string') {
                            for (var i in options.data.models[0].clientExecutorId) {
                                var rec = options.data.models[0].clientExecutorId[i];
                                clientExecutorId.push(rec.id);
                            }
                            options.data.models[0].clientExecutorId = clientExecutorId.join(',');
                        }    
                        if (typeof options.data.models[0].clientInspectorId  != 'string') {
                            for (var i in options.data.models[0].clientInspectorId) {
                                var rec = options.data.models[0].clientInspectorId[i];
                                clientInspectorId.push(rec.id);
                            }
                            options.data.models[0].clientInspectorId = clientInspectorId.join(',');
                        }  
                        var data = $.extend(options.data.models[0], {
                            userHash: app.getActiveUserHash(), 
                            parentClientId: that.clientId
                        });
                        $.ajax({
                            url: app.getServerApiUrl() + 'client/update-client',
                            type: 'post',
                            data: data,
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('update-client', resp.data);
                                }
                            }
                        });                        
                    },
                    destroy: function(options) {
                        var rec = options.data.models[0];

                        $.ajax({
                            url: app.getServerApiUrl() + 'client/del-client',
                            type: 'post',
                            data: {userHash: app.getActiveUserHash(), id: rec.id},
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('del-client', {
                                        id: rec.id,
                                        userHash: app.getActiveUserHash()
                                    });
                                }
                            }
                        });
                    },
                    create: function(options) {
                        var workBegin = options.data.models[0].workBegin,
                            workEnd = options.data.models[0].workEnd,
                            clientExecutorId = options.data.models[0].clientExecutorId.id,
                            clientAuthorId = options.data.models[0].clientAuthorId.id;

                        options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                        options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);
                        options.data.models[0].clientExecutorId = clientExecutorId;
                        options.data.models[0].clientAuthorId = clientAuthorId;
                        options.data.models[0].clientInspectorId = ''; //<-- nothong

                        $.ajax({
                            url: app.getServerApiUrl() + 'client/add-client',
                            type: 'post',
                            data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash(), parentClientId: that.clientId}),
                            success: function(resp) {
                                if (resp.success) {
                                    options.success(resp);
                                    app.publish('add-client', resp.data);
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
                            clientAuthorId: {defaultValue: {id: app.getActiveUser().id}},                            
                            clientAuthor: {defaultValue: {value: app.getActiveUser().name}},
                            clientExecutorId: {defaultValue: {id: app.getActiveUser().id}},
                            clientExecutor: {defaultValue: {value: app.getActiveUser().name}},
                            workBegin: { },
                            workEnd: { type: "date",  nullable: true },
                            complete: { defaultValue: {value: "0%"} },
                        }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: app.getGridPageSize(),                  
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
            });              
        },
        getClientExecutorName: function(executorId) {
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
        updateClientRecursive: function(client) {
            var that = this;
            
            u.ajaxRequest('client/update-client', client, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);

                    if (client.parentClientId && client.parentClientId != 0 && client.parentClientId != 'null') {
                        var data = {
                            id: client.parentClientId,
                            status: client.status,
                            userHash: app.getActiveUserHash()
                        };
                        private.updateClientRecursive.call(that, data);
                    }
                }
            });            
        },
        setSubclientGridReadonly: function() {
            this.subClientGridReadonly.dataSource.read();
            this.subClientGridReadonly.refresh();
            $('#miatel-subclient-grid').addClass('hide');
            $('#miatel-subclient-grid-readonly').removeClass('hide');                 
        },
        resetSubclientGridReadonly: function() {
            $('#miatel-subclient-grid').removeClass('hide');
            $('#miatel-subclient-grid-readonly').addClass('hide');                                     
        },
        showPopupEditor: function(data) {
            if (typeof data.parentClientId == 'undefined') {
                data.parentClientId = this.clientId || 0;
            }
            var w = $('#client-popup-editor'),
                html = miatelClientPopupTmpl({
                    u: u,
                    data: data,
                    userList: this.userList,
                    defaultInspectorId: this.defaultInspectorId
                });
         
            this.myWindow.content(html);

            w.find('.datepicker').kendoDatePicker({
                format: app.getDateTimeFormat()
            });
            w.find('.combobox').kendoComboBox();
            w.find('select[name="clientInspectorId"]').kendoMultiSelect();
            this.myWindow.center().open();
        },
        hidePopupEditor: function() {
            this.myWindow.close();
        },        
        sendCommentToServer: function(comment, callback) {
            var that = this,
                user = app.getActiveUser(),
                data = {
                    clientId: this.clientId,
                    clientSubject: this.clientInfo.subject,
                    commentAuthorId: user.id,
                    commentDate: u.getCurrentDate(),
                    comment: comment || null,
                    commentAuthorName: user.name,
                    userHash: app.getActiveUserHash()
                };
        
            if (comment) {
                u.ajaxRequest('client/add-client-comment', data, function(err, resp) {
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