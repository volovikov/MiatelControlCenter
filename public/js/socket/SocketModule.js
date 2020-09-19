/**
 * Listen socket
 * 
 * @param {type} $
 * @param {type} u
 * @param {type} socket
 * @param {type} common
 * @param {type} local
 * @returns {SocketModule_L10.public}
 */
define([
    'jquery',
    'util',
    'socket',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/auth.js',
], function($, u, io, common, local) {

    var public = {
        myModuleName: 'SocketModule',    
        mccSocket: null,
        chatSocket: null,
        mailSocket: null,
        clientSocket: null,
        messagesSocket: null,
        taskSocketReady: false,
        chatSocketReady: false,        
        mailSocketReady: false,
        run: function() {            
            this.i18n = $.extend(common, local);
            this.mccSocket = io.connect(app.getServerUrl());
            this.chatSocket = io.connect(app.chatServerUrl);
            this.mailSocket = io.connect(app.mailServerUrl);
            this.clientSocket = io.connect(app.clientServerUrl);
            private.bindEvents.call(this);
        }
    };
    var private = {        
        bindEvents: function() {
            var that = this,
                user = app.getActiveUser();

            this.mailSocket.on('mail-socket-ready', function() {
                that.mailSocketReady = true;   
                app.publish('mail-socket-ready');                
            });
            this.mailSocket.on('mail-inbox-error', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                that.mailSocketReady = false;   
                app.publish('mail-inbox-error', data);               
            });
            this.mailSocket.on('mail-inbox-recived', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('mail-inbox-recived', data);               
            }); 
            this.mailSocket.on('mail-inbox-connected', function() {
                this.mailSocletReady = true;
                app.publish('mail-inbox-connected');
            });
            this.mailSocket.on('mail-inbox-disconnected', function() {
                this.mailSocletReady = false;
                app.publish('mail-inbox-disconnected');
            });            
            this.mccSocket.on('update-task-change-history', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('update-task-change-history', data);
            });            
            this.mccSocket.on('update-task', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('update-task', data);
            });
            this.mccSocket.on('set-task-unread', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }                
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('set-task-unread', data);
                }
            });
            this.mccSocket.on('set-task-read', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('set-task-read', data);
                }
            });            
            this.mccSocket.on('add-task', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('add-task', data);
            });
            this.mccSocket.on('del-task', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('del-task', data);
                }                
            });
            this.mccSocket.on('task-socket-ready', function() {
                that.taskSocketReady = true;
                app.publish('task-socket-ready');
            });            
            this.mccSocket.on('add-task-comment', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('add-task-comment', data);
                }
            });
            this.mccSocket.on('del-task-comment', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('del-task-comment', data);
            });
            this.mccSocket.on('update-client-change-history', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('update-client-change-history', data);
            });
            this.mccSocket.on('update-client', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('update-client', data);
            });
            this.mccSocket.on('set-client-unread', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('set-client-unread', data);
                }
            });
            this.mccSocket.on('set-client-read', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('set-client-read', data);
                }
            });
            this.mccSocket.on('add-client', function(data) {    
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('add-client', data);
            });
            this.mccSocket.on('del-client', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.userHash != app.getActiveUserHash()) {
                    app.publish('del-client', data);
                }
            });
            this.mccSocket.on('client-socket-ready', function() {
                that.clientSocketReady = true;
                app.publish('client-socket-ready');
            });
            this.mccSocket.on('client-call', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('client-call', data);
            });
            this.mccSocket.on('client-pay', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('client-pay', data);
            });    
            this.mccSocket.on('notify-operator', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-operator', data);
            });                            
            this.mccSocket.on('notify-client-phone-reserved', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-client-phone-reserved', data);
            });                
            this.mccSocket.on('notify-lockout-client', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-lockout-client', data);
            });    
            this.mccSocket.on('notify-account-make-error', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-account-make-error', data);
            });    
            this.mccSocket.on('notify-change-balance', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-change-balance', data);
            });              
            this.mccSocket.on('notify-invoice-send', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-invoice-send', data);
            });              
            this.mccSocket.on('notify-client-money-end', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-client-money-end', data);
            });            
            this.mccSocket.on('notify-client-contract-filled', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('notify-client-contract-filled', data);
            });
            this.mccSocket.on('add-client-comment', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }                
                app.publish('add-client-comment', data);                
            });
            this.mccSocket.on('del-client-comment', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('del-client-comment', data);
            });
            this.chatSocket.on('chat-socket-ready', function() {
                that.chatSocketReady = true;   
                app.publish('chat-socket-ready');
            });            
            this.chatSocket.on('chat-user-send', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                app.publish('chat-user-send', data);
            });
            app.subscribe('chat-accepted', this.myModuleName, function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                private.chatSocketSend.call(that, 'chat-operator-accept', data);
            });   
            app.subscribe('chat-operator-send', this.myModuleName, function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                private.chatSocketSend.call(that, 'chat-operator-send', data);
            });
            this.chatSocket.on('chat-operator-accept', function(data) {
                if (typeof data == 'undefined' || !data) {
                    return;
                }
                if (data.operator.userHash != app.getActiveUserHash()) {
                    app.publish('chat-other-operator-accept', data);
                } else {
                    app.publish('chat-operator-accept', data);
                }
            });
            this.chatSocket.on('session-socket-ready', function() {
                that.sessionSocketReady = true;   
                app.publish('session-socket-ready');
            });              
        },
        chatSocketSend: function(channel, data) {
            var socketReady = this.apiSocketRady || this.chatSocketReady;
            
            if (!socketReady || !this.chatSocket) {
                return;
            }
            this.chatSocket.emit(channel, data);
        },
        chatSocketRecive: function(channel, callback) {
            var socketReady = this.apiSocketRady || this.chatSocketReady;
            
            if (!socketReady || !this.chatSocket) {
                return;
            }
            this.chatSocket.on(channel, callback)
        },        
    };
    return public;
});