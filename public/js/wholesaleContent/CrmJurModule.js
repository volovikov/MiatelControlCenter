define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/crm-jur.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'CrmJurModule',
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

      html = templateTmpl({
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
      this.el.find('#crm-jur-list').kendoGrid({
        columns: [{
            field: 'jId',
            title: '№',
            width: '50px',
            template: function (item) {
              return ('<a href=/#section/transit/tree/crm/crm/1-' + item.tId + '>' + item.id + '</a>')
            },
            sortable: false,
            filterable: false
          }, {
            field: 'name',
            title: 'Название компании',
            width: "120px"
          }, {
            field: 'country',
            title: 'Страна'
          }, {
            field: 'regNumber',
            title: 'Рег. номер'
          }, {
            field: 'nalogNumber',
            title: 'Налог. номер'
          }, {
            field: 'currency',
            title: 'Валюта',
            template: '#= currencyName #',
            editor: function (container, options) {
              $('<input required data-text-field="currencyName" data-value-field="currencyId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.currencyId,
                        text: options.model.currencyName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-currency-list',
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
                          this.value(options.model.currencyId);
                        }
                      })
            }
          }, {
            field: 'NDS',
            title: 'Ставка НДС, %'
          }, {
            field: 'operator',
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
            field: 'role',
            title: 'Отв. директор',
            template: '#= userName #',
            editor: function (container, options) {
              $('<input required data-text-field="userName" data-value-field="roleId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.roleId,
                        text: options.model.userName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-roles',
                                type: 'post',
                                data: {
                                  user: app.getActiveUser(),
                                  typeTree: 1
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
                          this.value(options.model.roleId);
                        }
                      })
            }
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
        toolbar: ["create"],
        editable: true
      });
    },
    getDataSource: function () {
      var that = this;
      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=get-jur',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                user: app.getActiveUser(),
                typeTree: that.id
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
              url: app.transitServerUrl + 'crm.php?method=add-jur',
              type: 'post',
              data: {
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
          destroy: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=del-jur',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                jId: model.jId
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
              url: app.transitServerUrl + 'crm.php?method=set-jur',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                jId: model.jId,
                name: model.name,
                currencyId: (model.currency && model.currency.currencyId) || model.currencyId,
                country: model.country,
                operatorId: (model.operator && model.operator.clientId) || model.operatorId,
                roleId: (model.role && model.role.roleId) || model.roleId,
                regNumber: model.regNumber,
                nalogNumber: model.nalogNumber,
                NDS: model.NDS,
                userId: (model.user && model.user.userId) || model.userId
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
            id: "jId",
            fields: {
              jId: {editable: false},
              userName: {},
              balans: {editable: false},
              currencyId: {},
              leaderId: {},
              type: {},
              lang: {},
              groupVisible: {},
              procClient: {},
              procPartner: {},
              procManager: {}
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
