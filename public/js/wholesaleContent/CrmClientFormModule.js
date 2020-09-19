define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/crm-client-form.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'CrmClientFormModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
      this.clientId = this.treeId.split('-')[1];
      private.bindEvents.call(this);
      private.render.call(this);
    },
  };
  var private = {
    bindEvents: function () {
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
      private.renderContact.call(this);
      private.renderDogovor.call(this);
      private.renderInfo.call(this);
      private.renderBank.call(this);
    },
    renderBank: function () {
      var that = this;
      this.el.find('.client-bank-form').kendoGrid({
        columns: [{
            field: 'bankId',
            title: '№',
            width: '50px'
          }, {
            field: 'beneficiary',
            title: ''
          }, {
            field: 'beneficiaryAccount',
            title: ''
          }, {
            field: 'beneficiaryBank',
            title: ''
          }, {
            field: 'swift',
            title: ''
          }, {
            field: 'addressBank',
            title: ''
          }, {
            field: 'correspondentBank',
            title: ''
          }, {
            field: 'corrSwift',
            title: ''
          }, {
            field: 'corrAccount',
            title: ''
          }, {
            field: 'currency',
            title: '',
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
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=get-dogovor',
                type: 'post',
                data: {
                  clientId: that.clientId,
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
              id: "dogovorId",
              fields: {
                userName: {editable: false},
                dateAdd: {editable: false},
                dogovorId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          dataBound: function (e) {
            for (var i = 0; i < e.sender.columns.length; i++)
              e.sender.autoFitColumn(i);
          }
        },
        pageable: true,
        sortable: true,
        scrollable: true,
        resizeable: true,
        editable: true,
      });
    },
    renderInfo: function () {
    },
    renderContact: function () {
      var that = this;
      this.el.find('.client-contact-form').kendoGrid({
        columns: [{
            field: 'contactId',
            title: '№',
            width: '50px'
          }, {
            field: 'fio',
            title: 'ФИО'
          }, {
            field: 'post',
            title: 'Должность'
          }, {
            field: 'typeC',
            title: 'тип',
            template: '#= type #',
            editor: function (container, options) {
              $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                        autoBind: false,
                        value: options.model.type,
                        text: options.model.type,
                        dataSource: [{
                            value: 'инвойс',
                            text: 'инвойс'
                          }, {
                            value: 'уведомления',
                            text: 'уведомления'
                          }, {
                            value: 'поддержка',
                            text: 'поддержка'
                          }, {
                            value: 'noc',
                            text: 'noc'
                          }, {
                            value: 'менеджер',
                            text: 'менеджер'
                          }, {
                            value: 'другое',
                            text: 'другое'
                          }],
                        dataBound: function (e) {
                          this.value(options.model.type);
                        }
                      });
            }
          }, {
            field: "email",
            title: "e-mail"
          }, {
            field: "telefon",
            title: "телефон"
          }, {
            field: 'skype',
            title: 'skype'
          }, {
            field: 'author',
            title: 'Автор'
          }, {
            field: 'clientId',
            hidden: true
          }, {
            field: 'info',
            title: 'Ремарка'
          }, {
            command: ["destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=get-contact',
                type: 'post',
                data: {
                  clientId: that.clientId,
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
                url: app.transitServerUrl + 'crm.php?method=add-contact',
                type: 'post',
                data: {
                  clientId: that.clientId,
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
              var model = options.data;
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=del-contact',
                type: 'post',
                data: {
                  contactId: model.contactId,
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
                url: app.transitServerUrl + 'crm.php?method=set-contact',
                type: 'post',
                data: {
                  contactId: model.contactId,
                  fio: model.fio,
                  post: model.post,
                  type: (model.typeC && model.typeC.value) || model.type,
                  email: model.email,
                  telefon: model.telefon,
                  skype: model.skype,
                  info: model.info,
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
              id: "contactId",
              fields: {
                author: {editable: false},
                contactId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          dataBound: function (e) {
            for (var i = 0; i < e.sender.columns.length; i++)
              e.sender.autoFitColumn(i);
          },
          autoSync: true
        },
        pageable: true,
        sortable: true,
        scrollable: true,
        resizeable: true,
        editable: true,
        toolbar: ["create"]
      });
    },
    renderDogovor: function () {
      var that = this;
      this.el.find('.client-dogovor-form').kendoGrid({
        columns: [{
            field: 'dogovorId',
            title: '№',
            width: '50px'
          }, {
            field: 'dogovorName',
            title: 'наименование'
          }, {
            field: 'dateAdd',
            title: 'Дата добавления',
            width: '150px'
          }, {
            field: 'userName',
            title: 'менеджер'
          }, {
            command: ["show"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'crm.php?method=get-dogovor',
                type: 'post',
                data: {
                  clientId: that.clientId,
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
              id: "dogovorId",
              fields: {
                userName: {editable: false},
                dateAdd: {editable: false},
                dogovorId: {editable: false}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
          dataBound: function (e) {
            for (var i = 0; i < e.sender.columns.length; i++)
              e.sender.autoFitColumn(i);
          }
        },
        pageable: true,
        sortable: true,
        scrollable: true,
        resizeable: true,
        editable: true,
      });
    }
  };
  return public;
});


