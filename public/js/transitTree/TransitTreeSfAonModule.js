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
    myModuleName: 'TransitTreeSfAonModule',
    myStorageName: 'SfAonTreeStorage',
    mySectionName: 'transit',
    rawTreeArr: [],
    bindEvents: function () {
      var that = this;

      this.__proto__.bindsEvents.call(this);

      app.subscribe('update-pool', this.myModuleName, function (rec) {
        that.updateNode.call(that, rec);
      });
      app.subscribe('add-pool', this.myModuleName, function (rec) {
        that.appendNode.call(that, rec);
      });
      app.subscribe('dell-pool', this.myModuleName, function (rec) {
        that.deleteNode.call(that, rec);
      });
    },
    appendNode: function (rec) {
      var selectedNode = this.mainTree.select();

      if (selectedNode.length == 0) {
        selectedNode = null;
      }
      this.mainTree.append({
        text: rec.poolName,
        id: '1-'+rec.poolId
      }, selectedNode);
    },
    updateNode: function (rec) {
      var node = this.getNodeById('1-' + rec.poolId);
      node && this.mainTree.dataItem(node).set('text', rec.poolName);
    },
    deleteNode: function (rec) {
      //        var node = this.getNodeById('2-' + rec.pullId);
      //        node && this.mainTree.remove(node); 
    },
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.__proto__.run.call(this, params);
    },
    render: function (callback) {
      var that = this;

      private.getSfAonTreeData.call(this, function (tree) {
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
              window.location.hash = '#section/' + that.mySectionName + '/tree/sf-aon/sf-aon/' + item.id;
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
    getSfAonTreeData: function (callback) {
      $.ajax({
        url: app.transitServerUrl + 'sf_aon.php?method=get-pool-tree',
        data: {
          user: app.getActiveUser()
        },
        type: 'post',
        success: function (resp) {
          var r = JSON.parse(resp),
                  arr = [];

          if (r.success) {
            for (var i in r.data.list) {
              var el = r.data.list[i];
              arr.push({
                id: '1-' + el.poolId,
                text: el.poolName,
                parentId: 1
              });
            }
            var tree = {
              id: 0,
              text: 'Интеллектуальная подмена номеров',
              items: [{
                  id: 1,
                  parentId: 0,
                  text: 'Пуллы номеров',
                  items: arr
                }, {
                  id:2,
                  parentId:0,
                  text: 'Префиксы'
                },{
                  id: 3,
                  parentId: 0,
                  text: 'Авторизации/Клиенты'
                }, {
                  id: 4,
                  parentId: 0,
                  text: 'SoftSwitch',
                  items: [{
                      id: '4-1',
                      parentId: 4,
                      text: 'Текущие соединения',
                    }, {
                      id: '4-2',
                      parentId: 4,
                      text: 'CDR'
                    }]
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