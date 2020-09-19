define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitTree.js',
    'text!./templates/transit-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/transitTree'    
], function($, k, u, common, local, transitTree, treeModule) {
    
    var transitTreeTmpl = k.template(transitTree);
    
    var public = {
        treeModules: {},
        myModuleName: 'TransitTreeModule',
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
            
            //
            // ВВ
            // Это можно убрать. Делается в родительском модуле
            // /common/TreeModule
            // И начинает отсчет от app-load-complete
            // события
            //
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
            this.renderWhiteListTree();
            this.renderCdrListTree();
//            this.renderAonTree();
            this.renderSfAonTree();
            this.renderBlacklistTree();
            this.renderMvtsTree();
            this.renderCrmTree();
        },
        /*renderCrmTree: function(){
            var that=this;
            requirejs(['js/transitTree/CrmTreeModule'], function(module) {
                that.treeModules['crm'] = module;

                module.run({
                    el: that.el.find('#tree-crm'),
                    treeId: that.treeId
                });
                
            });
        },*/
        renderMvtsTree: function() {
            var that = this; 

            requirejs(['js/transitTree/MvtsTreeModule'], function(module) {
                that.treeModules['mvts'] = module;

                module.run({
                    el: that.el.find('#tree-mvts'),
                    treeId: that.treeId
                });
                
            });
        },               
        renderWhiteListTree: function() {
            var that = this; 

            requirejs(['js/transitTree/TransitTreeWhiteListModule'], function(module) {
                that.treeModules['whitelist'] = module;

                module.run({
                    el: that.el.find('#tree-whitelist'),
                    treeId: that.treeId
                });
                
            });
        },               
        renderCdrListTree: function() {
            var that = this; 

            requirejs(['js/transitTree/TransitTreeCdrModule'], function(module) {
                that.treeModules['cdr'] = module;

                module.run({
                    el: that.el.find('#tree-cdr'),
                    treeId: that.treeId
                });
                
            });
        },       
        renderSfAonTree: function() {
            var that = this; 

            requirejs(['js/transitTree/TransitTreeSfAonModule'], function(module) {
                that.treeModules['sf-aon'] = module;

                module.run({
                    el: that.el.find('#tree-sf-aon'),
                    treeId: that.treeId
                });
                
            });
        },  
  /*      renderAonTree: function() {
            var that = this; 

            requirejs(['js/transitTree/TransitTreeAonModule'], function(module) {
                that.treeModules['aon'] = module;

                module.run({
                    el: that.el.find('#tree-aon'),
                    treeId: that.treeId
                });
                
            });
        },     */          
        renderBlacklistTree: function() {
            var that = this; 

            requirejs(['js/transitTree/TransitTreeBlacklistModule'], function(module) {
                that.treeModules['blacklist'] = module;

                module.run({
                    el: that.el.find('#tree-blacklist'),
                    treeId: that.treeId
                });
                
            });
        },               

    };
    public.__proto__ = treeModule;

    return public;
});