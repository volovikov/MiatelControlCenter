/**
 * Admin section tree
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminTree
 * @param {type} treeModule
 * @returns {Object}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminTree.js',
    'text!./templates/admin-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/adminTree'
], function($, k, u, common, local, adminTree, treeModule) {
    
    var adminTreeTmpl = k.template(adminTree);

    var public = {
        treeModules: {},
        myModuleName: 'AdminTreeModule',
        mySectionName: 'admin',
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
        bindEvents: function() {
            var that = this,
                searchEl = '#main-page-admin-tree .k-i-search',
                resetSearchEl = '#main-page-admin-tree .k-i-close';                    
            
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
        render: function() {
            var that = this;
            
            var html = adminTreeTmpl({
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
            this.renderCompanyTree();
            this.renderPhonesTree();
            this.renderTarifsTree();
            this.renderChimesTree();
        },
        renderCompanyTree: function() {
            var that = this; 

            requirejs(['js/adminTree/AdminTreeCompanyModule'], function(module) {
                that.treeModules['company'] = module;
                that.treeModules['innerusers'] = module;
                
                module.run({
                    el: that.el.find('#tree-company'),
                    treeId: that.treeId
                });
            }); 
        },
        renderPhonesTree: function() {
            var that = this; 

            requirejs(['js/adminTree/AdminTreePhonesModule'], function(module) {
                that.treeModules['phone'] = module;
                
                module.run({
                    el: that.el.find('#tree-phone'),
                    treeId: that.treeId
                });
            });
        },
        renderTarifsTree: function() {
            var that = this; 

            requirejs(['js/adminTree/AdminTreeTariffModule'], function(module) {
                that.treeModules['tariff'] = module;
                
                module.run({
                    el: that.el.find('#tree-tariff'),
                    treeId: that.treeId
                });
            });            
        },
        renderChimesTree: function() {
            var that = this; 

            requirejs(['js/adminTree/AdminTreeChimeModule'], function(module) {
                that.treeModules['chime'] = module;
                
                module.run({
                    el: that.el.find('#tree-chime'),
                    treeId: that.treeId
                });
            });
        }
    };
    public.__proto__ = treeModule;

    return public;
});