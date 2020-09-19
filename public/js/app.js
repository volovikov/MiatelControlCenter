/**
 *  General application module
 * 
 * @param {type} $
 * @param {type} authModule
 * @param {type} mainPanelModule
 * @returns {app_L8.public}
 */
define([
    'jquery',
    'util',
    'storage',
    'i18n!js/common/nls/ru-ru/main.js',
    'js/auth/AuthModule',
    'js/mainpanel/MainPanelModule',
    'js/socket/SocketModule',
    'css!/css/main'
], function($, u, s, i18n, AuthModule, MainPanelModule, SocketModule) {

    var public = {
        myModuleName: 'app',        
        defaultSection: [{
            key: 'section',
            value: 'miatel'
        }],
        user: {},
        contratSignFineMsgShort: 'Заключение договора прошло успешно',
        contractSignFineMsg: 'Заключение договора прошло успешно. Дополнительная информация отправлена Вам на электронную почту и доступна в соответсвующих разделах Контроль и Платежи',        
        mccUserRobotId: 31,
        vatsGlobalId: 'customer79112639718', //<-- какая ВАТС будет звонить Клиенту
        serverUrl: 'https://mcc.miatel.ru/',
        voiceipServerUrl: 'https://ip35.miatel.ru/api/',
        wwwServerUrl: 'https://miatel.net/api/',
        chatServerUrl: 'https://io.miatel.ru/',  
        mailServerUrl: 'https://mcc-dev.miatel.ru/',
        clientServerUrl: 'https://mcc-dev.miatel.ru/',
        transitServerUrl: 'https://wholesale.miatel.ru/',
        wholesaleServerUrl: 'https://sql1.miatel.ru/',
        eventsListeners:  {},
        run: function(settings) {  
            var that = this,
                moduleCounter = 0,
                totalModuleLoaded = 0,
                watcherFunc = null;

            if (window.requirejs) {
                var originalFunc = window.requirejs;
                
                window.requirejs = function(b, c, d, e) {
                    setTimeout(function() {
                        ++moduleCounter;
                    }, 100);
                    
                    return originalFunc(b, c, d, e);
                };                
            }
            var watcherFunc = setInterval(function() {
                if (totalModuleLoaded == moduleCounter) {
                    app.publish('app-load-complete');
                    clearInterval(watcherFunc);
                } else {
                    totalModuleLoaded = moduleCounter;
                }
            }, 500);
            
            if (typeof settings  != 'undefined') {
                for(var key in settings) {
                   var  value = settings[key];
                   this[key] = value;
                }
            }
            // BB
            // upgrade standart method of Jquery 
            // need for search register case insensitive
            //
            $.expr[":"].contains = $.expr.createPseudo(function(arg) {
                return function( elem ) {
                    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
                };
            });
            var storage = this.getStorage();
            this.i18n = i18n;
            storage.remove('loadedSection');
            
            $.ajaxSetup({
               type: 'post'
            });            
            private.bindEvents.call(this);
            private.isUserLogined.call(this, function(err, activeUser) {
                if (err) {
                    AuthModule.run();
                } else {
                    app.setActiveUser(activeUser);                    
                    MainPanelModule.run();
                    SocketModule.run();
                }
            });
        },
        publish: function(eventName, params) {
console.log(eventName);
            if (this.eventsListeners[eventName]) {
                var modules = this.eventsListeners[eventName];
                
                $.each(modules, function(i, func) {
                    func(params);
                });
            }
        },
        subscribe: function(eventName, moduleName, eventListener) {            
            if (!this.eventsListeners[eventName]) {
                this.eventsListeners[eventName] = eval('({' + moduleName +':[]})');
            }  else if (typeof this.eventsListeners[eventName][moduleName] == 'undefined') {
                this.eventsListeners[eventName][moduleName] = [];
            }   
            if (this.eventsListeners[eventName][moduleName].length == 0) {
                this.eventsListeners[eventName][moduleName] = eventListener;
            }
        },
        unsubscribe: function(eventName) {
            this.eventsListeners[eventName] = [];
        },
        goto: function(hash) {
            location.hash = '#' + hash;
        },
        getServerUrl: function() {
            return this.serverUrl;
        },
        getServerApiUrl: function() {
            return this.getServerUrl() + 'api/';
        },
        showPopupMsg: function(type, title, message) {
            this.notification.show({
                title: title,
                message: message
            }, type);
        },
        showPopupErrors: function(errorsArr) {
            if (typeof errorsArr == 'undefined') {
                return this.showPopupMsg('bad', this.i18n.err.title, this.i18n.err.crytical);
            }
            for (var i in errorsArr) {
                var errId = errorsArr[i];

                if (typeof this.i18n.err[errId] != 'undefined') {
                    msg = this.i18n.err[errId];
                } else {
                    msg = this.i18n.err.crytical;
                }
                this.showPopupMsg('bad', this.i18n.err.title, msg);
            }
        },
        getDateTimeFormat: function() {
            //return '{0: yyyy-MM-dd HH:mm:ss}';
            return 'yyyy-MM-dd HH:mm:ss';
        },
        getDateFormat: function() {
            return 'yyyy-MM-dd';
        },        
        setActiveUser: function(prop) {
            this.getStorage().set('activeUser', prop);
        },
        getActiveUser: function() {
            return this.getStorage().get('activeUser');  
        },
        getActiveUserHash: function() {
            return this.getActiveUser().userHash || '';
        },
        getActiveSection: function() {
            var rec = private.getCommandFromHash.call(this, this.serverUrl + window.location.hash);
            
            if (typeof rec[0].value != 'undefined') {
                return rec[0].value;
            } else {
                return this.defaultSection[0].value;
            }
        },
        getStorage: function() {
            return $.localStorage;
        },
        getMccRootPassword: function() {
            return 'vfvfvskfhfve414116';
            //return 'jl4qweRTV';
        },
        getReadTimeout: function() {
            return 2000; //2 sec and user read task
        },
        isFullAccessCode: function(sectionAccessCode) {
            for (var i in sectionAccessCode) {
                var accessCode = sectionAccessCode[i];

                if (accessCode.name == 'Полный доступ') {
                    return true;
                }
            }
            return false;
        },
        showPreloader: function(c) {
            var el = $('#main-page');            
        
            if (el) {
                el.prepend("<div class='k-loading-mask' style='width:100%;height:100%'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'><div class='k-loading-color'></div></div></div>");
            }    
        },
        hidePreloader: function() {
            var el = $('#main-page');
            
            if (el) {
                el.find("div.k-loading-mask").remove();
            }
        },
        getPageSizes: function() {
            return [20, 50, 150, 500];
        },
        getGridPageSize: function() {
            return 20;
        }
    };
    var private = {        
        bindEvents: function() {
            var that = this;
            
            $(document).ready(function() {
                that.publish('document-ready');
                private.buildPopupNotification.call(that);                             
            });
            $(window).resize(function() {
                that.publish('windows-resize', {
                    w: $(window).width(),
                    h: $(window).height()
                });
            });
            $(window).on('hashchange', function(e) {
                var e = e.originalEvent,
                    res = private.getCommandFromHash.call(that, e.newURL);
                    
                app.publish('hash-change', res);
            });  
            app.subscribe('app-ready', this.myModuleName, function() {
                /**
                 * listen this event. If event come 
                 * then send command from hash in order that app
                 * load condition from hash
                 */
                if (window.location.hash) {
                    cmd = private.getCommandFromHash.call(that, that.serverUrl + window.location.hash);
                } else {
                    cmd = that.defaultSection;
                }
                app.publish('hash-change', cmd);
            });
            app.subscribe('preloader-show', this.myModuleName, function() {
                that.showPreloader.call(that);
            });
            app.subscribe("preloader-hide", this.myModuleName, function() {
                that.hidePreloader.call(that);
            });
        },
        getCommandFromHash: function(hash) {
            var str = hash.substr(this.serverUrl.length + 1); //<-- cut common addres
                str = str.split('/'),
                arr = [], 
                obj = {};

            for (var i = 0; i<str.length; i=i+2) {
                arr.push({
                    key: str[i],
                    value: str[i+1]
                });                
            }
            return arr;
        },        
        isUserLogined: function(callback) {
            u.ajaxRequest('is-user-logined', function(err, resp) {
                callback && callback(err, resp);
            });
        },
        buildPopupNotification: function() {
            this.notification = $('#notification').kendoNotification({
                position: {
                    button: true,
                    // pinned: true,
                    bottom: 30,
                    right: 30
                },
                autoHideAfter: 10000, // 10 sec
                stacking: 'up',
                notification: true,
                templates: [{
                    type: 'bad',
                    template: $('#bad-template').html()
                }, {
                    type: 'good',
                    template: $('#good-template').html()
                }]
            }).data('kendoNotification');            
        }        
    };
    return public;
});