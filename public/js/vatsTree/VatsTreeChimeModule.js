define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsTree.js',
    'js/common/tree/TreeModule',
    'css!./css/vatsTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myModuleName: 'VatsTreeChimeModule',
        mySectionName: 'vats',
        myStorageName: 'chimeTreeStorage',    
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);    
            
            app.subscribe('add-company', this.myModuleName, function(rec) {
                that.appendNode(rec, that.getNodeById(0));
            });            
            app.subscribe('add-client', this.myModuleName, function(rec) {
                var treeData = {
                    subject: rec.subject,
                    id: rec.clientCompanyId
                };
                that.appendNode(treeData, that.getNodeById(0));
            });
            app.subscribe('add-chime', this.myModuleName, function(rec) {
                that.appendNode(rec);
            });
            app.subscribe('del-company', this.myModuleName, function(nodeId) {
                that.delNode(nodeId);
            });            
            app.subscribe('del-chime', this.myModuleName, function(nodeId) {
                that.delNode(nodeId);
            });
            app.subscribe('update-company', this.myModuleName, function(rec) {
                that.updateNode(rec);
            });            
            app.subscribe('update-chime', this.myModuleName, function(rec) {
                that.updateNode(rec);
            });
            app.subscribe('set-tree-filter', this.myModuleName, function(q) {
                that.setTreeFilter.call(that, q);
            });
            app.subscribe('reset-tree-filter', this.myModuleName, function() {
                that.resetTreeFilter.call(that);
            });    
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
            });     
            app.subscribe('chime-tree-reload', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });
            });                      
        },        
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.__proto__.run.call(this, params); 
        },
        appendNode: function(rec, node) {
            var selectedNode = null; 
            
            if (typeof node == 'undefined') {
                selectedNode = this.mainTree.select();
                
                if (selectedNode.length == 0) {
                   selectedNode = null;
                }
            } else {
                selectedNode = node;
            }
            this.mainTree.append({
                text: rec.subject,
                id: rec.id
            }, selectedNode);
        },
        updateNode: function(rec) {
            var node = this.getNodeById(rec.id);
            node && this.mainTree.dataItem(node).set('text', rec.name);
        },
        render: function() {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-chime-list-tree', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.rawTreeArr = that.getNodeExpandedCond([resp.tree]);

                    var data = new k.data.HierarchicalDataSource({
                        data: that.rawTreeArr,
                        sort: {
                            field: "id",
                            dir: "desc"
                        }
                    });
                    that.mainTree = that.el.kendoTreeView({
                        dragAndDrop: true,
                        dataSource: data,
                        dataTextField: 'text',
                        dataValueField: 'id',
                        template: function(rec) {
                            if (typeof rec.item.text != 'undefined') {
                                return u.getHtmlToQuoteStr(rec.item.text);
                            } else {
                                return '';
                            }
                        },
                        change: function(e) {
                            var selected = this.select(),
                                item = that.mainTree.dataItem(selected);

                            if (item) {
                                window.location.hash = '#section/' + that.mySectionName + '/tree/chime/chime/' + item.id;
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