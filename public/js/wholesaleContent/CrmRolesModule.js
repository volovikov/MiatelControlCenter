define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/crm-roles-form.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'CrmRolesModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
      this.id = this.treeId.split('-')[1];
      this.hideLeader = false;
      this.hideProcClient = false;
      this.hideProcPartner = false;
      this.hideProcManager = false;
      this.hideBalans = false;
      this.hideCurrency = false;
      this.hideGroupVisible = false;
      this.hideWriteOff = true;
      this.hideCountCompany = true;
      this.hideDetail=true;
      if (this.id == 1 || this.id == 2 || this.id == 3)
        this.hideLeader = true;
      if (this.id == 4) {
        this.hideProcManager = true;
        this.hideGroupVisible = true;
        this.hideWriteOff = false;
        this.hideCountCompany = false;
      }
      if (this.id == 2) {
        this.hideProcClient = true;
        this.hideProcPartner = true;
        this.hideWriteOff = false;
      }
      if (this.id == 1 || this.id == 3) {
        this.hideProcClient = true;
        this.hideProcPartner = true;
        this.hideProcManager = true;
        this.hideBalans = true;
        this.hideCurrency = true;
        this.hideGroupVisible = true;
        this.hideDetail=false;
      }
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
    writeOff: function (e) {
      e.preventDefault();
      var tr = $(e.target).closest("tr")
      var data = this.dataItem(tr);
      $.ajax({
        url: app.transitServerUrl + 'crm.php?method=write-off',
        type: 'post',
        data: {
          user: app.getActiveUser(),
          roleId: data.roleId
        },
        success: function (resp) {
          var r = JSON.parse(resp);
          if (r.success) {
            $("#crm-roles-list").data("kendoGrid").dataSource.read();
            $("#crm-roles-list").data("kendoGrid").refresh();
          }
        }
      });
    },
    detailInit: function (e) {
      var detailRow = e.detailRow;
      detailRow.find('.crm-balans-history').kendoGrid({
        columns: [{
            field: 'balansId',
            title: '№',
            width: '50px'
          }, {
            field: 'balans',
            title: 'баланс'
          },{
            field: 'currencyName',
            title: 'валюта'
          }, {
            field: 'balansDate',
            title: 'дата списания'
          }, {
            command: [{name: "отменить списание", click: function (e) {
                  e.preventDefault();
                  var tr = $(e.target).closest("tr")
                  var data = this.dataItem(tr);
                  $.ajax({
                    url: app.transitServerUrl + 'crm.php?method=write-off-delete',
                    type: 'post',
                    data: {
                      user: app.getActiveUser(),
                      balansId: data.balansId,
                      roleId: data.roleId
                    },
                    success: function (resp) {
                      var r = JSON.parse(resp);
                      if (r.success) {
                        $(".crm-balans-history").data("kendoGrid").dataSource.read();
                        $(".crm-balans-history").data("kendoGrid").refresh();
                        $("#crm-roles-list").data("kendoGrid").dataSource.read();
                        $("#crm-roles-list").data("kendoGrid").refresh();
                      }
                    }
                  });
                }
              }],
            title: " ",
            width: "150px",
            hidden:true
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=get-balans-history',
                type: 'post',
                data: {
                  roleId: e.data.roleId,
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
              id: "balansId",
              fields: {
                currencyName:{editable:false},
                balansId:{editable:false},
                balansDate:{editable:false},
                balans:{editable:false}
              }
            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 5,
            autoSync: true
          }
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
            field: 'roleId',
            title: '№',
            width: '50px'
          }, {
            field: 'user',
            title: 'Пользователь',
            width: "120px",
            template: "#= userName #",
            editor: function (container, options) {
              $('<input required data-text-field="userName" data-value-field="userId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.userId,
                        text: options.model.userName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-user-list',
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
                          this.value(options.model.userId);
                        }
                      })
            }
          }, {
            field: 'type',
            title: 'Роль',
            editor: function (container, options) {
              $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'менеджер'
                          }, {
                            value: 'инженер'
                          }, {
                            value: 'руководитель'
                          }, {
                            value: 'директор'
                          }]
                      });
            }
          }, {
            field: 'procClient',
            title: '% от клиентов',
            hidden: this.hideProcClient
          }, {
            field: 'procPartner',
            title: '% от партнеров',
            hidden: this.hideProcPartner
          }, {
            field: 'procManager',
            title: '% от менеджеров',
            hidden: this.hideProcManager
          }, {
            field: 'balans',
            title: 'Баланс',
            hidden: this.hideBalans
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
            field: 'leader',
            title: 'Руководитель',
            template: '#= leaderName #',
            width: "120px",
            hidden: this.hideLeader,
            editor: function (container, options) {
              $('<input required data-text-field="leaderName" data-value-field="leaderId" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.leaderId,
                        text: options.model.leaderName,
                        dataSource: {
                          transport: {
                            read: function (options) {
                              $.ajax({
                                url: app.transitServerUrl + 'crm.php?method=get-user-list',
                                type: 'post',
                                data: {
                                  user: app.getActiveUser(),
                                  type: 'руководитель'
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
                          this.value(options.model.leaderId);
                        }
                      })
            }
          }, {
            field: 'lang',
            title: 'Язык'
          }, {
            field: 'groupVisible',
            title: 'Видимость',
            hidden: this.hideGroupVisible,
            editor: function (container, options) {
              $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            value: 'yes'
                          }, {
                            value: 'no'
                          }]
                      })
            }
          }, {
            field: 'countCompany',
            title: 'Количество компаний',
            hidden: this.hideCountCompany
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
          pageSizes: true,
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        toolbar: ["create"],
        editable: true
      };
      if(this.hideDetail==true){
        t["detailTemplate"]= kendo.template($("#detail-template").html());
        t["detailInit"]= private.detailInit;
        t["detailExpand"]= function (e) {
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
              url: app.transitServerUrl + 'crm.php?method=get-roles',
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
              url: app.transitServerUrl + 'crm.php?method=add-roles',
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
              url: app.transitServerUrl + 'crm.php?method=del-roles',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                roleId: model.roleId
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
              url: app.transitServerUrl + 'crm.php?method=set-roles',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                roleId: model.roleId,
                type: model.type,
                currencyId: (model.currency && model.currency.currencyId) || model.currencyId,
                groupVisible: model.groupVisible,
                leaderId: (model.leader && model.leader.leaderId) || model.leaderId,
                lang: model.lang,
                procClient: model.procClient,
                procPartner: model.procPartner,
                procManager: model.procManager,
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
            id: "roleId",
            fields: {
              roleId: {editable: false},
              userName: {},
              balans: {editable: false},
              currencyId: {},
              leaderId: {},
              type: {},
              lang: {},
              groupVisible: {},
              procClient: {},
              procPartner: {},
              procManager: {},
              countCompany: {editable: false}
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