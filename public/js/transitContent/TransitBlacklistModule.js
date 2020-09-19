define([
  'jquery',
  'kendo',
  'util',
  'i18n!js/common/nls/main.js',
  'i18n!./nls/transitContent.js',
  'text!./templates/transit-blacklist.html',
  'css!./css/transitContent'
], function ($, k, u, common, local, blacklist) {

  var blacklistTmpl = k.template(blacklist);

  var public = {
    myModuleName: 'TransitBlacklistModule',
    gridPageSize: 20,
    run: function (params) {
      for (var key in params) {
        this[key] = params[key];
      }
      this.i18n = $.extend(common, local);
//            this.id=this.treeId.split('-')[1];
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
      html = blacklistTmpl({
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
      private.renderServersTable11.call(this);
    },
    renderServersTable: function () {
      this.el.find('#blacklist').kendoGrid({
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
            title: 'Номер',
          }, {
            field: 'type',
            title: 'Тип',
            filterable: false
          }, {
            field: 'loadMvts',
            title: 'Дата загрузки на MVTS',
            filterable: false
          }, {
            field: "blockTime",
            title: "Дата разблокировки",
            filterable: false
          }, {
            field: "slice",
            hidden: true,
          }, {
            field: "excl",
            hidden: true
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
        dataBound: function (e) {
          var grid = $("#blacklist").data("kendoGrid");
          var data = grid.dataSource.data();
          $.each(data, function (i, row) {
            if (row.excl != 0)
              $('tr[data-uid="' + row.uid + '"] ').addClass("change-background");
          });
        }
      });
    },
    detailInit: function (e) {
      var detailRow = e.detailRow;
      var t = 0;
      if (e.data.excl != 0)
        t = 1;
      detailRow.find('.blacklist-detail').kendoGrid({
        columns: [{
            field: 'number',
            title: 'Номер',
            hidden: true
          }, {
            field: 'type',
            title: 'Тип',
            hidden: true
          }, {
            field: 'rating',
            title: 'Баллы',
          }, {
            field: "rulesName",
            title: "Правила",
            template: function (item) {
              var html = [];
              item.rulesName.forEach(function (i, n, c) {
                html.push('<a href=/#section/transit/tree/blacklist/blacklist/1-' + i + '>' + i + '</a>');
              });
              return html.join(', ');
            }
          }, {
            field: "exclusion",
            title: "Исключения",
            template: function (item) {
              var html = [];
              item.exclusion.forEach(function (i, n, c) {
                if (i.client != undefined)
                  html.push('client:"' + i.client + '"');
                if (i.partner != undefined)
                  html.push('partner:"' + i.partner + '"');
                if (i.dst != undefined)
                  html.push('dst:"' + i.dst + '"');
                if (i.src != undefined)
                  html.push('src:"' + i.src + '"');
              });
              return html.join(', ');
            }
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=get-black-list-detail',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  slice: e.data.slice,
                  type: e.data.type,
                  number: e.data.number,
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
              id: "number",
              fields: {
                number: {editable: false, nullable: true},
                type: {},
                rating: {},
                exclusion: {},
                rulesName: {}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
        },
        pageable: false,
        sortable: false,
        scrollable: true,
        resizeable: true,
      });
      var dataBound = function (e) {
        for (var i = 0; i < e.sender.columns.length; i++)
          e.sender.autoFitColumn(i);
      };
      detailRow.find('.fraudlist').kendoGrid({
        columns: [{
            field: 'src',
            title: 'SRC'
          }, {
            field: 'dst',
            title: 'DST'
          }, {
            field: 'first_call_time',
            title: 'Первый звонок',
          }, {
            field: "last_call_time",
            title: "Последний звонок"
          }, {
            field: "count_call",
            title: "Количество звонков"
          }, {
            field: "acd",
            title: "ACD"
          }, {
            field: "asr",
            title: "ASR"
          }, {
            field: "max_duration_call",
            title: "Макс. длительность звонка"
          }, {
            field: "rate_src",
            title: "Баллы по SRC"
          }, {
            field: "rate_dst",
            title: "Баллы по DST"
          }, {
            field: "reason_block",
            title: "Причина блокировки"
          }, {
            field: "rulesName",
            title: "Правила"
          }, {
            field: "exclusion",
            title: "Исключения",
            template: "#= exclusion.join(', ') #"
          }, {
            field: "clientId",
            title: "Клиенты",
            template: function (item) {
              var html = [];
              item.clientId.forEach(function (i, n, c) {
                html.push(i.clientName);
              });
              return html.join(', ');
            }
          }, {
            field: "partnerId",
            title: "Партнеры",
            template: function (item) {
              var html = [];
              item.partnerId.forEach(function (i, n, c) {
                html.push(i.partnerName);
              });
              return html.join(', ');
            }

          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=get-fraud-list-detail',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  slice: e.data.slice,
                  type: e.data.type,
                  number: e.data.number,
                  exclusion: e.data.excl
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
              id: "number",
              fields: {
                number: {editable: false, nullable: true},
                type: {},
                rating: {},
                exclusion: {},
                rulesName: {}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
        },
        scrollable: true,
        resizeable: true,
        pageable: false,
        dataBound: dataBound,
        sortable: {
          mode: "single",
          allowUnsort: false
        }
      });
    },
    getDataSource: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'blacklist.php?method=get-black-list',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
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
            id: "number",
            fields: {
              number: {editable: false, nullable: true},
              type: {},
              loadMvts: {},
              blockTime: {},
              slice: {},
              excl: {}
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        scrolable: true,
        resizeable: true
      });
    },
    renderServersTable11: function () {
      this.el.find('#blacklist-history').kendoGrid({
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
            title: 'Номер',
          }, {
            field: 'type',
            title: 'Тип',
            filterable: false
          }, {
            field: 'loadMvts',
            title: 'Дата загрузки на MVTS',
            filterable: false
          }, {
            field: "blockTime",
            title: "Дата разблокировки",
            filterable: false
          }, {
            field: "slice",
            hidden: true,
          }, {
            field: "excl",
            hidden: true
          }],
        dataSource: private.getDataSource11.call(this),
        detailTemplate: kendo.template($("#detail-template").html()),
        detailInit: private.detailInit11,
        pageable: {
          refresh: true,
          pageSizes: true,
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        dataBound: function (e) {
          var grid = $("#blacklist-history").data("kendoGrid");
          var data = grid.dataSource.data();
          $.each(data, function (i, row) {
            if (row.excl != 0)
              $('tr[data-uid="' + row.uid + '"] ').addClass("change-background");
          });
        }
      });
    },
    detailInit11: function (e) {
      var detailRow = e.detailRow;
      var t = null;
      if (e.data.excl.length > 0)
        t = 1;
      detailRow.find('.blacklist-detail').kendoGrid({
        columns: [{
            field: 'number',
            title: 'Номер',
            hidden: true
          }, {
            field: 'type',
            title: 'Тип',
            hidden: true
          }, {
            field: 'rating',
            title: 'Баллы',
          }, {
            field: "rulesName",
            title: "Правила",
            template: function (item) {
              var html = [];
              item.rulesName.forEach(function (i, n, c) {
                html.push('<a href=/#section/transit/tree/blacklist/blacklist/1-' + i + '>' + i + '</a>');
              });
              return html.join(', ');
            }
          }, {
            field: "exclusion",
            title: "Исключения",
            template: function (item) {
              var html = [];
              item.exclusion.forEach(function (i, n, c) {
                if (i.client != undefined)
                  html.push('client:"' + i.client + '"');
                if (i.partner != undefined)
                  html.push('partner:"' + i.partner + '"');
                if (i.dst != undefined)
                  html.push('dst:"' + i.dst + '"');
                if (i.src != undefined)
                  html.push('src:"' + i.src + '"');
              });
              return html.join(', ');
            }
          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=get-black-list-detail',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  slice: e.data.slice,
                  type: e.data.type,
                  number: e.data.number,
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
              id: "number",
              fields: {
                number: {editable: false, nullable: true},
                type: {},
                rating: {},
                exclusion: {},
                rulesName: {}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
        },
        pageable: false,
        sortable: false,
        scrollable: true,
        resizeable: true,
      });
      var dataBound = function (e) {
        for (var i = 0; i < e.sender.columns.length; i++)
          e.sender.autoFitColumn(i);
      };

      detailRow.find('.fraudlist').kendoGrid({
        columns: [{
            field: 'src',
            title: 'SRC'
          }, {
            field: 'dst',
            title: 'DST'
          }, {
            field: 'first_call_time',
            title: 'Первый звонок',
          }, {
            field: "last_call_time",
            title: "Последний звонок"
          }, {
            field: "count_call",
            title: "Количество звонков"
          }, {
            field: "acd",
            title: "ACD"
          }, {
            field: "asr",
            title: "ASR"
          }, {
            field: "max_duration_call",
            title: "Макс. длительность звонка"
          }, {
            field: "rate_src",
            title: "Баллы по SRC"
          }, {
            field: "rate_dst",
            title: "Баллы по DST"
          }, {
            field: "reason_block",
            title: "Причина блокировки"
          }, {
            field: "rulesName",
            title: "Правила"
          }, {
            field: "exclusion",
            title: "Исключения",
            template: "#= exclusion.join(', ') #"
          }, {
            field: "clientId",
            title: "Клиенты",
            template: function (item) {
              var html = [];
              item.clientId.forEach(function (i, n, c) {
                html.push(i.clientName);
              });
              return html.join(', ');
            }
          }, {
            field: "partnerId",
            title: "Партнеры",
            template: function (item) {
              var html = [];
              item.partnerId.forEach(function (i, n, c) {
                html.push(i.partnerName);
              });
              return html.join(', ');
            }

          }],
        dataSource: {
          transport: {
            read: function (options) {
              $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=get-fraud-list-detail',
                type: 'post',
                data: {
                  sort: options.data.sort,
                  skip: options.data.skip,
                  take: options.data.take,
                  slice: e.data.slice,
                  type: e.data.type,
                  number: e.data.number,
                  exclusion: e.data.excl
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
              id: "number",
              fields: {
                number: {editable: false, nullable: true},
                type: {},
                rating: {},
                exclusion: {},
                rulesName: {}
              }
            }

          },
          serverPaging: true,
          serverSorting: true,
          serverFiltering: true,
          pageSize: 5,
        },
        scrollable: true,
        resizeable: true,
        pageable: false,
        dataBound: dataBound,
        sortable: {
          mode: "single",
          allowUnsort: false
        }
      });
    },
    getDataSource11: function () {
      var that = this;

      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.transitServerUrl + 'blacklist.php?method=get-black-list-history',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
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
            id: "number",
            fields: {
              number: {editable: false, nullable: true},
              type: {},
              loadMvts: {},
              blockTime: {},
              slice: {},
              excl: {}
            }
          }
        },
        autoSync: true,
        batch: true,
        pageSize: that.gridPageSize,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        scrolable: true,
        resizeable: true
      });
    },
  };
  return public;
});
