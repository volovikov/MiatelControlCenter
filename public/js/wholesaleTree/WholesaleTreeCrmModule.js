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
        myModuleName: 'WholesaleTreeCrmModule',
        myStorageName: 'WholesaleTreeCrmStorage',
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
                            window.location.hash = '#section/' + that.mySectionName + '/tree/wholesale-crm/wholesale-crm/' + item.id;
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
                text: 'CRM',
                items: [{
                    id: 1,
                    parentId: 0,
                    text: 'Сделки'
                }, {
                    id: 2,
                    parentId: 0,
                    text: 'Юрисдикции'
                }, {
                    id: 3,
                    parentId: 0,
                    text: 'Компании'
                }, {
                    id: 4,
                    parentId: 0,
                    text: 'Зоны, префиксы'
                }, {
                    id: 5,
                    parentId: 0,
                    text: 'Валюты'
                }, {
                    id: 6,
                    parentId: 0,
                    text: 'Группы пользователей'
                }, {
                    id: 7,
                    parentId: 0,
                    text: 'Пользователи',
                    items: [{
                        id: '7-1',
                        parentId: 7,
                        text: 'Директора'
                    }, {
                        id: '7-2',
                        parentId: 7,
                        text: 'Руководители'
                    }, {
                        id: '7-3',
                        parentId: 7,
                        text: 'Инженеры'
                    }, {
                        id: '7-4',
                        parentId: 7,
                        text: 'Менеджеры'
                    }]
                }, {
                    id: 8,
                    parentId: 0,
                    text: 'Задачи'
                }, {
                    id: 9,
                    parentId: 0,
                    text: 'Количество звонков по префиксу'
                }]
            };
            callback && callback(tree);
        }
    }
    return public;
});