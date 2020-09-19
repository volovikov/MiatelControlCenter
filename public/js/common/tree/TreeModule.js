define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/tree.js',
    'css!./css/tree'
], function($, k, u, common, local) {
    
    var public = {   
        run: function(params) {
            var that = this;
            
            this.tree = {};
            this.el = params.el;
            this.i18n = $.extend(common, local);               
            this.storeFlag = true; // <-- set true for default. Save cond to local store
            this.bindEvents();
            this.render();
        },
        bindsEvents: function() {
            var that = this;            

            app.subscribe('windows-resize', this.myModuleName, function(size) {
                that.resize(size);
            });
            app.subscribe('splitter-resize', this.myModuleName, function(data) {
                that.el.find('.search-field').width(data.leftWidth - 105);
            });
            app.subscribe('app-load-complete', this.myModuleName, function() {
                setTimeout(function() {                
                    if (that.treeId && that.treeKey) {
                        var scope = that.treeModules[that.treeKey];
                        that.treeModules[that.treeKey].selectTreeNode.call(scope, that.treeId);
                    }
                }, 500);                 
            });
        },
        onClickResetSearchBtn: function(btn) {
            var input = btn.prev().find('input'),
                q = input.val();
            
            if (q != '') {
                input.val('');
                app.publish('reset-tree-filter'); 
            }            
        },
        onClickSearchBtn: function(btn) {
            var minChar = 3,
                el = btn.prev(),
                q = el.val();

            if (q && q.length >= minChar) {
                app.publish('set-tree-filter', q); 
            }
        },        
        resize: function(size) {
            var offset = 200;
            this.el.find('.tree-content').css('height', size.h-offset-61);
        },
        reload: function(callback) {
            this.showTreePreloader();
            this.mainTree && this.mainTree.destroy();
            this.render && this.render(callback);
        },
        showTreePreloader: function() {
            this.el && this.el.html('<div class="k-icon k-loading"></div> Loading...');
        },
        delNode: function(nodeId) {
            var node = this.getNodeById(nodeId);
            node && this.mainTree.remove(node);            
        },
        appendNode: function(rec) {
            // overwite it
        },
        updateNode: function(rec) {
            // overwite it
        },
        selectTreeNode: function(nodeId) { 
            this.mainTree && this.mainTree.select(this.getNodeById(nodeId));
        },
        unselectTreeNode: function() {
            this.mainTree && this.mainTree.select($());
        },
        setNodeExpandCond: function(node) {
            var n = this.mainTree.dataItem(node),
                s = app.getStorage(),
                v = s.get(this.myStorageName);
        
            if (!this.storeFlag) {
                return;
            }
            if (v == null) {
                v = [];
                v.push(n.id);
                s.set(this.myStorageName, v);
            } else {
                if ($.inArray(n.id, v) === -1) {
                    v.push(n.id);
                    s.set(this.myStorageName, v);                     
                }
            }
        },
        unsetNodeExpandCond: function(node) {
            var n = this.mainTree.dataItem(node),
                s = app.getStorage(),
                v = s.get(this.myStorageName);

            if (!this.storeFlag) {
                return;
            }            
            if (v == null) {
                return;
            }
            var p = $.inArray(n.id, v);
            
            if (p !== -1) {
                v.splice(p, 1);
                s.set(this.myStorageName, v);
            }
        },
        getNodeExpandedCond: function(tree) {
            var storage = app.getStorage(),
                v = storage.get(this.myStorageName);

            if (v == null) {
                return tree;
            }
            for (var i in tree) {
                var rec = tree[i];

                if ($.inArray(rec.id, v) !== -1 && rec.items && rec.items.length) {
                    rec.expanded = true;
                }
                if (rec.items && rec.items.length) {
                    this.getNodeExpandedCond(rec.items);
                }
            }
            return tree;
        },        
        getNodeById: function(nodeId) {
            if (typeof nodeId == 'undefined') {
                return;
            }
            var dataSource = this.mainTree.dataSource,
                dataItem = dataSource.get(nodeId);
        
            if (dataItem && dataItem.uid) {
                return this.mainTree.findByUid(dataItem.uid);
            }
        },
        getSearchField: function() {
            return '<span class="k-textbox k-space-right search-field">'                    
                    +'<input type="text" id="icon-right"/>'
                    +'<a href="javascript:;" class="k-icon k-i-search">&nbsp;</a>'                    
                +'</span>'
                + '<span class="k-icon k-i-close" style="cursor: pointer; position: relative; left: 2px;"></span>';
        },
        setTreeFilter: function(txt) {
            var elId = this.el.attr('id');
            
            this.expandAllTreeNodes.call(this, false); //<-- not save to local store expand node cond

            $('#' + elId + ' .k-group .k-group .k-in').closest('li').hide();
            $('#' + elId + ' .k-group .k-group .k-in:contains(' + txt + ')').each(function () {
                $(this).parents('ul, li').each(function () {
                    $(this).show();
                });
            }); 
        },
        resetTreeFilter: function() {
            var elId = this.el.attr('id'); 
            
            this.storeFlag = true;
            this.restoreTreeNodesCondition.call(this);            
            
            $('#' + elId + ' .k-group').find('li').show();
        },
        expandAllTreeNodes: function(storeNodeCond) {
            if (typeof storeNodeCond == 'undefined') {
                this.storeFlag = true;
            } else if (storeNodeCond == false) {
                this.storeFlag = false;
            } else {
                this.storeFlag = true;
            }
            this.mainTree.expand('.k-item');
        },
        collapseAllTreeNodes: function() {
            this.mainTree.collapse('.k-item');
        },
        restoreTreeNodesCondition: function() {
            var data = new k.data.HierarchicalDataSource({
                data: this.getNodeExpandedCond.call(this, this.rawTreeArr),
                sort: {
                    field: "id",
                    dir: "desc"
                }
            });
            this.mainTree.setDataSource(data);
        }
    };
    return public;
});