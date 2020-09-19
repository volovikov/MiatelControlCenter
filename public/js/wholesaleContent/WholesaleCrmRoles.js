define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/wholesale-crm-roles.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'WholesaleCrmRoles',
    gridPageSize: 50,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
      this.id = this.treeId.split('-')[1];
      this.hideDetail = true;
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
    detailInit: function (e) {
      var detailRow = e.detailRow;
      detailRow.find('.crm-balans-list').kendoGrid({
        columns: [{
            field: 'memberName',
            title: 'Имя',
            width: '50px'
          }, {
            field: 'lbalans',
            title: 'Баланс руководителя',
          }, {
            field: 'mbalans',
            title: 'Баланс менеджера',
          }, {
            field: 'cProc',
            title: '% от клиентов',
          }, {
            field: 'pProc',
            title: '% от партнеров',
          }, {
            field: 'currencyName',
            title: 'валюта'
          }, {
            field: 'dateStart',
            title: 'дата начала'
          }, {
            field: 'dateEnd',
            title: 'дата конца'
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.wholesaleServerUrl + 'crm.php?method=get_member_balans_list',
                type: 'post',
                data: {
                  memberId: e.data.memberId,
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
              id: "memberId",
              fields: {
                memberName: {editable: false},
                lbalans: {editable: false},
                mbalans: {editable: false},
                cProc: {editable: false},
                pProc: {editable: false},
                currencyName: {editable: false},
                dateStart: {editable: false},
                dateEnd: {editable: false}
              }
            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 50,
            autoSync: true
          },
          pageSize: 50
        },
        pageable: {
          refresh: true,
          pageSizes: [50, 150, 500],
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        editable: true,
        scrollable: true,
        resizeable: true,
        dataBound: function (e) {
          for (var i = 0; i < e.sender.columns.length; i++)
            e.sender.autoFitColumn(i);
        }
      });
      detailRow.find('.crm-company-list').kendoGrid({
        columns: [{
            field: 'companyName',
            title: 'Название компании',
          }, {
            field: 'balans',
            title: 'баланс (USD)',
          }, {
            title: 'валюта',
            template: 'USD',
            hidden: true
          }, {
            field: 'cBalans',
            title: 'сумма клиента (USD)'
          }, {
            field: 'cDuration',
            title: 'минуты клиента'
          }, {
            field: 'pBalans',
            title: 'сумма партнера (USD)'
          }, {
            field: 'pDuration',
            title: 'минуты партнера'
          }, {
            field: 'cMarga',
            title: 'маржа клиент (USD)'
          }, {
            field: 'pMarga',
            title: 'маржа партнер (USD)'
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.wholesaleServerUrl + 'crm.php?method=get_member_company_list',
                type: 'post',
                data: {
                  memberId: e.data.memberId,
                  dateStart: e.data.dateStart,
                  dateEnd: e.data.dateEnd,
                  user: app.getActiveUser(),
                  skip: options.data.skip,
                  take: options.data.take
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
              id: "companyId",
              fields: {
                memberName: {editable: false},
                lbalans: {editable: false},
                mbalans: {editable: false},
                cProc: {editable: false},
                pProc: {editable: false},
                currencyName: {editable: false},
                dateStart: {editable: false},
                dateEnd: {editable: false}
              }
            }
          },
          pageSize: 20,
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          autoSync: true,
          batch: true
        },
        pageable: {
          refresh: true,
          pageSizes: [20, 50, 500],
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        editable: false,
        scrollable: true,
        resizeable: true,
        dataBound: function (e) {
          for (var i = 0; i < e.sender.columns.length; i++)
            e.sender.autoFitColumn(i);
        }
      });
    },
    renderServersTable: function () {
      var t = {
        columns: [{
            field: 'memberId',
            title: '№',
            width: '50px',
            editable: false
          }, {
            field: 'memberName',
            title: 'Пользователь',
            width: "120px",
          }, {
            field: 'memberRole',
            title: 'Роль',
            editor: function (container, options) {
              $('<select multiple="multiple" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoMultiSelect({
                        // autoBind: true,
                        dataSource: ['Менеджер', 'rate-менеджер', 'Инженер', 'Разработчик', 'Руководитель отдела', 'Директор', 'Системный администратор'],
                        // dataBound: function(e) {
                        //     this.value(options.model.memberRole.split(', '));
                        // }
                      });
            }
          }, {
            field: 'group',
            title: 'Группа',
            sortable: false,
            filterable: false,
            template: '#= groupName #',
            editor: function (container, options) {
              $('<input required data-text-field="groupName" data-value-field="groupId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: true,
                        value: options.model.groupId,
                        text: options.model.groupName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=get_group_selector',
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
                          this.value(options.model.groupId);
                        }
                      })
            }
          }, {
            field: 'cProc',
            title: '% от клиентов',
            // hidden: this.hideProcClient
          }, {
            field: 'pProc',
            title: '% от партнеров',
            // hidden: this.hideProcPartner
          }, {
            field: 'lbalans',
            title: 'Баланс руководителя',
          }, {
            field: 'mbalans',
            title: 'Баланс менеджера',
          }, {
            field: 'currency',
            title: 'Валюта',
            hidden: this.hideCurrency,
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
                                url: app.wholesaleServerUrl + 'crm.php?method=get_currency_selector',
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
            field: 'langName',
            title: 'Язык',
            editor: function (container, options) {
              $('<select multiple="multiple" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoMultiSelect({
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.wholesaleServerUrl + 'crm.php?method=get_lang_selector',
                                type: 'post',
                                data: {
                                  user: app.getActiveUser(),
                                },
                                success: function (resp) {
                                  var r = JSON.parse(resp);
                                  if (r.success) {
                                    var langArray = [];
                                    for (var i = 0; i < r.data.list.length; i++) {
                                      if (r.data.list[i].langId !== '0') {
                                        langArray.push(r.data.list[i].langName)
                                      }
                                    }
                                    options.success(langArray);
                                  }
                                }
                              });
                            }
                          }
                        }
                      })
            }
          }, {
            field: 'companyCount',
            title: 'Количество компаний',
            // hidden: this.hideCountCompany
          }, {
            command: [{name: "списание", click: private.writeOff}],
            title: " ",
            width: "90px",
            hidden: true
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: private.getDataSource.call(this),
        pageable: {
          refresh: true,
          pageSizes: [50, 150, 500],
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        toolbar: ["create"],
        editable: true
      };
      if (this.hideDetail == true) {
        t["detailTemplate"] = kendo.template($("#detail-template").html());
        t["detailInit"] = private.detailInit;
        t["detailExpand"] = function (e) {
          this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
        }
      }
      this.el.find('#crm-roles-list').kendoGrid(t);
    },
    getDataSource: function () {
      var that = this;
      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.wholesaleServerUrl + 'crm.php?method=get_member_list',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                user: app.getActiveUser(),
                roleId: that.id
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
              url: app.wholesaleServerUrl + 'crm.php?method=add-roles',
              type: 'post',
              data: {
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
          destroy: function (options) {
            var model = options.data.models[0];
            $.ajax({
              url: app.wholesaleServerUrl + 'crm.php?method=del-roles',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                roleId: model.roleId
              },
              success: function (resp) {
                var r = JSON.parse(resp);

                if (r.suМаржаccess) {
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
              url: app.wholesaleServerUrl + 'crm.php?method=set_member',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                memberId: model.memberId,
                memberName: model.memberName,
                memberRole: (model.memberRole instanceof Array ? model.memberRole.join(', ') : model.memberRole),
                companyCount: model.companyCount,
                currencyName: model.currencyName,
                dateEnd: model.dateEnd,
                dateStart: model.dateStart,
                groupId: (model.group && model.group.groupId) || model.groupId,
                cProc: model.cProc,
                pProc: model.pProc,
                lbalans: model.lbalans,
                mbalans: model.mbalans,
                langName: (model.langName instanceof Array ? model.langName.join(', ') : model.langName),
                currencyId: (model.currency && model.currency.currencyId) || model.currencyId
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
            id: "memberId",
            fields: {
              memberId: {},
              memberName: {},
              memberRole: {},
              companyCount: {},
              currencyName: {},
              dateEnd: {},
              dateStart: {},
              groupId: {},
              groupName: {},
              cProc: {},
              pProc: {},
              lbalans: {},
              mbalans: {},
              langName: {},
              currencyId: {}
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