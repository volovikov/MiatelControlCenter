define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'css!./css/miatelContent'
], function($, k, u, common, local) {
    
    var public = {
        myModuleName: 'MiatelContentModule',
        run: function(params) {
            if (typeof params[0] != 'undefined') {
                this.treeKey = params[0].value;                
            }
            if (typeof params[1] != 'undefined') {
                this.treeId = params[1].value;
            }
            this.el = params.el;
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            app.subscribe('windows-resize', this.myModuleName, function(size) {
                private.resize.call(that, size);
            }); 
            app.subscribe('hash-change', this.myModuleName, function(hashRec) {
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
                case 'members':
                    requirejs(['js/miatelContent/MiatelContentMembersModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                    
                    break;
                    
                case 'tasks':
                    requirejs(['js/miatelContent/MiatelContentTaskModule'], function(module) {
                        module.run({
                            el: that.el,
                            taskId: that.treeId
                        });
                    });                    
                    break;
                    
                case 'site':
                    requirejs(['js/miatelContent/MiatelContentSiteModule'], function(module) {
                        module.run({
                            el: that.el,
                            treeId: that.treeId
                        });
                    });                    
                    break;                    
            }
        },
        resize: function(size) {
            var offset = 250,
                w = parseInt(size.w) - 498;

            this.el.css('width', w);
            this.el.find('.main-content-wrapper').css('height', size.h-offset-17);
        }
    };
    return public;
});