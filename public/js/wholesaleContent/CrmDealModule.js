define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/crm-deal.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'CrmDealModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);

      private.bindEvents.call(this);
      private.get_calc.call(this);
      //private.render.call(this);
    }
  };
  var private = {
    calc: true,
    get_calc: function () {
      var that = this;
      $.ajax({
        url: app.transitServerUrl + 'crm.php?method=check-deal-calc',
        type: 'post',
        data: {
          user: app.getActiveUser()
        },
        success: function (resp) {
          var r = JSON.parse(resp);
          if (r.success) {
            private.calc = r.data.calc;
          }
          private.render.call(that);
        }
      });
    },
    bindEvents: function () {
      var that = this;
    },
    render: function () {
      var that = this;

      html = templateTmpl({
        i18n: that.i18n
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
      this.el.find('#crm-deal-list').kendoGrid({
        filterable: {
          extra: false,
          operators: {
            string: {
              like: "Start with",
              eq: "Is equal to",
              neq: "Is not equal to"
            }
          }
        },
        columns: [{
            field: 'nameDeal',
            title: 'Наименование сделки'
          }, {
            field: 'sDeal',
            title: 'начиная с',
          }, {
            field: 'eDeal',
            title: 'до',
          }, {
            field: 'clientMinute',
            title: 'минуты клиента',
          }, {
            field: 'clientMoney',
            title: 'сумма клиента',
          }, {
            field: 'partnerMinute',
            title: 'минуты партнера',
          }, {
            field: 'partnerMoney',
            title: 'сумма партнера',
          }, {
            command: [{name: "скопировать", click: function (e) {
                  e.preventDefault();
                  var tr = $(e.target).closest("tr")
                  var data = this.dataItem(tr);
                  $.ajax({
                    url: app.transitServerUrl + 'crm.php?method=copy-deal',
                    type: 'post',
                    data: {
                      user: app.getActiveUser(),
                      nameDeal: data.nameDeal
                    },
                    success: function (resp) {
                      var r = JSON.parse(resp);
                      if (r.success) {
                        $("#crm-deal-list").data("kendoGrid").dataSource.read();
                        $("#crm-deal-list").data("kendoGrid").refresh();
                      }
                    }
                  });
                }}],
            title: " ",
            width: "110px"
          }, {
            command: [{name: "перерасчет", click: function (e) {
                  e.preventDefault();
                  var tr = $(e.target).closest("tr")
                  var data = this.dataItem(tr);
                  $.ajax({
                    url: app.transitServerUrl + 'crm.php?method=recalc-deal',
                    type: 'post',
                    data: {
                      user: app.getActiveUser(),
                      startTime: data.sDeal,
                      endTime: data.eDeal,
                      nameDeal: data.nameDeal
                    },
                    success: function (resp) {
                      $("#crm-deal-list").data("kendoGrid").dataSource.read();
                      $("#crm-deal-list").data("kendoGrid").refresh();
                    }
                  });
                }}],
            title: " ",
            width: "110px",
            hidden: private.calc
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: private.getDataSource.call(this),
        detailTemplate: kendo.template($("#detail-template").html()),
        detailInit: private.detailInit,
        detailExpand: function (e) {
          this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
        },
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
      detailRow.find('.crm-deal-form').kendoGrid({
        columns: [{
            field: 'dealId',
            title: '№'
          }, {
            field: 'startDeal',
            title: 'начиная с',
            format: "{0:yyy-MM-dd HH:mm:ss}",
            editor: function (container, options) {
              $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                      .appendTo(container)
                      .kendoDateTimePicker({});
            }
          }, {
            field: 'endDeal',
            title: 'до',
            format: "{0:yyyy-MM-dd HH:mm:ss}",
            editor: function (container, options) {
              $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                      .appendTo(container)
                      .kendoDateTimePicker({});
            }
          }, {
            field: 'type',
            title: 'тип',
            editor: function (container, options) {
              $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'client'
                          }, {
                            value: 'partner'
                          }]
                      });
            }
          }, {
            field: 'operator',
            title: 'оператор',
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
            field: 'zone',
            title: 'зона',
            template: '#= zoneName #',
            editor: function (container, options) {
              $('<input required data-text-field="zoneName" data-value-field="zoneId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.zoneId,
                        text: options.model.zoneName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-zone-list',
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
                          this.value(options.model.zoneId);
                        }
                      })
            }
          }, {
            field: 'priceDeal',
            title: 'цена'

          }, {
            field: 'minute',
            title: 'минуты'
          }, {
            field: 'money',
            title: 'сумма'
          }, {
            field: 'infoDeal',
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
                url: app.transitServerUrl + 'crm.php?method=get-deal',
                type: 'post',
                data: {
                  nameDeal: e.data.nameDeal,
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
              var model = options.data;
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=set-deal',
                type: 'post',
                data: {
                  dealId: model.dealId,
                  startDeal: kendo.toString(model.startDeal, "yyyy-MM-dd HH:mm:tt"),
                  endDeal: kendo.toString(model.endDeal, "yyyy-MM-dd HH:mm:tt"),
                  type: model.type,
                  operatorId: (model.operator && model.operator.clientId) || model.operatorId,
                  zoneId: (model.zone && model.zone.zoneId) || model.zoneId,
                  priceDeal: model.priceDeal,
                  infoDeal: model.infoDeal,
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
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=add-deal',
                type: 'post',
                data: {
                  user: app.getActiveUser(),
                  nameDeal: e.data.nameDeal
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
              var model = options.data;
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=del-deal',
                type: 'post',
                data: {
                  dealId: model.dealId,
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
            parameterMap: function (options, operation) {
              if (operation !== 'read' && options.models) {
                return {models: kendo.stringify(options.models)};
              }
            }
          },
          schema: {
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
              id: "dealId",
              fields: {
                dealId: {editable: false},
                startDeal: {},
                endDeal: {},
                type: {},
                operatorId: {},
                zoneId: {},
                priceDeal: {},
                minute: {editable: false},
                money: {editable: false},
                infoDeal: {}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          autoSync: true
        },
        pageable: false,
        sortable: false,
        scrollable: true,
        resizeable: true,
        editable: true,
        dataBound: function (e) {
          for (var i = 0; i < e.sender.columns.length; i++)
            e.sender.autoFitColumn(i);
        },
        toolbar: ["create"]
      });
      $('#crm-deal-list').kendoTooltip({
        filter: "td:nth-child(6)", //,td:nth-child(3),td:nth-child(4)",
        position: "right",
        content: function (e) {
          var result = "";
          $.ajax({
            url: app.transitServerUrl + 'crm.php?method=get-zone-prefix',
            type: 'post',
            async: false,
            data: {
              zoneName: e.target.text(),
              user: app.getActiveUser()
            },
            success: function (resp) {
              result = resp;
            }
          });
          var r = JSON.parse(result);
          var rr1 = 'Префиксы:<br>';
          var rr = '';
          $.each(r.data.list, function (id, val) {
            rr += "<br>" + val.zonePrefix;
          });
          return rr1 + rr.slice(4);
        }
      }).data('kendoTooltip');
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=get-deal-list',
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
          create: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=add-deal-name',
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
          update: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=set-deal-name',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                nameDeal: model.nameDeal,
                oldNameDeal: model.oldNameDeal
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
              url: app.transitServerUrl + 'crm.php?method=del-deal-name',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                nameDeal: model.nameDeal
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
            id: "partnerMinute",
            fields: {
              nameDeal: {},
              eDeal: {editable: false},
              sDeal: {editable: false},
              clientMinute: {editable: false},
              clientMoney: {editable: false},
              partnerMinute: {editable: false},
              partnerMoney: {editable: false}
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        dataBound: function (e) {
          for (var i = 0; i < e.sender.columns.length; i++)
            e.sender.autoFitColumn(i);
        }
      });
    }
  };
  return public;
});




