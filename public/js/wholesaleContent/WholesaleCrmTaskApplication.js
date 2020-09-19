define([
  'jquery',
  'kendo',
  'util',
  'i18n!../../js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/wholesale-crm-task-application.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template),
          companyName = '',
          currencyName = '';

  var public = {
    myModuleName: 'WholesaleCrmTasksApplication',
    run: function (params) {
      var tmp = params.treeId.split('-');// <-- treeId = 0-3
      this.el = params.el;
      this.taskId = tmp[3];
      this.taskState = tmp[2];

      this.i18n = $.extend(common, local);
      private.render.call(this);
      private.setTranksData.call(this);
      private.renderClientTranksTable.call(this);
      private.renderPartnerTranksTable.call(this);
      private.bindEvents.call(this);
    },
    onClickSubmitBtn: function (btn, level) {
      var that = this;
      $.ajax({
        url: app.wholesaleServerUrl + 'crm_task.php?method=update_task',
        type: 'post',
        data: {
          levelData: {
            clientTrank: localStorage["trank_client_data"],
            partnerTrank: localStorage["trank_partner_data"],
            partnerBlock: $("#partnerBlock").is(':checked'),
            clientBlock: $("#clientBlock").is(':checked')
          },
          taskId: this.taskId,
          nextLevel: level
        },
        success: function (resp) {
          var r = JSON.parse(resp);
          if (r.success) {
            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
            window.location.href = "#section/wholesale/tree/wholesale-crm/wholesale-crm/8";
          } else {
            app.showPopupMsg('bad', that.i18n.info.title, that.i18n.err.crytical);
          }
        }
      });
    }
  };
  var private = {
    bindEvents: function () {
      var that = this;

         $("#clientBlock").click(function () {
       $("#tranks-client").toggle(this.checked);
       }).triggerHandler('click');
       $("#partnerBlock").click(function () {
       $("#tranks-partner").toggle(this.checked);
       }).triggerHandler('click');
      $(document).off('click', '#application-submit-btn').on('click', '#application-submit-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this), 1);
      });
      $(document).off('click', '#application-cancel-btn').on('click', '#application-cancel-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this), -1);
      });
    },
    setTranksData: function () {
      var that = this;
      $.ajax({
        url: app.wholesaleServerUrl + 'crm_task.php?method=get_task',
        type: 'post',
        async: false,
        data: {
          user: app.getActiveUser(),
          taskId: this.taskId
        },
        success: function (resp) {
          var r = JSON.parse(resp);
          // if (r.success && typeof (r.data.list.levelData.clientTrank) !== "undefined") {
          if (r.data.list.levelData.clientBlock=='true') {
            $("#clientBlock").prop('checked', r.data.list.levelData.clientBlock);
            $("#tranks-client").toggle(that.checked);
          }
          if (r.data.list.levelData.partnerBlock=='true') {
            $("#partnerBlock").prop('checked', r.data.list.levelData.partnerBlock);
            $("#tranks-partner").toggle(that.checked);
          }
          if (r.data.list.levelData.clientTrank) {
            localStorage["trank_client_data"] = r.data.list.levelData.clientTrank;
          } else {
            localStorage["trank_client_data"] = [];
          }
          if (r.data.list.levelData.partnerTrank) {
            localStorage["trank_partner_data"] = r.data.list.levelData.partnerTrank;
          } else {
            localStorage["trank_partner_data"] = [];
          }

          // localStorage["trank_partner_data"] = JSON.stringify([]);
          // localStorage["trank_client_data"] = JSON.stringify([]);
          // if (r.success && typeof (r.data.list.companyName) !== "undefined") companyName = r.data.list.companyName;
          // if (r.success && typeof (r.data.list.currencyName) !== "undefined") currencytName = r.data.list.currencyName;
          if ("currencyName" in r)
            currencyName = r.data.list.currencyName;
          if ("companyName" in r)
            companyName = r.data.list.companyName;
        }
      });
    },
    render: function () {
      var that = this;
      var html = templateTmpl({
        i18n: that.i18n
      });

      that.el.html(html);
      that.el.find('.tabstrip').kendoTabStrip({
        animation: {
          open: {
            effects: "fadeIn"
          }
        }
      });
    },
    renderClientTranksTable: function () {
      var clientRoutingPlanDropDown = function (container, options) {
        $('<input required data-text-field="rName" data-value-field="rId" data-bind="value:rId"/>')
                .appendTo(container)
                .kendoDropDownList({
                  autoBind: true,
                  dataSource: {
                    transport: {
                      read: function (options) {
                        $.ajax({
                          url: app.wholesaleServerUrl + 'mvts.php?method=get_route_plan_selector',
                          data: {
                            userHash: app.getActiveUserHash(),
                            rName: companyName + '_' + $('#clientSuffixType').val().toUpperCase()
                          },
                          type: 'post',
                          success: function (resp) {
                            var parsedResp = $.parseJSON(resp);
                            if (parsedResp.success) {
                              options.success(parsedResp.data.list);
                            } else {
                              app.showPopupErrors(parsedResp.data.errors);
                            }
                          }
                        });
                      }
                    }
                  }
                }).data('kendoDropDownList');
      };
      var clientTariffPlanDropDown = function (container, options) {
        $('<input required data-text-field="tName" data-value-field="tId" data-bind="value:tId"/>')
                .appendTo(container)
                .kendoDropDownList({
                  autoBind: true,
                  dataSource: {
                    transport: {
                      read: function (options) {
                        $.ajax({
                          url: app.wholesaleServerUrl + 'mvts.php?method=get_tarif_plan_selector',
                          data: {
                            userHash: app.getActiveUserHash(),
                            tName: companyName + '_' + $('#clientSuffixType').val() + '_' + currencyName
                          },
                          type: 'post',
                          success: function (resp) {
                            var parsedResp = $.parseJSON(resp);
                            if (parsedResp.success) {
                              options.success(parsedResp.data.list);
                            } else {
                              app.showPopupErrors(parsedResp.data.errors);
                            }
                          }
                        });
                      }
                    }
                  }
                }).data('kendoDropDownList');
      };
      this.el.find('#tranks-client').kendoGrid({
        columns: [{
            field: 'clientTrankId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'clientTrankName',
            title: 'Название транка'
          }, {
            field: 'clientRoutingPlan',
            title: 'План маршрутизации',
            editor: clientRoutingPlanDropDown,
            template: function(e) {
              if (e.rId) {
                return e.rId.rName
              } else {
                return ''
              }
            }
          }, {
            field: 'clientTariffPlan',
            title: 'Тарифный план',
            editor: clientTariffPlanDropDown,
            template: function(e) {
              if (e.tId) {
                return e.tId.tName
              } else {
                return ''
              }
            }
          }, {
            field: 'clientPrefix',
            title: 'Тех. префикс'
          }, {
            field: 'clientIpAdresses',
            title: 'IP-адрес'
          }, {
            field: 'clientHardware',
            title: 'Оборудование'
          }, {
            command: ["edit", "destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        edit: function (e) {
          var model = e.model,
                  suffixType = $('#clientSuffixType').val();
          model.set("clientTrankName", companyName + '_' + suffixType.toUpperCase());
          model.set("clientHardware", companyName + '-' + suffixType.toLowerCase() + '-orig');
        },
        dataSource: {
          transport: {
            create: function (options) {
              var localData = JSON.parse(localStorage["trank_client_data"]);
              if (localData.length == 0) {
                options.data.clientTrankId = 1;
              } else {
                options.data.clientTrankId = parseInt(localData[localData.length - 1].clientTrankId) + 1;
              }
              localData.push(options.data);
              localStorage["trank_client_data"] = JSON.stringify(localData);
              options.success(options.data);
            },
            read: function (options) {
              var localData = JSON.parse(localStorage["trank_client_data"]);
              options.success(localData);
            },
            update: function (options) {
              var localData = JSON.parse(localStorage["trank_client_data"]);
              for (var i = 0; i < localData.length; i++) {
                if (localData[i].clientTrankId == options.data.clientTrankId) {
                  localData[i].clientTrankName = options.data.clientTrankName;
                  localData[i].clientRoutingPlan = options.data.clientRoutingPlan;
                  localData[i].clientTariffPlan = options.data.clientTariffPlan;
                  localData[i].clientPrefix = options.data.clientPrefix;
                  localData[i].clientIpAdresses = options.data.clientIpAdresses;
                  localData[i].clientHardware = options.data.clientHardware;
                }
              }
              localStorage["trank_client_data"] = JSON.stringify(localData);
              options.success(options.data);
            },
            destroy: function (options) {
              var localData = JSON.parse(localStorage["trank_client_data"]);
              for (var i = 0; i < localData.length; i++) {
                if (localData[i].clientTrankId === options.data.clientTrankId) {
                  localData.splice(i, 1);
                  break;
                }
              }
              localStorage["trank_client_data"] = JSON.stringify(localData);
              options.success(localData);
            }
          },
          schema: {
            model: {
              id: "clientTrankId",
              fields: {
                clientTrankId: {editable: false},
                clientTrankName: {},
                clientRoutingPlan: {defaultValue: '0'},
                clientTariffPlan: {defaultValue: '0'},
                clientPrefix: {},
                clientIpAdresses: {},
                clientHardware: {}
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
          autoSync: false
        },
        pageable: true,
        sortable: true,
        scrollable: true,
        resizeable: true,
        editable: "popup",
        toolbar: [
          {text: "", template: kendo.template($("#toolbar-client-template").html())},
          {name: "create", text: "Добавить новый транк"}
        ]
      });
    },
    renderPartnerTranksTable: function () {
      this.el.find('#tranks-partner').kendoGrid({
        columns: [{
            field: 'partnerTrankId',
            title: '№',
            width: '50px',
            sortable: false,
            filterable: false
          }, {
            field: 'partnerTrankName',
            title: 'Название транка'
          }, {
            field: 'partnerRoutingPlan',
            title: 'План маршрутизации'
          }, {
            field: 'partnerPrefix',
            title: 'Тех. префикс'
          }, {
            field: 'partnerSip',
            title: 'SIP/H.323'
          }, {
            field: 'partnerIpAdresses',
            title: 'IP-адрес'
          }, {
            field: 'partnerHardware',
            title: 'Оборудование'
          }, {
            command: ["edit", "destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        edit: function (e) {
          var model = e.model,
                  suffixType = $('#partnerSuffixType').val();
          model.set("partnerTrankName", companyName + '_' + suffixType);
          model.set("partnerRoutingPlan", companyName + '_' + suffixType + '_test');
          model.set("partnerHardware", companyName + '-' + suffixType + '-Term');
        },
        dataSource: {
          transport: {
            create: function (options) {
              var localData = JSON.parse(localStorage["trank_partner_data"]);
              if (localData.length == 0) {
                options.data.partnerTrankId = 1;
              } else {
                options.data.partnerTrankId = parseInt(localData[localData.length - 1].partnerTrankId) + 1;
              }
              localData.push(options.data);
              localStorage["trank_partner_data"] = JSON.stringify(localData);
              options.success(options.data);
            },
            read: function (options) {
              var localData = JSON.parse(localStorage["trank_partner_data"]);
              options.success(localData);
            },
            update: function (options) {
              var localData = JSON.parse(localStorage["trank_partner_data"]);

              for (var i = 0; i < localData.length; i++) {
                if (localData[i].partnerTrankId == options.data.partnerTrankId) {
                  localData[i].partnerTrankName = options.data.partnerTrankName;
                  localData[i].partnerRoutingPlan = options.data.partnerRoutingPlan;
                  localData[i].partnerPrefix = options.data.partnerPrefix;
                  localData[i].partnerSip = options.data.partnerSip;
                  localData[i].partnerIpAdresses = options.data.partnerIpAdresses;
                  localData[i].partnerHardware = options.data.partnerHardware;
                }
              }
              localStorage["trank_partner_data"] = JSON.stringify(localData);
              options.success(options.data);
            },
            destroy: function (options) {
              var localData = JSON.parse(localStorage["trank_partner_data"]);
              for (var i = 0; i < localData.length; i++) {
                if (localData[i].partnerTrankId === options.data.partnerTrankId) {
                  localData.splice(i, 1);
                  break;
                }
              }
              localStorage["trank_partner_data"] = JSON.stringify(localData);
              options.success(localData);
            }
          },
          schema: {
            model: {
              id: "partnerTrankId",
              fields: {
                partnerTrankId: {editable: false},
                partnerTrankName: {},
                partnerRoutingPlan: {},
                partnerPrefix: {},
                partnerSip: {},
                partnerIpAdresses: {},
                partnerHardware: {}
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
          autoSync: false
        },
        pageable: true,
        sortable: true,
        scrollable: true,
        resizeable: true,
        editable: "popup",
        toolbar: [
          {text: "", template: kendo.template($("#toolbar-partner-template").html())},
          {name: "create", text: "Добавить новый транк"}
        ]
      });
      this.el.find('.selectField').kendoDropDownList();
    }
  };
  return public;
});
