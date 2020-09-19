/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @returns {AdminContentModule_L10.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
], function($, k, u, common, local) {
    
    var public = {        
        myModuleName: 'AdminContentModule',
        defaultTreeKey: 'users',
        defaultTreeId: 0,
        run: function(params) {
            
            this.el = params.el;
            
            this.treeKey = params && params[0] && params[0].value;
            this.treeId = params && params[1] && params[1].value;            
            
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
                case 'company':
                    return private.renderCompany.call(that, this.treeId);
                    
                case 'innerusers':
                    return private.renderInnerUsers.call(that, this.treeId);
                    
                case 'tariff':
                    return private.renderTarifs.call(that, this.treeId);
                  
                case 'phone':
                    return private.renderPhones.call(that, this.treeId);
                
                case 'chime':
                    return private.renderChimes.call(that, this.treeId);
            }
        },
        renderCompany: function(treeId) {
            var that = this; 

            if (treeId == 0) {
                requirejs(['js/adminContent/AdminContentCompanyStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                                
            } else {
                requirejs(['js/adminContent/AdminContentCompanyModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                
            }
        },
        renderInnerUsers: function(treeId) {
            var that = this; 

            requirejs(['js/adminContent/AdminContentInnerUsersModule'], function(module) {
                module.run({
                    el: that.el,
                    treeId: that.treeId
                });                
            });             
        },
        renderPhones: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
                    requirejs(['js/adminContent/AdminContentPhoneAllModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });                        
                    });                                         
            } else {
                switch (splitTreeId.length) {
                    case 1:
                        requirejs(['js/adminContent/AdminContentPhoneCountryModule'], function(module) {
                            module.run({
                                el: that.el,
                                treeId: that.treeId
                            });                            
                        });                     
                        break;

                    case 2:
                        requirejs(['js/adminContent/AdminContentPhoneCityModule'], function(module) {
                            module.run({
                                el: that.el,
                                treeId: that.treeId
                            });                            
                        });                      
                        break;

                    case 3: 
                        requirejs(['js/adminContent/AdminContentPhoneTypeModule'], function(module) {
                            module.run({
                                el: that.el,
                                treeId: that.treeId
                            });                            
                        });                        
                        break;
                }
            }             
        },
        renderTarifs: function(treeId) {
            var that = this; 

            if (treeId == 0) {
                requirejs(['js/adminContent/AdminContentTariffStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                                
            } else {
                requirejs(['js/adminContent/AdminContentTariffModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                
            }       
        },
        renderChimes: function(treeId) {
            var that = this; 

            if (treeId == 0) {
                requirejs(['js/adminContent/AdminContentChimeStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                                
            } else {
                requirejs(['js/adminContent/AdminContentChimeModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });                
            }            
        }
    };
    return public;
});