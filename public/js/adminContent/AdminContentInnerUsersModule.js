/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminUserForm
 * @returns {AdminContentSipUsersModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-inner-user-form.html',
    'css!./css/adminContent'
], function($, k, u, common, local, adminSipUserForm) {
    
    var adminSipUserFormTmpl = k.template(adminSipUserForm);
    
    var public = {        
        myModuleName: 'AdminContentInnerUsersModule',
        defaultTreeKey: 'users',
        defaultTreeId: 0,
        gridPageSize: 20,
        run: function(params) {
            this.el = params.el;
            this.treeId = params.treeId;            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSaveBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl);

            formValue.userMobilePhone = formValue.userMobilePhone.replace('(', '').replace(')', '');
            formValue.userRomingNumber = formValue.userRomingNumber.replace('(', '').replace(')', '');
            
            var data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.taskId
                });                
            
            if (this.validator.validate()) {
                u.ajaxRequest('update-inner-user', data, function(err, data) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('update-inner-user', data);
                    }
                });                
            }

        },
        onClickDeleteBtn: function() {
            if (confirm(this.i18n.confirmDel)) {
                $.ajax({
                    url: 'http://91.217.178.7/backend/public.php?method=del-inner-user',
                    type: 'post',
                    data: {
                        id:  this.treeId// 455-12  455 - userId, 15 - sipUserId
                    },
                    success: function(resp) {
                        var r = JSON.parse(resp);
                        
                        // BB
                        // this code must be write in future!
                        console.log(r);
                    }
                });
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
           
            $(document).off('click', '#sipuser-form-submit-btn').on('click', '#sipuser-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSaveBtn.call(that);
            });
            $(document).off('click', '#sipuser-form-del-btn').on('click', '#sipuser-form-del-btn', function(e) {
                e.preventDefault();
                that.onClickDeleteBtn.call(that);
            });
        },
        render: function() {
            var that = this,
                data = {
                    id: this.treeId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-inner-user', data, function(err, data) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.innerPhoneNumber = data.innerPhoneNumber;
                    
                    var list = data.phoneAonList.split(',').map(function(e) {
                        return u.getMainPhoneFormatStr(e);
                    });
                    html = adminSipUserFormTmpl({
                        i18n: that.i18n,
                        user: data,
                        phoneAonList: list
                    });
                    that.el.html(html); 
                    that.el.find('.combobox').kendoComboBox({
                        
                    });
                    that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    }); 
                    that.el.find('.phone-input').kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
                    that.validator = that.el.find('form').kendoValidator().data("kendoValidator");
                    private.renderHistoryCallTable.call(that);
                }
            });        
        },
        renderHistoryCallTable: function() {
            var that = this;
            
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=get-calls-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    src: [that.innerPhoneNumber],
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    callType: 'all'
                                },
                                success: function(resp) {
                                    try {
                                        var r = JSON.parse(resp);

                                        if (r.success) {
                                            options.success(r);
                                        } else {
                                            options.error();
                                        }                                        
                                    } catch(e) {
                                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                    }
                                }
                            });
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                recId: { editable: false, nullable: true },
                                time: {},
                                src: {},
                                dst: {},
                                who: {},
                                duration: {},
                                answerStatus: {},
                                callType: {},
                                file: {}
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });              
            };     
            this.el.find('#inner-user-history-call-list').kendoGrid({
                columns: [{
                    field: 'recId',
                    title: '№',
                    width: '40px'
                },{
                    field: 'time',    
                    title: 'Время'
                },{ 
                    field: 'src',
                    title: 'Откуда'
                },{ 
                    field: 'dst',
                    title: 'Куда'
                },{ 
                    field: 'who',
                    title: 'Кто',
                },{ 
                    field: 'duration',
                    title: 'Длительность',
                },{ 
                    field: 'file',
                    title: 'Запись',
                    templat: function(row) {
                        return row.file;
                    }
                }],                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },                
                editable: false
            });              
        }        
    };
    return public;
});