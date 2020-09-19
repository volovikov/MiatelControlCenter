define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/transitContent.js',
  'text!./templates/crm-count-call.html',
  'css!./css/transitContent'
], function ($, k, u, common, local, statisticPage) {

  var cdrListPageTmpl = k.template(statisticPage);

  var public = {
    myModuleName: 'CrmStatCountCallModule',
    gridPageSize: 20,
    defaultPeriod: {
      dateBegin: null,
      timeBegin: null,
      dateEnd: null,
      timeEnd: null
    },
    prefix:'79',
    prefixSrc:'7',
    run: function (params) {
      var tmp = u.getTimeFormatStr(new Date(+new Date() - 1000 * 60 * 60 * 24)),
              pdate = tmp.split(' ')[0],
              t = u.getCurrentTime().split(':'),
              time = t[0] + ':' + t[1]; // no sec
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);

      this.defaultPeriod = {
        dateBegin: pdate,
        timeBegin: time,
        dateEnd: u.getCurrentDate(),
        timeEnd: time
      };
      private.bindEvents.call(this);
      private.render.call(this);
    },
    onClickRedrawBtn: function () {
      var period = {
        dateBegin: this.el.find('#dateBegin').val(),
        timeBegin: this.el.find('#timeBegin').val(),
        dateEnd: this.el.find('#dateEnd').val(),
        timeEnd: this.el.find('#timeEnd').val(),
      };
      var prefix=this.el.find('#prefix').val();
      var prefixSrc=this.el.find('#prefixSrc').val();
      private.redraw.call(this, this.treeId, period,prefix,prefixSrc);
    }
  };
  var private = {
    bindEvents: function () {
      var that = this;
    },
    redraw: function (serverId, period,prefix,prefixSrc) {
      var that = this;

      //private.getDataSource.call(this, this.serverId, period, function(data) {
      private.renderCdrList.call(that);
      //});
    },
    render: function () {
      var that = this;
      var html = cdrListPageTmpl({
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
      that.el.find('#count-call-toolbar').kendoToolBar({
        items: [{
            template: '<input class="datePicker" id="dateBegin" value="' + that.defaultPeriod.dateBegin + '"/>',
            overflow: 'never'
          }, {
            template: '<input class="timePicker" id="timeBegin" value="' + that.defaultPeriod.timeBegin + '"/>',
            overflow: 'never'
          },{
            template: '<input  id="prefixSrc" value="' + that.prefixSrc + '"/>',
            overflow: 'never'
          }, {
            type: 'separator'
          }, {
            template: '<input class="datePicker" id="dateEnd" value="' + that.defaultPeriod.dateEnd + '"/>',
            overflow: 'never'
          }, {
            template: '<input class="timePicker" id="timeEnd" value="' + that.defaultPeriod.timeEnd + '"/>',
            overflow: 'never'
          }, {
            template: '<input  id="prefix" value="' + that.prefix + '"/>',
            overflow: 'never'
          },{
            type: 'button',
            icon: 'refresh',
            text: that.i18n.transit.getCdrList,
            click: function () {
              that.onClickRedrawBtn.call(that);
            }
          }]
      });
      that.el.find(".datePicker").kendoDatePicker({
        depth: 'month',
        format: 'yyyy-MM-dd'
      });
      that.el.find(".timePicker").kendoTimePicker({
        format: 'HH:mm'
      });
      private.renderCdrList.call(that);
    },
    renderCdrList: function (data) {
      var that = this;
      var dataBound = function (e) {
        var grid = $('#count-call').data("kendoGrid");
        for (var i = 0; i < grid.columns.length; i++) {
          grid.autoFitColumn(i);
        }
      };
      var period = {
        dateBegin: this.el.find('#dateBegin').val(),
        timeBegin: this.el.find('#timeBegin').val(),
        dateEnd: this.el.find('#dateEnd').val(),
        timeEnd: this.el.find('#timeEnd').val()
      };
      var prefix=this.el.find('#prefix').val();
      var prefixSrc=this.el.find('#prefixSrc').val();
      this.el.find('#count-call').kendoGrid({
        dataSource: private.getDataSource.call(this, this.treeId, period,prefix,prefixSrc),
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
        sort: {
          field: "callCount",
          dir: "desc"
        },
        columns: [{
            field: 'srcInput',
            title: 'src номер',
          }, {
            field: 'countCall',
            title: 'количество звонков',
            filterable:false
          }],
        pageable: {
          refresh: true,
          pageSizes: true,
          buttonCount: 5
        },
        sortable: {
          mode: "multiple",
          allowUnsort: false
        },
        scrollable: true,
        resizable: true,
      });
    },
    getDataSource: function (serverId, period, prefix,prefixSrc,callback) {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'crm.php?method=get-count-call-by-prefix',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                period: period,
                filter: options.data.filter,
                prefix: prefix,
                prefixSrc: prefixSrc,
                user:app.getActiveUser()
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
            fields: {
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
