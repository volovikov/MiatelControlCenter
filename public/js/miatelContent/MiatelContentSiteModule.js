define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'css!./css/miatelContent'
], function($, k, u, common, local) {
    
    var public = {
        myModuleName: 'MiatelContentSiteModule',
        run: function(params) {    
            this.treeId = params.treeId;
            this.el = params.el;
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

        },
        render: function() {
            var that = this;
   
            switch (this.treeId) {
                case 'language': 
                    requirejs(['js/miatelContent/MiatelContentSiteLanguageModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                    
                    break
                    
                case 'template': 
                    requirejs(['js/miatelContent/MiatelContentSiteTemplateModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                    
                    break
                    
                default:    
                case 'menu':
                    requirejs(['js/miatelContent/MiatelContentSiteMenuModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                    
                    break
                    
                case 'news':
                    requirejs(['js/miatelContent/MiatelContentSiteNewsModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                        
                    break
                    
                case 'content':
                    requirejs(['js/miatelContent/MiatelContentSiteContentModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                        
                    break
            }   
        }
    };
    return public;
});