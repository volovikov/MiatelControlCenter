define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitTree.js',
    'js/common/tree/TreeModule',
    'css!./css/transitTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myModuleName: 'TransitTreeWhiteListModule',
        myStorageName: 'WhiteListTreeStorage',     
        mySectionName: 'transit',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);
            
            app.subscribe('update-whitelist-client', this.myModuleName, function(rec) {
                that.updateNode.call(that, rec);
            });
            app.subscribe('add-whitelist-client', this.myModuleName, function(rec) {
                that.appendNode.call(that, rec);
            });
        },   
        appendNode: function(rec) {
            var selectedNode = this.mainTree.select();
            
            if (selectedNode.length == 0) {
                selectedNode = null;
            }
            this.mainTree.append({
                text: rec.clientName,
                id: rec.id
            }, selectedNode);
        },        
        updateNode: function(rec) {
            var node = this.getNodeById('2-' + rec.id);
            node && this.mainTree.dataItem(node).set('text', rec.clientName);            
        },
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }  
            this.__proto__.run.call(this, params); 
        },     
        render: function(callback) {
            var that = this;
                
            private.getWhiteListTreeData.call(this, function(tree) {
                that.rawTreeArr = that.getNodeExpandedCond([tree]);

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
                            window.location.hash = '#section/' + that.mySectionName + '/tree/whitelist/whitelist/' + item.id;        
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
        getWhiteListTreeData: function(callback) {
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-white-client-list',
                type: 'post',                
                success: function(resp) {
                    var r = JSON.parse(resp),
                        arr = [];

                    if (r.success) { 
                        for (var i in r.data.list) {
                            var el = r.data.list[i];

                            arr.push({
                                id: '2-' + el.id,
                                text: el.clientName,
                                parentId: 1
                            });
                        }
                        var tree = {
                            id: 0,
                            text: 'Белые списки',
                            items: [{
                                id: 1,
                                parentId: 0,
                                text: 'Исключения',
                                items: arr
                            },{
                                id: 2,
                                parentId: 0,
                                text: 'Список'                                
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