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
        myModuleName: 'VatsTreePropertyModule',
        mySectionName: 'vats',
        myStorageName: 'propertyTreeStorage',     
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);
            
            app.subscribe('add-atc-chime', this.myModuleName, function(rec) {
                that.appendNode.call(that, rec);
            });
            app.subscribe('del-atc-chime', this.myModuleName, function(nodeId) {
                that.delNode.call(that, nodeId);
            });
            app.subscribe('update-atc-chime', this.myModuleName, function(rec) {
                that.updateNode.call(that, rec);
            });    
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
            });   
            app.subscribe('property-tree-reload', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });
            });
        },    
        delNode: function(nodeId) {
            this.__proto__.delNode.call(this, '2-'+nodeId);
        },   
        appendNode: function(rec) {
            var selectedNode = this.mainTree.select();

            if (selectedNode.length == 0) {
                selectedNode = null;
            }
            this.mainTree.append({
                text: rec.chimeName,
                id: '2-' + rec.id
            }, selectedNode);
        },        
        updateNode: function(rec) {
            var nodeId = '2-' + rec.id
                node = this.getNodeById(nodeId);
                
            node && this.mainTree.dataItem(node).set('text', rec.chimeName);
        },        
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }  
            this.__proto__.run.call(this, params); 
        },     
        render: function(callback) {
            var that = this;
            
            treeModule.showTreePreloader();
            
            private.getSettingsTreeData.call(this, function(tree) {
                that.rawTreeArr = that.getNodeExpandedCond([tree]);

                var data = new k.data.HierarchicalDataSource({
                    data: that.rawTreeArr
                });
                that.mainTree = that.el.kendoTreeView({
                    dragAndDrop: true,
                    dataSource: data,               
                    dataTextField: 'text',
                    dataValueField: 'id',
                    template: function(rec) {
                        return u.getHtmlToQuoteStr(rec.item.text);
                    },
                    change: function(e) {
                        var selected = this.select(),                            
                            item = that.mainTree.dataItem(selected);

                        if (item) {
                            window.location.hash = '#section/' + that.mySectionName + '/tree/property/property/' + item.id;        
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
            });               
        }
    };    
    public.__proto__ = treeModule;
    
    var private = {
        getSettingsTreeData: function(callback) {
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-atc-chime-list&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',                
                success: function(resp) {
                    var r = JSON.parse(resp),
                        arr = [];

                    if (r.success) { 
                        for (var i in r.data.list) {
                            var el = r.data.list[i];

                            arr.push({
                                id: '2-' + el.id,
                                text: el.chimeName,
                                parentId: 2
                            });
                        }
                        var tree = {
                            id: 0,
                            text: 'Свойства',
                            items: [{
                                id: 1,
                                parentId: 0,
                                text: 'Основные'
                            },{
                                id: 2,
                                parentId: 0,
                                text: 'Готовые схемы',
                                items: arr
                            }]                    
                        }; 
                        callback && callback(tree);
                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        }
    }
    return public;
});