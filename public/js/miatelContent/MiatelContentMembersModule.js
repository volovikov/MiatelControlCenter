define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'css!./css/miatelContent'
], function($, k, u, common, local) {
    
    var public = {
        myModuleName: 'MiatelContentMembersModule',
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
           var that = this,
               splitTreeId = this.treeId.split('-');
        
            if (this.treeId == 0) {
                requirejs(['js/miatelContent/MiatelContentDepartmentList'], function(module) {
                    module.run({
                        el: that.el,
                        treeId: that.treeId
                    });
                });                                                         
            } else {
                switch (splitTreeId.length) {
                    case 1:
                        requirejs(['js/miatelContent/MiatelContentDepartment'], function(module) {
                            module.run({
                                el: that.el,
                                treeId: that.treeId
                            });
                        });                         
                        break;
                        
                    case 2:
                        requirejs(['js/miatelContent/MiatelContentMemberForm'], function(module) {
                            module.run({
                                el: that.el,
                                treeId: that.treeId
                            });
                        });                         
                        break;
                }
            }
        }
    };
    return public;
});