/**
 * General main panel module
 * 
 * @param {type} $
 * @param {type} kendo
 * @param {type} util
 * @returns {mainPanelModule_L8.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/mainpanel.js',
    'text!./templates/main-page.html',
    'text!./templates/main-page-menu.html',
    'text!./templates/main-page-tabs.html',
    'text!./templates/main-page-footer.html',
    'text!./templates/main-page-chat.html',
    'text!./templates/main-page-chat-accept.html',
    'text!./templates/main-page-menu-notify.html',
    'css!./css/mainpanel'
], function($, k, u, common, local, mainPage, mainPageMenu, mainPageTabs, mainPageFooter,
mainPageChat, mainPageAcceptChat, mainPageMenuNotify) {

    var mainPageTmpl = k.template(mainPage),
        mainPageMenuTmpl = k.template(mainPageMenu),
        mainPageFooterTmpl = k.template(mainPageFooter),
        mainPageTabsTmpl = k.template(mainPageTabs),
        mainPageChatTmpl = k.template(mainPageChat),
        mainPageChatAcceptTmpl = k.template(mainPageAcceptChat),
        mainPageMenuNotifyTmpl = k.template(mainPageMenuNotify);
    
    var public = {
        userRobotId: 31,
        userNotifyCount: 0,
        mccBlinkGongFn: null,
        mccBlinkStatus: false,
        mccBlinkTimeout: 50,
        mccBlinkFn: null,
        mccOriginTitle: '',
        myModuleName: 'MainPanelModule',
        chatWindow: null,
        chatWindowsTabs: null,
        chatAcceptWindow: null,
        chatAcceptedUserList: [], 
        chatDiscardedUserList: [],
        chatRequestAcceptData: null,
        run: function() {     
            this.mccOriginTitle = document.title; //<-- store orogin title            
            this.modules = {
                miatel: [{
                    elemId: 'main-page-miatel-tree',
                    module: 'js/miatelTree/MiatelTreeModule'      
                },{
                    elemId: 'main-page-miatel-content',
                    module: 'js/miatelContent/MiatelContentModule'                          
                }],
                vats:[{
                    elemId: 'main-page-vats-tree',
                    module: 'js/vatsTree/VatsTreeModule'      
                },{
                    elemId: 'main-page-vats-content',
                    module: 'js/vatsContent/VatsContentModule'                          
                }],                   
                transit: [{
                    elemId: 'main-page-transit-tree',
                    module: 'js/transitTree/TransitTreeModule'                        
                },{
                    elemId: 'main-page-transit-content',
                    module: 'js/transitContent/TransitContentModule'                         
                }],
                wholesale: [{
                    elemId: 'main-page-wholesale-tree',
                    module: 'js/wholesaleTree/WholesaleTreeModule'
                },{
                    elemId: 'main-page-wholesale-content',
                    module: 'js/wholesaleContent/WholesaleContentModule'
                }]
            };
            this.i18n = $.extend(common, local);
            this.el = $('#main-page');             
            private.bindEvents.call(this);
            private.render.call(this);            
            app.publish('app-ready');
        },
        onClickLogoff: function() {
            u.ajaxRequest('logoff', {userHash: app.getActiveUserHash()}, function(err, resp) {
                if (!err) {
                    app.getStorage().removeAll();
                    location.href = '';
                }
            });
        },
        onClickDialogSubmitBtn: function(btn) {
            var el = btn.closest('.chat-user-room'),                    
                msg = el.find('textarea').val(),
                userRoomId = el.attr('id'),
                userHash = el.attr('data-user-hash');

            if (el && msg) {
                el.find('.text-user-input').val('');
                app.publish('chat-operator-send', {
                    userRoomId: userRoomId,
                    userHash: userHash,
                    operatorHash: app.getActiveUserHash(),
                    operatorName: app.getActiveUser().name,
                    msg: msg
                });
            }            
        },
        onClickDialogCancelBtn: function() {
            this.chatAcceptWindow.close();
        },
        onChatWindowsOpen: function() {
            if (!this.chatWindowsTabs) {
                this.chatWindowsTabs = $('#main-page-chat-tabs').kendoTabStrip({
                    animation:  {
                        open: {
                            effects: 'fadeIn'
                        }
                    }              
                }).data('kendoTabStrip');
            }          
            this.chatWindowsTabs.append([{
                text: this.chatRequestAcceptData.userName,
                content: mainPageChatTmpl({
                    i18n: this.i18n,
                    userHash: this.chatRequestAcceptData.userHash || this.chatRequestAcceptData.userName,
                    userRoomId: private.getChatUserRoomId(this.chatRequestAcceptData)
                })
            }]);
            this.chatWindowsTabs.select(0); // ??        
            this.chatWindow.center();
        },
        onAddTaskNotify: function(data) {   
            var that = this,
                user = app.getActiveUser(),
                taskAuthorArr = [data.taskAuthorId],
                taskExecutorArr = [data.taskExecutorId],                
                url = app.serverUrl + '#section/control/tree/tasks/task/' + data.taskId,
                msg = data.changeMessage + '<br><a href="' + url + '">перейти</a>' ,
                taskInspectorArr;
        
            if ($.isArray(data.taskInspectorId)) {
                taskInspectorArr = data.taskInspectorId;
            } else {
                taskInspectorArr = [data.taskInspectorId];
            }
            var sendTaskNotify = function() {
                app.showPopupMsg('good', that.i18n.mainPanel.taskAccept, msg);
                private.addTaskNotify.call(that, msg, data.taskAuthorId, [user.id]);                
            };   
            if (typeof data.changeUserId == 'undefined' || data.changeUserId  == user.id) {
                return;
            } else if (taskAuthorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            } else if (taskExecutorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            } else if (taskInspectorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            }    
        },
        onUpdateTaskNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                taskAuthorArr = [data.taskAuthorId],
                taskExecutorArr = [data.taskExecutorId],
                url = app.serverUrl + '#section/control/tree/tasks/task/' + data.taskId,
                msg = data.changeMessage + '<br><a href="' + url + '">перейти</a>' ,
                taskInspectorArr;

            if ($.isArray(data.taskInspectorId)) {
                taskInspectorArr = data.taskInspectorId;
            } else {
                taskInspectorArr = [data.taskInspectorId];
            }
            var sendTaskNotify = function() {
                app.showPopupMsg('good', that.i18n.mainPanel.taskAccept, msg);
                private.addTaskNotify.call(that, msg, data.taskAuthorId, [user.id]);                
            };   
            if (typeof data.changeUserId == 'undefined' || data.changeUserId  == user.id) {
                return;
            } else if (taskAuthorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            } else if (taskExecutorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            } else if (taskInspectorArr.indexOf(user.id.toString()) != -1) {
                sendTaskNotify();
            }
        },
        onAddTaskCommentNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                taskExecutorArr = [data.taskExecutorId],
                url = app.serverUrl + '#section/control/tree/tasks/task/' + data.taskId,
                msg = data.commentAuthorName + ' прокомментировал задачу ' + data.taskSubject + '&nbsp;<a href="' + url + '">перейти</a>';

            if (data.changeUserId  == user.id) {
                return;
            } else if (typeof taskExecutorArr == 'undefined') {
                return;
            } else if (taskExecutorArr.indexOf(user.id.toString()) != -1) {
                app.showPopupMsg('good', this.i18n.mainPanel.taskAccept, msg);                
                private.addTaskNotify.call(that, msg, data.taskAuthorId, [user.id]);
            }                        
        },
        onAddClientCallNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientCall + data.subject  + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', this.i18n.mainPanel.taskAccept, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);
        },
        onAddClientContractDataNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientContractFilled + data.subject  + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', this.i18n.mainPanel.taskAccept, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);
        },
        onAddClientPayNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientPay + data.subject  + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', this.i18n.mainPanel.taskAccept, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);
        },
        onAddClientMakeAccountErrorNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/company/company/' + data.companyId,
                msg = this.i18n.mainPanel.clientMakeAccountError + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('bad', this.i18n.err.title, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);            
        },        
        onAddClientMoneyEndNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientMoneyEnd + data.subject  + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('bad', this.i18n.err.title, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);
        },
        onAddClientInvoiceSendNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientInvoiceSend + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', 'Внимание!', msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);            
        },
        onAddClientChangeBalanceNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.clientId,
                msg = this.i18n.mainPanel.clientChangeBalanceSend + ' ' +data.clienName +'<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', 'Внимание!', msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);            
        },        
        onAddClientLockoutNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.clientId,
                msg = this.i18n.mainPanel.clientLockout + ' ' +data.clienName +'<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('bad', 'Внимание!', msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);              
        },
        onUpdateClientNotify: function(data) {
            // BB
            // Вызывается этот метод
            // когда клиенту добавляется комментарий. 
            // В этом случае этих полей нет. И я не вызываю нотификаицю 
            // 
            if (typeof data.clientOwnerId == 'undefined') {
                return;
            }
            var that = this,
                user = app.getActiveUser(),
                clientOwnerArr = [data.clientOwnerId],
                clientInspectorId = data.clientInspectorId,
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.clientId,
                msg = data.changeMessage + '<br><a href="' + url + '">перейти</a>' ;

            var sendClientNotify = function() {
                app.showPopupMsg('good', that.i18n.mainPanel.taskAccept, msg);
                private.addClientNotify.call(that, msg, data.clientAuthorId, [user.id]);
            };
            if (data.changeUserId == user.id) {
                return;
            } else if (clientOwnerArr.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            } else if (clientInspectorId.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            }
        },
        onAddClientNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                clientOwnerArr = [data.clientOwnerId],
                clientInspectorArr = data.clientInspectorId && data.clientInspectorId.split(',') || [],
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = this.i18n.mainPanel.clientRegister + ' ' + data.subject + '<br><a href="' + url + '">перейти</a>' ;

            var sendClientNotify = function() {
                app.showPopupMsg('good', that.i18n.mainPanel.taskAccept, msg);
                private.addClientNotify.call(that, msg, data.clientOwnerId, [user.id]);
            };
            if (data.changeUserId == user.id) {
                return;
            } else {
                sendClientNotify();
            }
            /*
             * ВВ
             * это новая регистрация. Уведомление всем должно приходить
             *         
            if (clientOwnerArr.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            } else if (clientInspectorArr.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            }
            */
        },
        onAddClientCommentNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                clientOwnerArr = [data.clientOwnerId],
                clientInspectorArr = data.clientInspectorId,
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.clientId,
                msg = data.commentAuthorName + ' прокомментировал клиента ' + data.clientSubject + '&nbsp;<a href="' + url + '">перейти</a>';
        
            var sendClientNotify = function() {
                app.showPopupMsg('good', that.i18n.mainPanel.taskAccept, msg);
                private.addClientNotify.call(that, msg, data.clientOwnerId, [user.id]);
            };
            if (data.changeUserId  == user.id) {
                return;
            } else if (clientOwnerArr.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            } else if (clientInspectorArr.indexOf(user.id.toString()) != -1) {
                sendClientNotify();
            }
        },
        onAddClientPhoneReservedNotify: function(data) {
            var that = this,
                user = app.getActiveUser(),
                url = app.serverUrl + '#section/vats/tree/clients/client/' + data.id,
                msg = data.message  + '<br><a href="' + url + '">перейти</a>';

            app.showPopupMsg('good', this.i18n.info.title, msg);
            private.addClientNotify.call(that, msg, this.userRobotId, [user.id]);         
        },
        onAddOperatorNotify: function(data) {
            var that = this,
                user = app.getActiveUser();

            var sendNotify = function(message, operatorId) {
                app.showPopupMsg('good', that.i18n.mainPanel.operatorNotify, message);
                private.addClientNotify.call(that, message, app.mccUserRobotId, operatorId);
            };
            if (typeof data.operatorTargetId != 'undefined') {
                if (data.operatorTargetId.indexOf(user.id)) {
                    sendNotify(data.message, [user.id]);
                }
            } else {
                sendNotify(data.message, [user.id]);
            }            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('user-entered', that.myModuleName, function(v) {
                app.setActiveUser(v);
                that.reload.call(that);
            });
            $(document).on('click', '#chat-accept-submit-btn', function() {
                private.setChatAccepted.call(that);
                private.setChatActive.call(that, that.chatRequestAcceptData);
            });
            $(document).on('click', '#chat-accept-cancel-btn', function() {
                that.onClickDialogCancelBtn.call(that);
            });
            $(document).on('click', '.chat-submit-btn', function(e) {
                that.onClickDialogSubmitBtn.call(that, $(this));
            });
            $(document).on('click', '#logoff', function() {
                that.onClickLogoff.call(that);
            });
            $(document).on('click', '#main-page-tabs .k-tabstrip-items .k-item', function() {
                var id = $(this).attr('id');
                
                if (id) {
                    var section = $(this).attr('id').replace('section-', '');
                    app.goto('section/' + section);
                }                
            });
            $(document).on('keydown', '.text-user-input', function(e) {                
                if (e.keyCode == 13) {
                    if (e.shiftKey) {
                        $(this).val($(this).val() + '\n');
                    } else {
                        e.preventDefault();
                        var btn = $(this).parent().parent().find('.chat-submit-btn');
                        that.onClickDialogSubmitBtn.call(that, btn);
                    }
                }
            });            
            app.subscribe('hash-change', this.myModuleName, function(rec) {
                var sectionName = rec[0].value,
                    params = rec.slice(1);


                if (sectionName == 'logoff') {
                    private.logoff.call(that);
                } else {
                    private.loadModule.call(that, sectionName, params);
                    private.setActiveTab.call(that, sectionName);                    
                }
                if (that.topmenu) {
                    that.topmenu.close('#main-page-user-notify');
                }
            });
            app.subscribe('windows-resize', this.myModuleName, function(size) {
                private.resize.call(that, size);
            }); 
            app.subscribe('chat-user-send', this.myModuleName, function(data) {
                if (private.isUserDialogAccepted.call(that, data)) {
                    private.stopTitleBlink.call(that);
                    private.setChatActive.call(that, data);
                    private.pushUserMessage.call(that, data.msg, private.getChatUserRoomId(data));
                } else if (!private.isUserOtherOpertatorAccepted.call(that, data)) {
                    private.showUserAcceptDialog.call(that, data);
                    private.startTitleBlink.call(that, that.i18n.mainPanel.chat.attentionUserWrite); //<--data.userName
                    private.playGong.call(that);
                }
            });
            app.subscribe('chat-operator-send', this.myModuleName, function(data) {
                private.pushOperatorMessage.call(that, data);
            });   
            app.subscribe('chat-other-operator-accept', this.myModuleName, function(data) {
                private.stopGong.call(that);
                private.stopTitleBlink.call(that);
                that.chatAcceptWindow.close();
                that.chatDiscardedUserList.push(data.user);
                
                // BB
                // data.operator - info about other operator
                // data.user - info about user
                //
                app.showPopupMsg('good', that.i18n.mainPanel.chat.acceptTitle, that.i18n.mainPanel.chat.otherOperatorAccept);                
            });
            app.subscribe('add-task', this.myModuleName, function(data) {
                that.onAddTaskNotify.call(that, data);
            });            
            app.subscribe('update-task-change-history', this.myModuleName, function(data) {
                that.onUpdateTaskNotify.call(that, data);
            });   
            app.subscribe('add-task-comment', this.myModuleName, function(data) {
                that.onAddTaskCommentNotify.call(that, data);
            });
            app.subscribe('add-client', this.myModuleName, function(data) {
                that.onAddClientNotify.call(that, data);
            });
            app.subscribe('update-client-change-history', this.myModuleName, function(data) {
                that.onUpdateClientNotify.call(that, data);
            });
            app.subscribe('add-client-comment', this.myModuleName, function(data) {
                that.onAddClientCommentNotify.call(that, data);
            });
            $(document).on('click', '#task-clear-notify-btn', function() {
                private.delTaskNotify.call(that, $(this));
            });
            $(document).on('click', '#client-clear-notify-btn', function() {
                private.delClientNotify.call(that, $(this));
            });
            app.subscribe('client-call', this.myModuleName, function(data) {
                that.onAddClientCallNotify.call(that, data);
            });
            app.subscribe('notify-client-contract-filled', this.myModuleName, function(data) {
                that.onAddClientContractDataNotify.call(that, data);
            });      
            app.subscribe('notify-lockout-client', this.myModuleName, function(data) {
                that.onAddClientLockoutNotify.call(that, data);
            });                                          
            app.subscribe('notify-change-balance', this.myModuleName, function(data) {
                that.onAddClientChangeBalanceNotify.call(that, data);
            });                              
            app.subscribe('notify-invoice-send', this.myModuleName, function(data) {
                that.onAddClientInvoiceSendNotify.call(that, data);
            });
            app.subscribe('client-pay', this.myModuleName, function(data) {
                that.onAddClientPayNotify.call(that, data);
            });
            app.subscribe('notify-account-make-error', this.myModuleName, function(data) {
                that.onAddClientMakeAccountErrorNotify.call(that, data);
            });            
            app.subscribe('notify-client-money-end', this.myModuleName, function(data) {
                that.onAddClientMoneyEndNotify.call(that, data);
            });
            app.subscribe('notify-client-phone-reserved', this.myModuleName, function(data) {
                that.onAddClientPhoneReservedNotify.call(that, data);
            });    
            app.subscribe('notify-operator', this.myModuleName, function(data) {
                that.onAddOperatorNotify.call(that, data);
            });              
            app.subscribe('app-load-complete', this.myModuleName, function() {
                app.publish('windows-resize', private.getWindowSize.call(that));
                app.publish('splitter-resize', private.getPanelSize.call(that));                                    
            });               
        },
        setActiveTab: function(sectionName) {
            var tab = $('#section-'+sectionName),
                index = tab.attr('data-index');
        
            if (index) {
                this.tabs.select(index);
            } else {
                this.tabs.select(0); // miatel
            }            
        },
        loadModule: function(moduleName, params) {            
            var that = this,
                storage = app.getStorage(),
                pathes = this.modules[moduleName];
        
            if (app.getActiveSection() == storage.get('loadedSection')) {
                return;
            }        
            if (typeof pathes == 'undefined') {
                pathes = this.modules[app.defaultSection[0].value];
            }  
            $.each(pathes, function(i, rec) {
                requirejs([rec.module], function(module) {
                    module && module.run($.extend({
                        el: $('#' + rec.elemId)
                    }, params));
                 
                    storage.set('loadedSection', moduleName);                    
                });
            });
        }, 
        getSectionAccess: function(sectionAccessCode) {
            var sectionAccess = [];

            if (app.isFullAccessCode(sectionAccessCode)) {
                sectionAccessCode = [{
                    section: 'Миател'
                },{
                    section: 'Виртуальная АТС'
                },{
                    section: 'Транзитная АТС'
                },{
                    section: 'Транзитная АТС 2.0'
                }];
            }
            for (var i in sectionAccessCode) {
                var el = sectionAccessCode[i];
                
                sectionAccess.push(el.section);
            }
            sectionAccess.push('Миател');
            return sectionAccess;
        },
        render: function() {   
            var user = app.getActiveUser(),
                access = eval(user.sectionAccessCode),
                sectionAccess = private.getSectionAccess(access);

            var userId = user.departmentId + '-' + user.id;

            var that = this,
                html = mainPageTmpl({
                i18n: this.i18n,
                chatAccept: mainPageChatAcceptTmpl({
                    i18n: this.i18n
                }),
                topmenu: mainPageMenuTmpl({
                    name: user.name,
                    userId: userId,
                    i18n: this.i18n                    
                }),
                tabs: mainPageTabsTmpl({
                    i18n: this.i18n,
                    sectionAccess: sectionAccess
                }),
                footer: mainPageFooterTmpl({
                    version: app.version,
                    i18n: this.i18n
                })
            });
            this.el.html(html);
            this.el.find('.content-wrapper').kendoSplitter({
                panes: [{
                    collapsible: true,
                    size: '20%'
                }],
                resize: function(e) {                    
                    app.publish('splitter-resize', private.getPanelSize());
                }
            });
            this.topmenu = this.el.find('#main-page-topmenu').kendoMenu().data('kendoMenu');
            
            this.tabs = this.el.find('#main-page-tabs').kendoTabStrip({
                animation:  {
                    open: {
                        effects: 'fadeIn'
                    }
                }              
            })
            .data('kendoTabStrip');       
    
            this.chatAcceptWindow = this.el.find('#main-page-chat-accept').kendoWindow({
                visible: false,
                modal: true,
                resizable: false,
                width: '380px',
                height: '100px',
                open: function() {
                    var msg = that.i18n.mainPanel.chat.chatAccept + that.chatRequestAcceptData.userName + '?';
                    $('#chat-accept').removeClass('hidden');
                    $('#chat-accept-msg').html('<p>' + msg + '</p>');
                    that.chatAcceptWindow.center();
                },
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },                
                title: this.i18n.mainPanel.chat.acceptTitle
            }).data('kendoWindow');
            
            this.chatWindow = this.el.find('#main-page-chat').kendoWindow({
                width: '380px',
                height: '415px',
                actions: ['Minimize', 'Close'],
                visible: false,
                open: function() {
                    that.onChatWindowsOpen.call(that);
                },
                animation: {
                    open: {
                        duration: 100
                    },
                    close: {
                        duration: 100
                    }
                },
                resizable: false,
                modal: true,
                title: this.i18n.mainPanel.chat.dialogTitle,
            }).data('kendoWindow');
            
            private.renderTaskNotifyList.call(that);
            private.renderClientNotifyList.call(that);
        },
        resize: function(size) {
            var offset = 200;

            this.el.css('height', size.h);
            this.el.find('#main-page-content-wrapper').css('height', size.h - 65);
            this.el.find('#main-page-content').css('height', size.h - 65-34-25);
            this.el.find('#main-page-tabs>.k-content').css('height', size.h-offset+1); //<-- only first level
            this.el.find('.content-wrapper').css('height', size.h-offset-1);
            
            // BB
            // this change height splitter and 
            // content, but tree this not changed
            // replace it in future!
            //
            this.el.find('.k-splitbar').css('height', size.h-offset-1);
            this.el.find('.main-content').css('height', size.h-offset-1);
            this.el.find('.main-tree').css('height', size.h-offset-1);
        },
        getPanelSize: function() {
            var anchor = 'main-page-' + app.getActiveSection(); // main-page-control || main-page-admin .. etc

            if (!$('#' + anchor + '-tree').length) {
                return {
                    leftWidth: 0,
                    leftHeight: 0,
                    rightWidth: 0,
                    rightHeight: 0,                
                };  
            } else {
                return {
                    leftWidth: $('#' + anchor + '-tree').css('width').replace('px', ''),
                    leftHeight: $('#' + anchor + '-tree').css('height').replace('px', ''),
                    rightWidth: $('#' + anchor + '-tree').css('width').replace('px', ''),
                    rightHeight: $('#' + anchor + '-tree').css('height').replace('px', ''),                
                };               
            }
        },
        getWindowSize: function() {
            return {
                w: $(window).width() + 54, // fuck!
                h: $(window).height()                  
            };
        },
        getChatUserRoomId: function(user) {
            if (user.userHash) {
                return 'u-' + user.userHash;
            } else {
                return 'u-' + user.userName.replace(/[^a-zA-Zа-яА-Я0-9]/g, '');
            }
        },
        setChatActive: function(data) {
            var that = this,
                chatUserRoomId = private.getChatUserRoomId(data),
                chatRoomEl = $('#' + chatUserRoomId).parent(),
                chatRoomId = chatRoomEl.attr('id');

            var arr = chatRoomEl.prev().prev().find('li');

            $.each(arr, function(i, e) {
                var el = $(e);
                
                if (el.attr('aria-controls') == chatRoomId) {
                    that.chatWindowsTabs.select(i);
                }
            });
        },
        chatScrollTop: function(chatUserRoomId) {
            var el = $('#'+chatUserRoomId),
                dialog = el.find('.dialog');
        
            dialog.scrollTop(99999);
        },       
        setChatAccepted: function() {
            var data = this.chatRequestAcceptData;
        
            if (this.chatRequestAcceptData) {
                this.chatAcceptedUserList.push(data);                
                this.chatAcceptWindow.close();
                this.chatWindow.open();
                private.stopGong.call(this);
                private.stopTitleBlink.call(this);
                private.pushUserMessage.call(this, 
                    this.chatRequestAcceptData.msg, 
                    private.getChatUserRoomId(this.chatRequestAcceptData)
                );                
                app.publish('chat-accepted', {
                    user: this.chatRequestAcceptData,
                    operator: app.getActiveUser()
                });
            }            
        },
        isUserOtherOpertatorAccepted: function(data) {
            for (var i in this.chatDiscardedUserList) {
                var el = this.chatDiscardedUserList[i];
                
                if (el.userHash && el.userHash == data.userHash) {
                    return true;
                } else if (!el.userHash && el.userName == data.userName) {
                    return true;
                }
            }
            return false;
        },
        isUserDialogAccepted: function(data) {
            for (var i in this.chatAcceptedUserList) {
                var el = this.chatAcceptedUserList[i];

                if (data.userHash && el.userHash == data.userHash) {
                    return true;
                } else if (data.userName && el.userName == data.userName) {
                    return true;
                }
            }
            return false;
        },
        showUserAcceptDialog: function(data) {
            this.chatRequestAcceptData = data;
            this.chatAcceptWindow.open();            
        },
        pushUserMessage: function(msg, chatUserRoomId) {        
            if (!this.chatWindow) {
                return;
            } else if (this.chatWindow.element.is(':hidden')) {
                this.chatWindow.open();
            }
            var d = new Date(),
                el = $('#'+chatUserRoomId),
                dialog = el.find('.dialog'),
                textarea = el.find('.text-user-input'),
                h = d.getHours(),
                m = d.getMinutes();
                        
            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }            
            if (!dialog) {
                return;
            }
            var html = '<div align="right">' +
                '<div class="message message-from">' +
                    '<div class="message-date">' +
                        h+':'+m+
                    '</div>' +
                    '<span>' +
                        msg + 
                    '</span>' +                
                '</div>' +
            '</div>';
    
            dialog.append(html);
            //textarea.val('');
            private.chatScrollTop(chatUserRoomId);
        },
        pushOperatorMessage: function(data) {
            var d = new Date(),
                el = $('#'+data.userRoomId),
                dialog = el.find('.dialog'),
                textarea = el.find('.text-user-input'),
                h = d.getHours(),
                m = d.getMinutes();

            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }
            if (!dialog) {
                return;
            }
            var html = '<div align="left">' +
                '<div class="message message-to">'+
                    '<span>' +
                        data.msg + 
                    '</span>' +
                    '<div class="message-date">' +
                        h+':'+m+
                    '</div>' +
                '</div>' +
            '</div>';
    
            dialog.append(html); 
            //textarea.val('');
            private.chatScrollTop(data.userRoomId);
        },
        startTitleBlink: function(txt) {
            var that = this;
            
            if (this.mccBlinkFn == null) {
                this.mccBlinkFn = setInterval(function() {
                    if (!that.mccBlinkStatus) {
                        if (document.title == that.mccOriginTitle) {
                            document.title = txt;
                        } else {
                            document.title = that.mccOriginTitle;
                        }                        
                    }
                }, this. mccBlinkTimeout);
            }

        },
        stopTitleBlink: function() {
            clearInterval(this.mccBlinkFn);
            document.title = this.mccOriginTitle;
        },
        playGong: function() {
            var html = '<audio style="display:none" id="gong" src="/sound/chat-gong.mp3"></audio>',
                audioEl = $(document).find('#gong');
        
            if (this.mccBlinkGongFn) {
                return;
            }    
            if (!audioEl.length) {
                var player = $('#main-page').append(html).find('audio')[0];
            }                            
            this.mccBlinkGongFn = setInterval(function() {
                player && player.play();
            }, this.mccBlinkTimeout * 10);
        },
        stopGong: function() {
            var audioEl = $(document).find('#gong');

            if (audioEl.length) {
                audioEl.remove();   
                clearInterval(this.mccBlinkGongFn);
            }
        },
        renderTaskNotifyList: function() {
            var that = this,
                user = app.getActiveUser(),
                userTargetId = user.id,
                menuItem = $("#main-page-task-notify"),
                content = $('#main-page-task-notify-menu');
        
            var data = {
                userHash: app.getActiveUserHash(),
                userTargetId: userTargetId
            };
            u.ajaxRequest('task/get-task-notify-list', data, function(err, resp) {
                if (!err) {
                    if (resp.total > 0) {
                        menuItem.addClass('attention');
                    } else {
                        menuItem.removeClass('attention');
                    }
                    content.html(mainPageMenuNotifyTmpl({
                        i18n: that.i18n,
                        list: resp.list,
                        total: resp.total,
                        userTargetId: userTargetId,
                        key: 'task'
                    }));
                } else {
                    app.showPopupErrors(resp);
                }
            });                       
        },
        addTaskNotify: function(msg, notifyAuthorId, notifyTargetUserId) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    msg: msg,
                    notifyAuthorId: notifyAuthorId,
                    notifyTargetUserId: notifyTargetUserId
                };
            u.ajaxRequest('task/add-task-notify', data, function(err, resp) {
                if (!err) {
                    private.renderTaskNotifyList.call(that);
                } else {    
                    app.showPopupErrors(resp);
                }
            });
        },
        delTaskNotify: function(btn) {
            var that = this,
                userTargetId = btn.attr('data-user-target-id'),
                data = {
                    userTargetId: userTargetId,
                    userHash: app.getActiveUserHash()
                };

            if (userTargetId) {
                u.ajaxRequest('task/del-task-notify', data, function(err, resp) {
                    if (!err) {
                        that.topmenu.close('#main-page-task-notify-menu');
                        private.renderTaskNotifyList.call(that);
                    } else {
                        app.showPopupErrors(resp);
                    }
                })
            }
        },
        renderClientNotifyList: function() {
            var that = this,
                user = app.getActiveUser(),
                userTargetId = user.id,
                menuItem = $("#main-page-client-notify"),
                content = $('#main-page-client-notify-menu');

            var data = {
                userHash: app.getActiveUserHash(),
                userTargetId: userTargetId
            };
            u.ajaxRequest('client/get-client-notify-list', data, function(err, resp) {
                if (!err) {
                    if (resp.total > 0) {
                        menuItem.addClass('attention');
                    } else {
                        menuItem.removeClass('attention');
                    }
                    content.html(mainPageMenuNotifyTmpl({
                        i18n: that.i18n,
                        list: resp.list,
                        total: resp.total,
                        userTargetId: userTargetId,
                        key: 'client'
                    }));
                } else {
                    app.showPopupErrors(resp);
                }
            });
        },
        addClientNotify: function(msg, notifyAuthorId, notifyTargetUserId) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash(),
                    msg: msg,
                    notifyAuthorId: notifyAuthorId,
                    notifyTargetUserId: notifyTargetUserId
                };
            u.ajaxRequest('client/add-client-notify', data, function(err, resp) {
                if (!err) {
                    private.renderClientNotifyList.call(that);
                } else {
                    app.showPopupErrors(resp);
                }
            });
        },
        delClientNotify: function(btn) {
            var that = this,
                userTargetId = btn.attr('data-user-target-id'),
                data = {
                    userTargetId: userTargetId,
                    userHash: app.getActiveUserHash()
                };

            if (userTargetId) {
                u.ajaxRequest('client/del-client-notify', data, function(err, resp) {
                    if (!err) {
                        that.topmenu.close('#main-page-client-notify-menu');
                        private.renderClientNotifyList.call(that);
                    } else {
                        app.showPopupErrors(resp);
                    }
                })
            }
        }
    };
    return public;
});