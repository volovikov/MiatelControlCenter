define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/transit-sf-aon-auth.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, tmpl) {

  var _Tmpl = k.template(tmpl);

  var public = {
    myModuleName: 'TransitSfAonAuthlModule',
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
      this.el.find('#sf-aon-auth').kendoGrid({
        columns: [{
            field: 'authId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'client',
            title: 'Оператор',
            template: '#= clientName #',
            editor: function (container, options) {
              $('<input required data-text-field="clientName" data-value-field="clientId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.clientId,
                        text: options.model.clientName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'whitelist.php?method=get-client-list',
                                type: 'post',
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
                          this.value(options.model.clientId);
                        }
                      });
            }
          }, {
            field: 'techPrefix',
            title: 'Префикс',
          }, {
            field: 'authInfo',
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
      detailRow.find('.sf-aon-auth-ip').kendoGrid({
        columns: [{
            field: 'ipId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'ipaddr',
            title: 'IP адрес оператора',
          }, {
            field: 'authId',
            title: 'authId',
            hidden: true
          }, {
            field: 'ipInfo',
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
                url: app.transitServerUrl + 'sf_aon.php?method=get-auth-ip',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  user: app.getActiveUser(),
                  authId: e.data.authId
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
                        authId: e.data.authId
                      };

              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=add-auth-ip',
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
                        ipId: model.ipId,
                        user: app.getActiveUser(),
                      };
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=del-auth-ip',
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
                url: app.transitServerUrl + 'sf_aon.php?method=set-auth-ip',
                type: 'post',
                data: {
                  user: app.getActiveUser(),
                  ipId: model.ipId,
                  ipInfo: model.ipInfo,
                  ipaddr: model.ipaddr
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
              id: "ipId",
              fields: {
                ipId: {editable: false}
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
      detailRow.find('.sf-aon-auth-route').kendoGrid({
        
        columns: [{
            field: 'routeId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'authId',
            title: 'authId',
            hidden: true
          }, {
            field: 'techPrefix',
            title: 'Тех. префикс'
          }, {
            field: "srcTemplate",
            title: "SRC шаблон"
          }, {
            field: "dstTemplate",
            title: "DST шаблон"
          }, {
            field: "pool",
            title: "Номерной пулл",
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
            field: "ipaddr",
            title: "DST IP адрес"
          }, {
            field: "routeInfo",
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
                url: app.transitServerUrl + 'sf_aon.php?method=get-route',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  user: app.getActiveUser(),
                  authId: e.data.authId
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
                        authId: e.data.authId
                      };

              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=add-route',
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
                        routeId: model.routeId,
                        user: app.getActiveUser(),
                      };
              $.ajax({
                url: app.transitServerUrl + 'sf_aon.php?method=del-route',
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
                url: app.transitServerUrl + 'sf_aon.php?method=set-route',
                type: 'post',
                data: {
                  user: app.getActiveUser(),
                  routeId: model.routeId,
                  routeInfo: model.routeInfo,
                  ipaddr: model.ipaddr,
                  srcTemplate: model.srcTemplate,
                  dstTemplate: model.dstTemplate,
                  techPrefix: model.techPrefix,
                  poolId: (model.pool && model.pool.poolId) || model.poolId,
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
              id: "routeId",
              fields: {
                routeId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 100,
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
          mode: "multiple",
          allowUnsort: false
        },
        editable: true,
        toolbar: ["create"],
        sort: [{
            field: 'srcTemplate',
            dir: 'desc'
          }, {
            field: 'dstTemplate',
            dir: 'desc'
          }]
      });
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=get-auth',
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
              url: app.transitServerUrl + 'sf_aon.php?method=set-auth',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                clientId: (model.client && model.client.clientId) || model.clientId,
                authInfo: model.authInfo,
                techPrefix: model.techPrefix,
                authId: model.authId
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
                      clientId: (model.client && model.client.clientId) || model.clientId,
                      authInfo: model.authInfo,
                      techPrefix: model.techPrefix,
                      authId: model.authId
                    };

            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=add-auth',
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
                      authId: model.authId,
                      user: app.getActiveUser(),
                    };
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=del-auth',
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
            id: "authId",
            fields: {
              authId: {editable: false},
              clientId: {},
              techPrefix: {},
              authInfo: {}
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

