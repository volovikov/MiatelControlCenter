define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleTree.js',
    'js/common/tree/TreeModule',
    'css!./css/wholesaleTree'
], function ($, k, u, common, local, treeModule) {

    var public = {
        myModuleName: 'WholesaleTreeSoftswitchModule',
        myStorageName: 'WholesaleTreeSoftswitchStorage',
        mySectionName: 'wholesale',
        rawTreeArr: [],
        bindEvents: function () {
        },
        run: function (params) {
            for (var key in params) {
                this[key] = params[key];
            }
            this.__proto__.run.call(this, params);
        },
        render: function (callback) {
            var that = this;

            private.getCdrListTreeData.call(this, function (tree) {
                that.rawTreeArr = that.getNodeExpandedCond([tree]);

                var data = new k.data.HierarchicalDataSource({
                    data: that.rawTreeArr
                });
                that.mainTree = that.el.kendoTreeView({
                    dragAndDrop: true,
                    dataSource: data,
                    dataTextField: 'text',
                    dataValueField: 'id',
                    change: function (e) {
                        var selected = this.select(),
                            item = that.mainTree.dataItem(selected);

                        if (item) {
                            window.location.hash = '#section/' + that.mySectionName + '/tree/wholesale-softswitch/wholesale-softswitch/' + item.id;
                        }
                    },
                    expand: function (e) {
                        that.setNodeExpandCond(e.node);
                    },
                    collapse: function (e) {
                        that.unsetNodeExpandCond(e.node);
                    }
                }).data('kendoTreeView');
                callback && callback();
            });
        }
    };
    public.__proto__ = treeModule;

    var private = {
        getCdrListTreeData: function (callback) {
            var tree = {
                id: 0,
                text: 'Softswitch',
                items: [{
                    id: 1,
                    parentId: 0,
                    text: 'Интеллектуальная подмена номеров'
                }, {
                    id: 2,
                    parentId: 0,
                    text: 'Текущие соединения'                
                }]
            };
            callback && callback(tree);
        }
    }
    return public;
});