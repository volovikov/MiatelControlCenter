define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js'
], function($, k, u, common, local) {
    
    var public = {        
        myModuleName: 'WholesaleContentModule',
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
                case 'wholesale-mvts':
                    return private.renderMvts.call(that, this.treeId);
                case 'wholesale-crm':
                    return private.renderCrm.call(that, this.treeId);
                case 'wholesale-softswitch':
                    return private.renderSoftswitch.call(that, this.treeId);
            }
        },  
        renderCrm: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {/*
                requirejs(['js/transitContent/MvtsModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });
                }); */              
            // }else if (treeId == 1 && splitTreeId.length == 1) {
            //     requirejs(['js/transitContent/CrmClientModule'], function(module) {
            //         module.run({
            //             el: that.el,
            //             treeId: treeId
            //         });
            //     });
            // }else if (splitTreeId[0] == 1 && splitTreeId.length>1){
            //     requirejs(['js/transitContent/CrmClientFormModule'], function(module) {
            //         module.run({
            //             el: that.el,
            //             treeId: treeId
            //         });
            //     });
            }else if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmDeals.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId == 2 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmJurisdiction.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId == 3 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmCompanies.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId == 4 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmZones.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId == 5 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmCurrency.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId == 6 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleCrmGroups.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (splitTreeId[0] == 7) {
                requirejs(['js/wholesaleContent/WholesaleCrmRoles.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (splitTreeId[0] == 8) {
                requirejs(['js/wholesaleContent/WholesaleTasksContentModule.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });
            }else if (splitTreeId[0] == 9) {
                requirejs(['js/wholesaleContent/WholesaleCrmStatCountCallModule.js'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });                    
                });
            }
        },
        renderMvts: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            // if (treeId == 0) {
            //     requirejs(['js/wholesaleContent/MvtsModule'], function(module) {
            //         module.run({
            //             el: that.el,
            //             treeId: treeId
            //         });
            //     });                
            // }else 
            if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleMvtsHidezoneModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId == 2 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleMvtsCdrListModule'], function (module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId == 3 && splitTreeId.length == 1) {
                requirejs(['js/wholesaleContent/WholesaleMvtsClientListModule'], function (module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }
        },
        renderCdr: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
                requirejs(['js/transitContent/TransitCdrListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }
        },
        renderBlacklist: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
                requirejs(['js/transitContent/TransitBlacklistModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            }else if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/transitContent/TransitBlacklistRulesModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (splitTreeId[0] == 1 && splitTreeId.length>1) {
                requirejs(['js/transitContent/TransitBlacklistRulesFormModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            }else if (treeId == 2 && splitTreeId.length == 1) {
                requirejs(['js/transitContent/TransitBlacklistExclusionModule'], function(module) {
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
                requirejs(['js/transitContent/TransitWhiteListModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/transitContent/TransitWhiteListExeptionsModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId == 2 && splitTreeId.length == 1) {
                requirejs(['js/transitContent/TransitWhiteListListingModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else {
                requirejs(['js/transitContent/TransitWhiteListExeptionsFormModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            }
    },
    renderSfAonPull: function(treeId) {
            var that = this,
                splitTreeId = treeId.split('-');

            if (treeId == 0) {
    /*            requirejs(['js/transitContent/TransitAonPullModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });
                });*/
            } else if (treeId == 1 && splitTreeId.length == 1) {
                requirejs(['js/transitContent/TransitSfAonPoolModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (splitTreeId[0] == 1 && splitTreeId.length>1) {
                requirejs(['js/transitContent/TransitSfAonPoolFormModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });                
            } else if (treeId[0] == 2 && splitTreeId.length==1) {
                requirejs(['js/transitContent/TransitSfAonPrefixModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId[0] == 3 && splitTreeId.length==1) {
                requirejs(['js/transitContent/TransitSfAonAuthModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } else if (treeId[0] == 4 && splitTreeId[1]==1) {
                requirejs(['js/transitContent/TransitSfAonCurrentCallModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            }else if (treeId[0] == 4 && splitTreeId[1]==2) {
                requirejs(['js/transitContent/TransitSfAonCdrModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });                    
                });
            } /*else if (splitTreeId[0] == 2 && splitTreeId.length>1) {
                requirejs(['js/transitContent/TransitAonPrefixFormModule'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: treeId
                    });
                });
            }*/
        }       
    };

    return public;
});
