define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/transit-sf-aon-pool.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, tmpl) {

  var _Tmpl = k.template(tmpl);

  var public = {
    myModuleName: 'TransitSfAonPoolModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
      this.id = this.treeId.split('-')[1];
      private.bindEvents.call(this);
      private.render.call(this);
    }
  };
  var private = {
    bindEvents: function () {
      var that = this;

    },
    render: function () {
      var that = this;

      html = _Tmpl({
        i18n: that.i18n,
      });
      that.el.html(html);
      that.el.find('.combobox').kendoComboBox();
      that.el.find('.tabstrip').kendoTabStrip({
        animation: {
          open: {
            effects: "fadeIn"
          }
        }
      });
      private.renderServersTable.call(this);
    },
    renderServersTable: function () {
      this.el.find('#sf-aon-pool').kendoGrid({
        columns: [{
            field: 'poolId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'poolName',
            title: 'Пулл',
          }, {
            field: 'poolInfo',
            title: 'ремарка'
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: private.getDataSource.call(this),
        pageable: {
          refresh: true,
          pageSizes: true,
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        editable: true,
        toolbar: ["create"],
      });
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=get-pool-list',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                user: app.getActiveUser()
              },
              success: function (resp) {
                var r = JSON.parse(resp);

                if (r.success) {
                  options.success(r);
                } else {
                  options.error();
                }
              }
            });
          },
          update: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=set-pool',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                poolName: model.poolName,
                poolInfo: model.poolInfo,
                poolId:model.poolId
              },
              success: function (resp) {
                var r = JSON.parse(resp);
                if (r.success) {
                  options.success(r);
                } else {
                  options.error();
                }
              }
            });
          },
          create: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=add-pool',
              type: 'post',
              data: {
                user: app.getActiveUser()
              },
              success: function (resp) {
                var r = JSON.parse(resp);

                if (r.success) {
                  options.success(r);
                  app.publish('add-pool', r.data);
                } else {
                  options.error();
                }
              }
            });
          },
          destroy: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=del-pool',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                poolId:model.poolId
              },
              success: function (resp) {
                var r = JSON.parse(resp);

                if (r.success) {
                  options.success(r);
                } else {
                  options.error();
                }
              }
            });
          },
          parameterMap: function (options, operation) {
            if (operation !== 'read' && options.models) {
              return {models: kendo.stringify(options.models)};
            }
          }
        },
        schema: {
          total: function (resp) {
            return resp.data.total;
          },
          data: function (resp) {
            if (typeof resp.data == 'undefined') {
              app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]); //<-- error params get   
            } else if (typeof resp.data.list == 'undefined') {
              return resp.data;
            } else {
              return resp.data.list;
            }
          },
          model: {
            id: "poolId",
            fields: {
              poolId: {editable: false},
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true
      });
    }
  };
  return public;
});
