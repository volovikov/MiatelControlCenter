define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/transitTree.js',
  'js/common/tree/TreeModule',
  'css!./css/transitTree'
], function ($, k, u, common, local, treeModule) {

  var public = {
    myModuleName: 'CrmTreeCdrModule',
    myStorageName: 'CrmTreeStorage',
    mySectionName: 'transit',
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

      private.getCrmListTreeData.call(this, function (tree) {
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
              window.location.hash = '#section/' + that.mySectionName + '/tree/crm/crm/' + item.id;
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
    getCrmListTreeData: function (callback) {
      var tree = {
        id: 0,
        text: 'CRM',
        items: [{
            id: 1,
            parentId: 0,
            text: 'Клиенты'
          }, {
            id: 2,
            parentId: 0,
            text: 'Роли',
            items: [{
                id: '2-1',
                parentId: 2,
                text: 'Директора'
              }, {
                id: '2-2',
                parentId: 2,
                text: 'Руководители'
              }, {
                id: '2-3',
                parentId: 2,
                text: 'Инженеры'
              }, {
                id: '2-4',
                parentId: 3,
                text: 'Менеджеры'
              }]
          }, {
            id: 3,
            parentId: 0,
            text: 'Сделки'
          }, {
            id: 4,
            parentId: 0,
            text: 'Юрисдикции'
          }, {
            id: 5,
            parentId: 0,
            text: 'Задачи'
          }, {
            id: 6,
            parentId: 0,
            text: 'Настройки',
            items: [{
                id: '6-1',
                parentId: 6,
                text: 'Список валют'
              }]
          },{
            id:7,
            parentId:0,
            text: 'Количество звонков по префиксам',
          }]
      };
      callback && callback(tree);
    }
  }
  return public;
});