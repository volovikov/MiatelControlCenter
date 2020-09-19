define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelTree.js',
    'js/common/tree/TreeModule',
    'css!./css/miatelTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myModuleName: 'MiatelTreeSiteModule',
        mySectionName: 'miatel',
        myStorageName: 'siteTreeStorage',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);    
            
            app.subscribe('add-site-menu', this.myModuleName, function(rec) {
                that.appendNode(rec);
            });
            app.subscribe('del-site-menu', this.myModuleName, function(rec) {
                that.delNode(rec);
            });
            app.subscribe('update-site-menu', this.myModuleName, function(rec) {
                that.updateNode(rec);
            });
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
            });     
        },        
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.__proto__.run.call(this, params); 
        },
        appendNode: function(rec) {
            var selectedNode = this.mainTree.dataSource.get(rec.menuParentId),
                el = this.mainTree.findByUid(selectedNode.uid); //<-- uid need!

            if (!el) {
                return;
            }    
            this.mainTree.append({
                text: rec.menuName || '',
                id: rec.menuId
            }, el); 
        },
        delNode: function(rec) {
            var node = this.getNodeById(rec.menuId);
            node && this.mainTree.remove(node);            
        },        
        updateNode: function(rec) {
            var node = this.getNodeById(rec.menuId);
            node && this.mainTree.dataItem(node).set('text', rec.menuName);
        },
        render: function() {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                };
            
            treeModule.showTreePreloader();
            
            u.ajaxRequest('site/get-site-menu-tree', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.rawTreeArr = that.getNodeExpandedCond([resp.tree]);
            
                    var data = new k.data.HierarchicalDataSource({
                        data: that.rawTreeArr
                    });
                    that.mainTree = that.el.kendoTreeView({
                        dragAndDrop: false,
                        dataSource: data,
                        dataTextField: 'text',
                        dataValueField: 'id',
                        change: function(e) {
                            var selected = this.select(),
                                item = that.mainTree.dataItem(selected);

                            if (item) {
                                window.location.hash = '#section/' + that.mySectionName + '/tree/site/site/' + item.id;
                            }
                        },
                        expand: function(e) {
                            that.setNodeExpandCond(e.node);
                        },
                        collapse: function(e) {
                            that.unsetNodeExpandCond(e.node);                             
                        }
                    }).data('kendoTreeView');                    
                }
            });
        }
    };    
    public.__proto__ = treeModule;
    
    return public;
});