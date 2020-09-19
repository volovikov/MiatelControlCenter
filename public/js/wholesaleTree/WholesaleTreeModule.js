define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleTree.js',
    'text!./templates/wholesale-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/wholesaleTree'    
], function($, k, u, common, local, transitTree, treeModule) {
    
    var transitTreeTmpl = k.template(transitTree);
    
    var public = {
        treeModules: {},
        myModuleName: 'WholesaleTreeModule',
        deselectAllNode: function(hashRec) {
            var that = this,
                currentTreeKey = hashRec[1] && hashRec[1].value;

            $.each(that.treeModules, function(key, module) {
                if (key != currentTreeKey) {
                    module.unselectTreeNode();
                }
            });            
        },
        selectActiveNode: function(hashRec) {
            var that = this,
                currentTreeKey  = hashRec[1] && hashRec[1].value,
                currentNodeId = hashRec[2] && hashRec[2].value;

            $.each(that.treeModules, function(key, module) {
                if (key == currentTreeKey) {
                    module.selectTreeNode(currentNodeId);
                }
            });
        },        
        run: function(params) {            
            var that = this; 
            
            this.treeKey = params && params[0] && params[0].value;
            this.treeId = params && params[1] && params[1].value;                        
            this.i18n = $.extend(common, local); 
            
            this.__proto__.run.call(this, params);     
            
            setTimeout(function() {           
                if (that.treeId && that.treeKey) {
                    var scope = that.treeModules[that.treeKey];
                    that.treeModules[that.treeKey].selectTreeNode.call(scope, that.treeId);
                }
            }, 500);
        },
        bindEvents: function() {
            var that = this,
                searchEl = '#main-page-settings-tree .k-i-search',
                resetSearchEl = '#main-page-settings-tree .k-i-close';                    
            
            this.__proto__.bindsEvents.call(this);        

            $(document).off('click', searchEl).on( 'click', searchEl, function() {
                that.onClickSearchBtn.call(that, $(this));
            });
            $(document).off('click', resetSearchEl).on( 'click', resetSearchEl, function() {
                that.onClickResetSearchBtn.call(that, $(this));
            });  
            app.subscribe('hash-change', this.myModuleName, function(hashRec) {
                that.deselectAllNode(hashRec);
                that.selectActiveNode(hashRec);
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;                
            });                        
        },  
        render: function() {
            var that = this;
            
            var html = transitTreeTmpl({
                i18n: this.i18n
            });
            this.el.html(html);  
            this.renderToolbar();
            this.renderTree();
        },
        renderToolbar: function() {
            var that = this;
            
            var inputField = treeModule.getSearchField();
        
            this.toolbar = this.el.find('.tree-toolbar').kendoToolBar({
                items: [{
                    template: inputField,
                    overflow: 'never'
                },{
                    type: 'splitButton',
                    text: 'Действия',
                    overflow: 'always',
                    menuButtons: [{
                        text: 'Перезагрузить дерево',
                        icon: 'refresh',
                        click: function() {
                            if (typeof that.treeId == 'undefined') {
                                for (var moduleName in that.treeModules) {
                                    app.publish(moduleName + '-tree-reload');
                                }                                
                            } else {
                                app.publish(that.treeKey + '-tree-reload');
                            }
                        }
                    }]
                }],                
            }).data('kendoToolBar');
        },    
        renderTree: function() {
            this.renderWholesaleMvtsTree();
            this.renderWholesaleCrmTree();
            this.renderWholesaleSoftswitchTree();
        },
        renderWholesaleCrmTree: function(){
            var that=this;
            requirejs(['js/wholesaleTree/WholesaleTreeCrmModule'], function(module) {
                that.treeModules['wholesale-crm'] = module;

                module.run({
                    el: that.el.find('#tree-wholesale-crm'),
                    treeId: that.treeId
                });
                
            });
        },
        renderWholesaleMvtsTree: function() {
            var that = this; 

            requirejs(['js/wholesaleTree/WholesaleTreeMvtsModule'], function(module) {
                that.treeModules['wholesale-mvts'] = module;

                module.run({
                    el: that.el.find('#tree-wholesale-mvts'),
                    treeId: that.treeId
                });
                
            });
        },
        renderWholesaleSoftswitchTree: function() {
            var that = this;

            requirejs(['js/wholesaleTree/WholesaleTreeSoftswitchModule'], function(module) {
                that.treeModules['wholesale-softswitch'] = module;

                module.run({
                    el: that.el.find('#tree-wholesale-softswitch'),
                    treeId: that.treeId
                });

            });
        }
    };
    public.__proto__ = treeModule;

    return public;
});