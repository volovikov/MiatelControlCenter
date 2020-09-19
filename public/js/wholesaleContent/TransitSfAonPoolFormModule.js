define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/transit-sf-aon-pool-form.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, aonPullForm) {

  var aonPullFormTmpl = k.template(aonPullForm);

  var public = {
    myModuleName: 'TransitSfAonPoolFormModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
      this.id = this.treeId.split('-')[1];
      private.bindEvents.call(this);
      private.render.call(this);
    },
    onClickSubmitBtn: function (btn) {
      var that = this,
              form = $('#sf-aon-pool-form'),
              us=app.getActiveUser(),
              data = $.extend(u.getFormValue(form),{
                user:us
              });
      $.ajax({
        url: app.transitServerUrl + 'sf_aon.php?method=set-pool',
        type: 'post',
        data: data,
        success: function (resp) {
          var r = JSON.parse(resp);

          if (r.success) {
            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
            app.publish('update-pool', r.data);
          } else {
            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
          }
        }
      });
    }
  };
  var private = {
    bindEvents: function () {
      var that = this;

      $(document).off('click', '#sf-aon-pool-form-submit-btn').on('click', '#sf-aon-pool-form-submit-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this));
      });
    },
    render: function () {
      var that = this;

      $.ajax({
        url: app.transitServerUrl + 'sf_aon.php?method=get-pool',
        type: 'post',
        data: {
          poolId: that.id,
          user: app.getActiveUser()
        },
        success: function (resp) {
          var r = JSON.parse(resp);

          if (r.success) {
            var html = aonPullFormTmpl({
              i18n: that.i18n,
              data: $.extend(r.data, {
                poolId: that.id
              })
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
            that.el.find('#number-list').kendoGrid({
              filterable: {
                extra: false,
                operators: {
                  string: {
                    like: "Start with",
                    eq: "=",
                    neq: "<>"
                  }
                }
              },
              columns: [{
                  field: 'numberId',
                  title: '№',
                  width: '50px',
                  sortable: false,
                  filterable: false
                }, {
                  field: 'number',
                  title: 'Номер'
                }, {
                  field: 'numberInfo',
                  title: 'ремарка'
                }, {
                  command: ["destroy"],
                  title: "&nbsp",
                  width: "90px"
                }],
              dataSource: private.getDataSource.call(that),
              pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
              },
              sortable: {
                mode: "single",
                allowUnsort: false
              },
              toolbar: ["create"],
              editable: true
            });
            var statusPullNumberEditor = function (container, options) {
              $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'yes'
                          }, {
                            value: 'no'
                          }]
                      });
            };
            that.el.find('#pull-status').kendoGrid({
              filterable: {
                extra: false,
                operators: {
                  string: {
                    like: "Start with",
                    eq: "=",
                    neq: "<>"
                  }
                }
              },
              columns: [{
                  field: 'number',
                  title: 'Номер'
                }, {
                  field: 'prefix',
                  title: 'Префикс'
                }, {
                  field: 'in_use',
                  title: 'В работе',
                  editor: statusPullNumberEditor,
                  filterable: false
                }, {
                  field: 'info',
                  title: 'Ремарка',
                  sortable: false,
                  filterable: false
                }, {
                  field: 'prefixId',
                  title: 'prefixId',
                  hidden: true
                }, {
                  field: 'numberId',
                  title: 'numberId',
                  hidden: true
                }],
              dataSource: private.getDataSource1.call(that),
              pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
              },
              sortable: {
                mode: "single",
                allowUnsort: false
              },
              toolbar: ["create"],
              editable: true
            });
            that.el.find('#clientId').kendoDropDownList({
              autoBind: true,
              value: r.data.clientId,
              dataSource: {
                transport: {
                  read: function (options) {
                    $.ajax({
                      url: app.transitServerUrl + 'whitelist.php?method=get-client-list',
                      type: 'post',
                      success: function (resp) {
                        try {
                          var r = JSON.parse(resp);

                          if (r.success) {
                            options.success(r.data.list);
                          }
                        } catch (e) {
                          app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                        }
                      }
                    });
                  }
                }
              }
            });
          } else {
            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
          }
        }
      });
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=get-number',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                poolId: that.id,
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
          create: function (options) {
            var model = options.data.models[0],
                    data = {
                      poolId: that.id,
                      user: app.getActiveUser()
                    };

            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=add-number',
              type: 'post',
              data: data,
              success: function (resp) {
                var r = JSON.parse(resp);
                if (r.success) {
                  options.success(r);
                }
              }
            });
          },
          update: function (options) {
            var model = options.data.models[0],
                    data = {
                      numberId: model.numberId,
                      number: model.number,
                      numberInfo: model.numberInfo,
                      user: app.getActiveUser()
                    };
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=set-number',
              type: 'post',
              data: data,
              success: function (resp) {
                var r = JSON.parse(resp);
                if (r.success) {
                  options.success(r);
                }
              }
            });
          },
          destroy: function (options) {
            var model = options.data.models[0],
                    data = {
                      numberId: model.numberId,
                      user: app.getActiveUser()
                    };
            $.ajax({
              url: app.transitServerUrl + 'sf_aon.php?method=del-number',
              type: 'post',
              data: data,
              success: function (resp) {
                var r = JSON.parse(resp);
                if (r.success) {
                  options.success({data: data});
                  app.publish('del-number', data);
                } else {
                  app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
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
            id: "numberId",
            fields: {
              numberId: {editable: false, nullable: true},
              number: {},
              pullId: {}
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true
      });
    },
    getDataSource1: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'aon.php?method=get-pull-status',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                pullId: that.id
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
            var model = options.data.models[0],
                    data = {
                      in_use: model.in_use,
                      info: model.info,
                      numberId: model.numberId,
                      prefixId: model.prefixId,
                      number: model.number,
                      prefix: model.prefix
                    };
            $.ajax({
              url: app.transitServerUrl + 'aon.php?method=set-pull-status',
              type: 'post',
              data: data,
              success: function (resp) {
                var r = JSON.parse(resp);
                if (r.success) {
                  options.success({data: data});
                  app.publish('update-pull-status', data);
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
            id: "numberId",
            fields: {
              number: {editable: false},
              prefix: {editable: false},
              in_use: {},
              info: {},
              prefixId: {editable: false},
              numberId: {editable: false}
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true
      });
    }


  };
  return public;
});

