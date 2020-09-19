/**
 * Tree Module for Settings section
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminTree
 * @returns {SettingsTreeModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/settingsTree.js',
    'text!./templates/settings-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/settingsTree'    
], function($, k, u, common, local, settingsTree, treeModule) {
    
    var settingsTreeTmpl = k.template(settingsTree);
    
    var public = {
        treeModules: {},
        myModuleName: 'SettingsTreeModule',
        mySectioName: 'settings',
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
            
            var html = settingsTreeTmpl({
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
            this.renderPropertyTree();
            this.renderServersTree();
        },
        renderPropertyTree: function() {
            var that = this; 

            requirejs(['js/settingsTree/SettingsTreePropertyModule'], function(module) {
                that.treeModules['property'] = module;
                
                module.run({
                    el: that.el.find('#tree-property'),
                    treeId: that.treeId
                });
            });
        },
        renderServersTree: function() {
            var that = this; 

            requirejs(['js/settingsTree/SettingsTreeServersModule'], function(module) {
                that.treeModules['servers'] = module;
                
                module.run({
                    el: that.el.find('#tree-servers'),
                    treeId: that.treeId
                });
            });
        }        
    };
    public.__proto__ = treeModule;

    return public;
});