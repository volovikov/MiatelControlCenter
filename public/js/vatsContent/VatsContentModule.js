define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
], function($, k, u, common, local) {
    
    var public = {        
        myModuleName: 'VatsContentModule',
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
                case 'clients':
                    return private.renderClients.call(that, this.treeId);

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
                    
                case 'property':
                    return private.renderProperty.call(that, this.treeId);     
                
                case 'servers':
                    return private.renderServers.call(that, this.treeId);
                    
                case 'tests':
                    return private.renderTests.call(that, this.treeId);                    
            }
        },
        renderClients: function(treeId) {
            var that = this;

            requirejs(['js/vatsContent/VatsContentClientModule'], function(module) {
                module.run({
                    el: that.el,
                    clientId: that.treeId
                });

            });
        },
        renderCompany: function(treeId) {
            var that = this; 

            if (treeId == 0) {
                requirejs(['js/vatsContent/VatsContentCompanyStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });

                });                                
            } else {
                requirejs(['js/vatsContent/VatsContentCompanyModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });

                });                
            }
        },
        renderInnerUsers: function(treeId) {
            var that = this; 

            requirejs(['js/vatsContent/VatsContentInnerUsersModule'], function(module) {
                module.run({
                    el: that.el,
                    treeId: that.treeId
                });

            });             
        },
        renderPhones: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            switch (treeId) {
                default:
                case 'city':
                    switch (splitTreeId.length) {
                        case 1:
                            requirejs(['js/vatsContent/VatsContentPhoneCountryModule'], function(module) {
                                module.run({
                                    el: that.el,
                                    treeId: that.treeId
                                });

                            });                     
                            break;

                        case 2:
                            requirejs(['js/vatsContent/VatsContentPhoneCityModule'], function(module) {
                                module.run({
                                    el: that.el,
                                    treeId: that.treeId
                                });

                            });                      
                            break;

                        case 3: 
                            requirejs(['js/vatsContent/VatsContentPhoneTypeModule'], function(module) {
                                module.run({
                                    el: that.el,
                                    treeId: that.treeId
                                });

                            });                        
                            break;
                    }                    
                    break;
                    
                case 'federal':
                    requirejs(['js/vatsContent/VatsContentPhoneFederalModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });
                    break;
                    
                case 'mobile':
                    requirejs(['js/vatsContent/VatsContentPhoneMobileModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });
                    break;
            }          
        },
        renderTarifs: function(treeId) {
            var that = this; 

            if (treeId == 0) {
                requirejs(['js/vatsContent/VatsContentTariffStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });

                });                                
            } else {
                requirejs(['js/vatsContent/VatsContentTariffModule'], function(module) {
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
                requirejs(['js/vatsContent/VatsContentChimeStatisticModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });

                });                                
            } else {
                requirejs(['js/vatsContent/VatsContentChimeModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });

                });                
            }            
        },
        renderProperty: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 1) {
                requirejs(['js/vatsContent/VatsContentPropertyModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });

                });
            } else if (treeId != 0 && splitTreeId.length == 1) {
                requirejs(['js/vatsContent/VatsContentAtcChimeListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });

                });                
            } else if (treeId != 0 && splitTreeId.length == 2) {
                requirejs(['js/vatsContent/VatsContentAtcChimeModule'], function(module) {
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
                requirejs(['js/vatsContent/VatsServerListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });

                });
            } else if (treeId != 0 && splitTreeId.length == 1) {
                requirejs(['js/vatsContent/VatsServerModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });

                });                
            } else if (treeId != 0 && splitTreeId.length == 2) {
                requirejs(['js/vatsContent/VatsAsteriskModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });

                });                                
            }            
        },
        renderTasks: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');
        
            requirejs(['js/vatsContent/VatsContentTaskModule'], function(module) {
                module.run({
                    el: that.el,
                    taskId: treeId
                });

            });            
        },
        renderTests: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');
        
            requirejs(['js/vatsContent/VatsContentTestsModule'], function(module) {
                module.run({
                    el: that.el,
                    treeId: treeId
                });

            });
            
        }
        
    };
    return public;
});