/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} treeModule
 * @returns {AdminTreePhonesModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminTree.js',
    'js/common/tree/TreeModule',
    'css!./css/adminTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myModuleName: 'AdminTreePhonesModule',
        mySectionName: 'admin',
        myStorageName: 'phonesTreeStorage',     
        rawTreeArr: [],
        bindEvents: function() {
            var that = this
            
            this.__proto__.bindsEvents.call(this);    
            
            app.subscribe('add-phone', this.myModuleName, function(rec) {
                that.appendNode(rec);
            });
            app.subscribe('del-phone', this.myModuleName, function(nodeId) {
                that.delNode(nodeId);
            });
            app.subscribe('update-phone', this.myModuleName, function(rec) {
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
            app.subscribe('phone-tree-reload', this.myModuleName, function() {
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
        appendNode: function(rec) {
            var selectedNode = this.mainTree.select();
            
            if (selectedNode.length == 0) {
                selectedNode = null;
            }
            this.mainTree.append({
                text: rec.subject,
                id: rec.id
            }, selectedNode);
        },
        updateNode: function(rec) {
            var node = this.getNodeById(rec.id);
            node && this.mainTree.dataItem(node).set('text', rec.phone);
        },        
        render: function(callback) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-phone-list-tree', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.rawTreeArr = that.getNodeExpandedCond([resp.tree]);
            
                    var data = new k.data.HierarchicalDataSource({
                        data: that.rawTreeArr
                    });
                    that.mainTree = that.el.kendoTreeView({
                        dragAndDrop: true,
                        dataSource: data,               
                        dataTextField: 'text',
                        dataValueField: 'id',
                        change: function(e) {
                            var selected = this.select(),                            
                                item = that.mainTree.dataItem(selected);

                            if (item) {
                                window.location.hash = '#section/' + that.mySectionName + '/tree/phone/phone/' + item.id;        
                            }
                        },
                        expand: function(e) {
                            that.setNodeExpandCond(e.node);
                        },
                        collapse: function(e) {
                            that.unsetNodeExpandCond(e.node);                             
                        }
                    }).data('kendoTreeView');        
                    
                    callback && callback();
                }
            });
        }
    };    
    public.__proto__ = treeModule;
    
    return public;
});