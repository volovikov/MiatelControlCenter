define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/transit-sf-aon-prefix.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, tmpl) {

  var _Tmpl = k.template(tmpl);

  var public = {
    myModuleName: 'TransitSfAonPrefixModule',
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
      this.el.find('#sf-aon-prefix').kendoGrid({
        columns: [{
            field: 'prefixId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'prefix',
            title: 'Префикс'
          }, {
            field: 'prefixInfo',
            title: 'ремарка'
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: private.getDataSource.call(this),
        detailTemplate: kendo.template($("#detail-template").html()),
        detailInit: private.detailInit,
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
        toolbar: ["create"]
      });
    },
    detailInit: function (e) {
      var detailRow = e.detailRow;
      var t = 0;
      if (e.data.excl != 0)
        t = 1;
      detailRow.find('.sf-aon-pool-status').kendoGrid({
        columns: [{
            field: 'statusId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: "pool",
            title: "Отслеживание состояния номеров для номерных пуллов",
            template: '#= poolName #',
            editor: function (container, options) {
              $('<input required data-text-field="poolName" data-value-field="poolId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.poolId,
                        text: options.model.poolName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'sf_aon.php?method=get-pool-tree',
                                type: 'post',
                                data: {
                                  user: app.getActiveUser()
                                },
                                success: function (resp) {
                                  var r = JSON.parse(resp);

                                  if (r.success) {
                                    options.success(r.data.list);
                                  }
                                }
                              });
                            }
                          }
                        },
                        dataBound: function (e) {
                          this.value(options.model.poolId);
                        }
                      });
            }
          }, {
            field: 'prefixId',
            title: 'prefixId',
            hidden: true
          }, {
            field: 'statusInfo',
            title: 'ремарка'
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=get-pool-status',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  user: app.getActiveUser(),
                  prefixId: e.data.prefixId
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
              var model = options.data.models[0],
                      data = {
                        user: app.getActiveUser(),
                        prefixId: e.data.prefixId
                      };

              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=add-pool-status',
                type: 'post',
                data: data,
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
            destroy: function (options) {
              var model = options.data.models[0],
                      data = {
                        statusId:model.statusId,
                        user: app.getActiveUser()
                      };
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=del-pool-status',
                type: 'post',
                data: data,
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
                url: app.transitServerUrl + 'sf_aon.php?method=set-pool-status',
                type: 'post',
                data: {
                  user: app.getActiveUser(),
                  poolId: (model.pool && model.pool.poolId) || model.poolId,
                  statusInfo:model.statusInfo,
                  statusId:model.statusId
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
              id: "statusId",
              fields: {
                statusId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          autoSync: true,
          batch: true,
        },
        pageable: {
          refresh: true,
          pageSizes: [5, 20, 100, 200, 500],
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        scrollable: true,
        resizeable: true,
        editable: true,
        toolbar: ["create"]
      });
      var dataBound = function (e) {
        for (var i = 0; i < e.sender.columns.length; i++)
          e.sender.autoFitColumn(i);
      };
      detailRow.find('.sf-aon-pool-history').kendoGrid({
        columns: [{
            field: 'historyId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'prefixId',
            title: 'prefixId',
            hidden: true
          }, {
            field: "pool",
            title: "Хранение истории для номерных пуллов",
            template: '#= poolName #',
            editor: function (container, options) {
              $('<input required data-text-field="poolName" data-value-field="poolId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.poolId,
                        text: options.model.poolName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'sf_aon.php?method=get-pool-tree',
                                type: 'post',
                                data: {
                                  user: app.getActiveUser()
                                },
                                success: function (resp) {
                                  var r = JSON.parse(resp);

                                  if (r.success) {
                                    options.success(r.data.list);
                                  }
                                }
                              });
                            }
                          }
                        },
                        dataBound: function (e) {
                          this.value(options.model.poolId);
                        }
                      });
            }
          }, {
            field: "historyInfo",
            title: "ремарка"
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=get-pool-history',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  user: app.getActiveUser(),
                  prefixId: e.data.prefixId
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
              var model = options.data.models[0],
                      data = {
                        user: app.getActiveUser(),
                        prefixId: e.data.prefixId
                      };

              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=add-pool-history',
                type: 'post',
                data: data,
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
            destroy: function (options) {
              var model = options.data.models[0],
                      data = {
                        historyId:model.historyId,
                        user: app.getActiveUser()
                      };
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=del-pool-history',
                type: 'post',
                data: data,
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
                url: app.transitServerUrl + 'sf_aon.php?method=set-pool-history',
                type: 'post',
                data: {
                  user: app.getActiveUser(),
                  poolId: (model.pool && model.pool.poolId) || model.poolId,
                  historyInfo:model.historyInfo,
                  historyId:model.historyId
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
              id: "historyId",
              fields: {
                historyId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          autoSync: true,
          batch: true,
        },
        scrollable: true,
        resizeable: true,
//        dataBound: dataBound,
        pageable: {
          refresh: true,
          buttonCount: 5,
          pageSizes: [20, 100, 200, 500]
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        editable: true,
        toolbar: ["create"]
      });
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=get-prefix',
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
              url: app.transitServerUrl + 'sf_aon.php?method=set-prefix',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                prefixId:model.prefixId,
                prefix:model.prefix,
                prefixInfo:model.prefixInfo
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
            var model = options.data.models[0],
                    data = {
                      user: app.getActiveUser()
                    };

            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=add-prefix',
              type: 'post',
              data: data,
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
          destroy: function (options) {
            var model = options.data.models[0],
                    data = {
                      prefixId:model.prefixId,
                      user: app.getActiveUser()
                    };
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=del-prefix',
              type: 'post',
              data: data,
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
            id: "prefixId",
            fields: {
              prefixId: {editable: false},
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



