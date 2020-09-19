define([
  'jquery',
  'kendo',
  'util',
  'i18n!../../js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'text!./templates/wholesale-crm-tasks-list.html',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

  var templateTmpl = k.template(template);

  var public = {
    myModuleName: 'WholesaleCrmTasksList',
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
  // function getReferToStep(e) {
  //     e.preventDefault();
  //
  //     var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  //     window.location.href = '/#section/wholesale/tree/wholesale-crm/wholesale-crm/8-'  + dataItem.taskType + '-' + dataItem.taskLevel + '-' + dataItem.taskId;
  // }
  // function getButtonText(e) {
  //     var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  // }
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
    setContactsData: function (companyId) {
      // var contactGridData = [];
      $.ajax({
        url: app.wholesaleServerUrl + 'crm.php?method=get_contact_list',
        type: 'post',
        async: false,
        data: {
          user: app.getActiveUser(),
          companyId: companyId
        },
        success: function (resp) {
          var r = JSON.parse(resp);

          if (r.success) {
            localStorage["contacts_data"] = JSON.stringify(r.data.list);
          } else {
            localStorage["contacts_data"] = JSON.stringify([]);
          }
        }
      });
      // localStorage["grid_data"] = JSON.stringify(contactGridData);
    },
    makeButton: function (item) {
      var text = '',
              color = '',
              hrefBase = '<a href=/#section/wholesale/tree/wholesale-crm/wholesale-crm/8-';
      switch (item.taskLevel) {
        case '1':
          text = 'Создание договора';
          color = 'blue';
          break;
        case '2':
          text = 'Утверждение договора';
          color = 'orange';
          break;
        case '3':
          text = 'Подписание договора';
          color = 'green';
          break;
        case '4':
          text = 'Создание транков';
          color = 'brown';
          break;
        case '5':
          text = 'Создание транков';
          color = 'brown';
          break;
        case '6':
          text = 'Проверка таблиц МВТС';
          color = 'brown';
          break;
        case '7':
          text = 'Занесение плана маршрутизации';
          color = 'brown';
          break;
        case '8':
          text = 'Занесение тарифов';
          color = 'brown';
          break;
        case '9':
          text = 'Тестирование';
          color = 'brown';
          break;
        case '10':
          text = 'Завершение работ';
          color = 'brown';
          break;
      }
      return (hrefBase + item.taskType + '-' + item.taskLevel + '-' + item.taskId + ' class="k-button ' + color + '">' + text + '</a>')
    },
    renderServersTable: function () {
      this.el.find('#wholesale-crm-tasks-list').kendoGrid({
        columns: [{
            field: 'taskId',
            title: '№',
            width: '50px',
            template: function (item) {
              return ('<a href=/#section/wholesale/tree/wholesale-crm/wholesale-crm/8-' + item.taskType + '-' + item.taskLevel + '-' + item.taskId + '>' + item.taskId + '</a>')
            },
            editable: false,
            sortable: false,
            filterable: false
          }, {
            field: 'taskName',
            title: 'Название задачи',
            filterable: {
              extra: false,
              operators: {
                string: {
                  like: "Начинается с",
                  eq: "Равно",
                  neq: "Не равно"
                }
              }
            }
            // }, {
            //     field: 'taskType',
            //     title: 'Тип задачи'
          }, {
            field: 'companyName',
            title: 'Компания',
            sortable: false,
            filterable: false
          }, {
            title: 'Шаг подключения',
            field: 'taskStep',
            sortable: false,
            filterable: false,
            template: function (e) {
              return private.makeButton(e)
            }
          }, {
            field: 'memberName',
            title: 'Сотрудник',
            sortable: false,
            filterable: false,
          }, {
            field: 'taskInfo',
            title: 'Описание задачи',
            sortable: false,
            filterable: false
          }, {
            field: 'taskDateCreate',
            title: 'Дата постановки задачи',
            editable: false,
            sortable: false,
            filterable: false
          }, {
            field: 'taskDateClose',
            title: 'Дата закрытия задачи',
            editable: false,
            sortable: false,
            filterable: false
          }, {
            field: 'taskUserCreate',
            title: 'Кем создана',
            editable: false,
            sortable: false,
            filterable: false
          }, {
            field: 'taskUserClose',
            title: 'Кем закрыта',
            editable: false,
            sortable: false,
            filterable: false
          }, {
            field: 'taskState',
            title: 'Статус',
            sortable: false,
            filterable: false
          }, {
            field: 'taskProgress',
            title: 'Прогресс',
            sortable: false,
            filterable: false
          }, {
            command: ["edit", "destroy"],
            title: "&nbsp;",
            width: "90px"
          }],
        dataSource: private.getDataSource.call(this),
        filterable: {
          extra: false,
          operators: {
            string: {
              like: "Начинается с",
              eq: "Равно",
              neq: "Не равно"
            }
          }
        },
        pageable: {
          refresh: true,
          pageSizes: [20, 50, 100],
          buttonCount: 5
        },
        sortable: {
          mode: "single",
          allowUnsort: false
        },
        toolbar: [{name: "create", text: "Добавить задачу"}],
        editable: {mode: "popup", window: {width: 800}, template: $("#popupTemplate").html()},
        edit: function (e) {
          var editWindow = this.editable.element.data("kendoWindow");
          editWindow.wrapper.css({width: 1150, top: 200, left: 200});
          e.container.find(".k-edit-form-container").css({width: 1150});
          var contactTypeDropDown = function (container, options) {
            $('<input required data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                      autoBind: true,
                      dataSource: {
                        data: ['инвойс', 'уведомления', 'поддержка', 'noc', 'другое', 'менеджер']
                      }
                    });
          };
          if (e.model.isNew()) {
            private.setContactsData(e.model.companyId);
            e.container.find(".wholesale-crm-tasks-contacts").kendoGrid({
              columns: [{
                  field: 'contactId',
                  title: '№',
                  width: '50px'
                }, {
                  field: 'type',
                  title: 'Тип контакта',
                  editor: contactTypeDropDown
                }, {
                  field: 'fio',
                  title: 'ФИО'
                }, {
                  field: 'post',
                  title: 'Должность'
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
                  field: 'info',
                  title: 'Ремарка'
                }, {
                  command: ["edit", "destroy"],
                  title: "&nbsp;",
                  width: "90px"
                }],
              dataSource: {
                transport: {
                  create: function (options) {
                    var localData = JSON.parse(localStorage["contacts_data"]);
                    if (localData.length == 0) {
                      options.data.contactId = 1;
                    } else {
                      options.data.contactId = parseInt(localData[localData.length - 1].contactId) + 1;
                    }
                    localData.push(options.data);
                    localStorage["contacts_data"] = JSON.stringify(localData);
                    options.success(options.data);
                  },
                  read: function (options) {
                    var localData = JSON.parse(localStorage["contacts_data"]);
                    options.success(localData);
                  },
                  update: function (options) {
                    var localData = JSON.parse(localStorage["contacts_data"]);

                    for (var i = 0; i < localData.length; i++) {
                      if (localData[i].contactId == options.data.contactId) {
                        localData[i].type = options.data.type;
                        localData[i].fio = options.data.fio;
                        localData[i].post = options.data.post;
                        localData[i].email = options.data.email;
                        localData[i].telefon = options.data.telefon;
                        localData[i].skype = options.data.skype;
                        localData[i].info = options.data.info;
                      }
                    }
                    localStorage["contacts_data"] = JSON.stringify(localData);
                    options.success(options.data);
                  },
                  destroy: function (options) {
                    var localData = JSON.parse(localStorage["contacts_data"]);
                    for (var i = 0; i < localData.length; i++) {
                      if (localData[i].contactId === options.data.contactId) {
                        localData.splice(i, 1);
                        break;
                      }
                    }
                    localStorage["contacts_data"] = JSON.stringify(localData);
                    options.success(localData);
                  }
                },
                schema: {
                  model: {
                    id: "contactId",
                    fields: {
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
                autoSync: false
              },
              pageable: true,
              sortable: true,
              scrollable: true,
              resizeable: true,
              editable: "popup",
              toolbar: [{name: "create", text: "Добавить контакт"}]
            });
          } else {
            e.container.find("#companyName").prop("disabled", true);
            e.container.find('label[for=lang]').closest(".k-edit-label").remove();
            e.container.find('#lang').closest(".k-edit-field").remove();
            e.container.find('label[for=group]').closest(".k-edit-label").remove();
            e.container.find('#group').closest(".k-edit-field").remove();
            e.container.find(".wholesale-crm-tasks-contacts").kendoGrid({
              columns: [{
                  field: 'contactId',
                  title: '№',
                  width: '50px'
                }, {
                  field: 'type',
                  title: 'Тип контакта',
                  editor: contactTypeDropDown
                }, {
                  field: 'fio',
                  title: 'ФИО'
                }, {
                  field: 'post',
                  title: 'Должность'
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
                  field: 'info',
                  title: 'Ремарка'
                }, {
                  command: ["edit", "destroy"],
                  title: "&nbsp;",
                  width: "90px"
                }],
              dataSource: {
                transport: {
                  read: function (options) {
                    $.ajax({
                      url: app.wholesaleServerUrl + 'crm.php?method=get_contact_list',
                      type: 'post',
                      data: {
                        companyId: e.model.companyId,
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
                    var model = options.data;
                    $.ajax({
                      url: app.wholesaleServerUrl + 'crm.php?method=add_contact',
                      type: 'post',
                      data: {
                        companyId: e.model.companyId,
                        user: app.getActiveUser(),
                        contactId: model.contactId,
                        fio: model.fio,
                        type: model.type,
                        post: model.post,
                        email: model.email,
                        telefon: model.telefon,
                        skype: model.skype,
                        info: model.info
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
                      url: app.wholesaleServerUrl + 'crm.php?method=del_contact',
                      type: 'post',
                      data: {
                        companyId: e.model.companyId,
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
                      url: app.wholesaleServerUrl + 'crm.php?method=set_contact',
                      type: 'post',
                      data: {
                        companyId: e.model.companyId,
                        contactId: model.contactId,
                        fio: model.fio,
                        type: model.type,
                        post: model.post,
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
                      contactId: {editable: false},
                      fio: {},
                      post: {},
                      email: {},
                      telefon: {},
                      skype: {},
                      info: {}
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
              toolbar: [{name: "create", text: "Добавить контакт"}]
            });
          }

          var usersChecking = function (langName, groupId) {
            $.ajax({
              url: app.wholesaleServerUrl + 'crm.php?method=get_manager_selector',
              data: {
                user: app.getActiveUser(),
                groupId: groupId,
                langName: langName
              },
              type: 'post',
              success: function (resp) {
                var parsedResp = $.parseJSON(resp);
                if (parsedResp.success) {
                  membersDropDown.setDataSource(parsedResp.data.list);
                }
              }
            });
          };
          var membersDropDown = e.container.find("#member").kendoDropDownList({
            autoBind: true,
            dataTextField: "memberName",
            dataValueField: "memberId",
            dataSource: {
              transport: {
                read: function (options) {
                  $.ajax({
                    url: app.wholesaleServerUrl + 'crm.php?method=get_manager_selector',
                    type: 'post',
                    success: function (resp) {
                      var r = JSON.parse(resp);

                      if (r.success) {
                        options.success(r.data.list);
                        membersDropDown.value(e.model.memberId)
                      }
                    }
                  });
                }
              }
            }
          }).data("kendoDropDownList");
          var langDropDown = e.container.find("#lang").kendoDropDownList({
            autoBind: true,
            dataTextField: "langName",
            dataValueField: "langId",
            select: function (e) {
              var langName = this.dataItem(e.item).langName;
              // var langName = $('#lang').find('option:selected').text();
              var groupId = $('#group').val();
              usersChecking(langName, groupId);
            },
            dataSource: {
              transport: {
                read: function (options) {
                  $.ajax({
                    url: app.wholesaleServerUrl + 'crm.php?method=get_lang_selector',
                    type: 'post',
                    success: function (resp) {
                      var r = JSON.parse(resp);

                      if (r.success) {
                        options.success(r.data.list);
                        langDropDown.value(e.model.langId)
                      }
                    }
                  });
                }
              }
            }
          }).data("kendoDropDownList");
          var groupDropDown = e.container.find("#group").kendoDropDownList({
            autoBind: true,
            dataTextField: "groupName",
            dataValueField: "groupId",
            select: function (e) {
              var groupId = this.dataItem(e.item).groupId;
              // var langName = $('#lang').find('option:selected').text();
              var langName = langDropDown.text();
              usersChecking(langName, groupId);
            },
            dataSource: {
              transport: {
                read: function (options) {
                  $.ajax({
                    url: app.wholesaleServerUrl + 'crm.php?method=get_group_selector',
                    type: 'post',
                    success: function (resp) {
                      var r = JSON.parse(resp);

                      if (r.success) {
                        options.success(r.data.list);
                        groupDropDown.value(e.model.groupId)
                      }
                    }
                  });
                }
              }
            }
          }).data("kendoDropDownList");
        }
      });
    },
    getDataSource: function () {
      var that = this;
      return new kendo.data.DataSource({
        transport: {
          read: function (options) {
            $.ajax({
              url: app.wholesaleServerUrl + 'crm_task.php?method=get_task_list',
              type: 'post',
              data: {
                sort: options.data.sort,
                skip: options.data.skip,
                take: options.data.take,
                filter: options.data.filter,
                user: app.getActiveUser(),
                // typeTree: that.id
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
              url: app.wholesaleServerUrl + 'crm_task.php?method=add_task',
              type: 'post',
              data: {
                contacts: localStorage["contacts_data"],
                user: app.getActiveUser(),
                taskName: model.taskName,
                // taskType: model.taskType,
                taskInfo: model.taskInfo,
                // type: model.type.text,
                memberId: model.memberId,
                companyName: model.companyName,
                langName: model.langName,
                langId: model.langId,
                groupName: model.groupName,
                groupId: model.groupId
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
              url: app.wholesaleServerUrl + 'crm_task.php?method=del_task',
              type: 'post',
              data: {
                user: app.getActiveUser(),
                taskId: model.taskId
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
              url: app.wholesaleServerUrl + 'crm_task.php?method=set_task',
              type: 'post',
              data: {
                // contacts: localStorage["contacts_data"],
                user: app.getActiveUser(),
                taskId: model.taskId,
                taskName: model.taskName,
                // type: model.type.text,
                taskInfo: model.taskInfo,
                memberId: model.memberId,
                taskState: model.taskState,
                taskProgress: model.taskProgress,
                companyName: model.companyName,
                langName: model.langName,
                langId: model.langId,
                groupId: model.groupId
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
            id: "taskId",
            fields: {
              taskName: {},
              taskType: {},
              taskInfo: {},
              memberId: {defaultValue: 0},
              companyId: {},
              langId: {defaultValue: 0},
              groupId: {defaultValue: 0},
            }
          }
        },
        autoSync: false,
        batch: true,
        pageSize: that.gridPageSize,
        serverFiltering: true,
        serverPaging: true,
        serverSorting: true
      });
    },
  };
  return public;
});
