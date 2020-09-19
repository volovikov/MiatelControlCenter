/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @returns {SettingsContentModule_L10.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/settingsContent.js'
], function($, k, u, common, local) {
    
    var public = {        
        myModuleName: 'SettingsContentModule',
        defaultTreeKey: 'property',
        defaultTreeId: '0', //<-- must be string!
        run: function(params) {
            this.el = params.el;
            
            if (typeof params[0] != 'undefined') {
                this.treeKey = params[0].value;                
            }
            if (typeof params[1] != 'undefined') {
                this.treeId = params[1].value;
            }
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('hash-change',  this.myModuleName, function(hashRec) {
                if (typeof hashRec[1] == 'undefined') {
                    that.treeKey = that.defaultTreeKey;                
                } else {
                    that.treeKey = hashRec[1].value;                
                }
                if (typeof hashRec[2] == 'undefined') {
                    that.treeId = that.defaultTreeId;
                } else {
                    that.treeId = hashRec[2].value;
                }
                private.render.call(that);
            }); 
        },
        render: function() {
            var that = this;

            switch (this.treeKey) {
                case 'property':
                    return private.renderProperty.call(that, this.treeId);
                    
                case 'servers':
                    return private.renderServers.call(that, this.treeId);
                    
                case 'whitelist':
                    return private.renderWhitelist.call(that, this.treeId);
            }
        },
        renderProperty: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 1) {
                requirejs(['js/settingsContent/SettingsContentPropertyModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId != 0 && splitTreeId.length == 1) {
                requirejs(['js/settingsContent/SettingsContentAtcChimeListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId != 0 && splitTreeId.length == 2) {
                requirejs(['js/settingsContent/SettingsContentAtcChimeModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                                
            }
        },
        renderServers: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
                requirejs(['js/settingsContent/SettingsServerListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId != 0 && splitTreeId.length == 1) {
                requirejs(['js/settingsContent/SettingsServerModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId != 0 && splitTreeId.length == 2) {
                requirejs(['js/settingsContent/SettingsAsteriskModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                                
            }
        },       
        renderWhitelist: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
                requirejs(['js/settingsContent/SettingsWhiteListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/settingsContent/SettingsWhiteListExeptionsModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId == 2 && splitTreeId.length == 1) {
                requirejs(['js/settingsContent/SettingsWhiteListListingModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                                
            } else {
                requirejs(['js/settingsContent/SettingsWhiteListExeptionsFormModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                 
            }
        }       
    };
    return public;
});