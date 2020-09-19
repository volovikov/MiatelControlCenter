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
        myModuleName: 'VatsTreeServersModule',
        mySectionName: 'vats',
        myStorageName: 'serversTreeStorage',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);
            
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
            });   
            app.subscribe('servers-tree-reload', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });
            });            
            app.subscribe('set-tree-filter', this.myModuleName, function(q) {
                that.setTreeFilter.call(that, q);
            });
            app.subscribe('reset-tree-filter', this.myModuleName, function() {
                that.resetTreeFilter.call(that);
            });            
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
            
            private.getServersTreeData.call(this, function(tree) {
                that.rawTreeArr = that.getNodeExpandedCond([tree]);

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
                        return u.getHtmlToQuoteStr(rec.item.text);
                    },
                    change: function(e) {
                        var selected = this.select(),                            
                            item = that.mainTree.dataItem(selected);

                        if (item) {
                            window.location.hash = '#section/' + that.mySectionName + '/tree/servers/server/' + item.id;        
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
        getServersTreeData: function(callback) {
            var that = this;
        
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-server-list-tree&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',                
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        var tree = {
                            id: 0,
                            text: 'Сервера',
                            items: r.data.tree
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