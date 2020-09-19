define([
  'jquery',
  'kendo',
  'util',
  'i18n!../../js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/wholesale-crm-task-agreement.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'WholesaleCrmTasksAgreement',
    run: function (params) {
      var tmp = params.treeId.split('-');// <-- treeId = 0-3
      this.el = params.el;
      this.taskId = tmp[3];
      this.taskState = tmp[2];

      this.i18n = $.extend(common, local);
      private.render.call(this);
      private.bindEvents.call(this);
    },
    onClickSubmitBtn: function (btn, level) {
      var that = this,
              selectedForm = $("#agreementForm").val(),
              contractData = $('#jurForm, #commonForm, #' + selectedForm + 'Form').serializeArray(),
              obj = {};
      for (var i = 0, l = contractData.length; i < l; i++) {
        obj[contractData[i].name] = contractData[i].value;
      }

      $.ajax({
        url: app.wholesaleServerUrl + 'crm_task.php?method=update_task',
        type: 'post',
        data: {
          levelData: obj,
          taskId: this.taskId,
          nextLevel: level,
          user: app.getActiveUser()
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
    },
    onClickShowBtn: function (btn) {

    }
  };
  var private = {
    bindEvents: function () {
      var that = this;
      $(document).off('click', '#contract-submit-btn').on('click', '#contract-submit-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this), 1);
      });
      $(document).off('click', '#contract-save-btn').on('click', '#contract-save-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this), 0);
      });
      $(document).off('click', '#contract-cancel-btn').on('click', '#contract-cancel-btn', function (e) {
        e.preventDefault();
        that.onClickSubmitBtn.call(that, $(this), -1);
      });
      $(document).off('click', '#contract-show-btn').on('click', '#contract-show-btn', function (e) {
        e.preventDefault();
        that.onClickShowBtn.call(that, $(this));
      });
    },
    render: function () {
      var that = this;
      var html = templateTmpl({
        i18n: that.i18n
      });

      function onChangeForm() {
        var value = $("#agreementForm").val();
        $('.contract-forms').hide();
        $('#' + value + 'Form').show();
      }
      function onChangeJurisdiction() {
        var j = $("#contractJurisdiction").val();
        $.ajax({
          url: app.wholesaleServerUrl + 'crm.php?method=get_jurisdiction_agr_tmp_selector',
          type: 'post',
          data: {
            user: app.getActiveUser(),
            jId: j
          },
          success: function (resp) {
            var r = JSON.parse(resp);
            if (r.success) {
              contrTemlDropDown.setDataSource(r.data.list);
              contrTemlDropDown.value('0');
            }
          }
        });
        $.ajax({
          url: app.wholesaleServerUrl + 'crm.php?method=get_company_bank_selector',
          type: 'post',
          data: {
            user: app.getActiveUser(),
            jId: j
          },
          success: function (resp) {
            var r = JSON.parse(resp);
            if (r.success) {
              bankDetailsDropDown.setDataSource(r.data.list);
              bankDetailsDropDown.value('0');
            }
          }
        });
      }
      function onChangeCurrency() {
        var j = $("#contractJurisdiction").val();
        var c = $("#contractCurrency").val();
        $.ajax({
          url: app.wholesaleServerUrl + 'crm.php?method=get_company_bank_selector',
          type: 'post',
          data: {
            user: app.getActiveUser(),
            jId: j,
            currencyId: c
          },
          success: function (resp) {
            var r = JSON.parse(resp);
            if (r.success) {
              bankDetailsDropDown.setDataSource(r.data.list);
              bankDetailsDropDown.value('0');
            }
          }
        });
      }
      that.el.html(html);
      if (this.taskState === '2') {
        that.el.find('#contract-save-btn').remove();
        that.el.find('#contract-submit-btn').text('Акцепт');
      } else {
        that.el.find('#contract-show-btn').remove();
        that.el.find('#contract-cancel-btn').text('Закрыть задачу');
      }
      var agreemDropDown = that.el.find('#agreementForm').kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        optionLabel: "--Выбор формы--",
        dataSource: [
          {text: "Наша", value: "our"},
          {text: "Партнера", value: "partner"}
        ],
        change: onChangeForm
      }).data("kendoDropDownList");
      var jurDropDown = that.el.find('#contractJurisdiction').kendoDropDownList({
        dataTextField: "name",
        dataValueField: "jId",
        value: "0",
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.wholesaleServerUrl + 'crm.php?method=get_jurisdiction_selector',
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
        change: onChangeJurisdiction
                // select: function (e) {
                //     var j = this.dataItem(e.item).jId;
                //     onChangeJurisdiction(j);
                // }
      }).data("kendoDropDownList");
      var contrTemlDropDown = that.el.find('#contractTemplate').kendoDropDownList({
        dataTextField: "atName",
        dataValueField: "atId",
        dataSource: []
      }).data("kendoDropDownList");
      var bankDetailsDropDown = that.el.find('#ourBankDetails').kendoDropDownList({
        dataTextField: "bankName",
        dataValueField: "bankId",
        dataSource: []
      }).data("kendoDropDownList");
      var currencyDropDown = that.el.find('#contractCurrency').kendoDropDownList({
        dataTextField: "currencyName",
        dataValueField: "currencyId",
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
        change: onChangeCurrency
      }).data("kendoDropDownList");

      that.el.find('#contractDate').kendoDatePicker({
        value: new Date()
      });

      that.el.find('.selectField').kendoDropDownList();
      that.el.find('.combobox').kendoComboBox();
      that.el.find('.tabstrip').kendoTabStrip({
        animation: {
          open: {
            effects: "fadeIn"
          }
        }
      });
      $.ajax({
        url: app.wholesaleServerUrl + 'crm_task.php?method=get_task',
        type: 'post',
        data: {
          taskId: this.taskId,
        },
        success: function (resp) {
          var r = JSON.parse(resp);
          if (r.success) {
            var f = r.data.list.levelData;
            if (f.agreementForm) {
              agreemDropDown.value(f.agreementForm);
              onChangeForm();
            }
            if (f.contractJurisdiction) {
              jurDropDown.value(f.contractJurisdiction);
              onChangeJurisdiction();
            }
            kendo.bind($("#crm-tasks-agreement-wrapper"), r.data.list.levelData);
            if (!f.contractCurrency) {
              currencyDropDown.select(0);
            }
          }
        }
      });

    }
  };
  return public;
});
