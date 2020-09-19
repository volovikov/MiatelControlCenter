define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelContent.js',    
    'text!./templates/miatel-member-form.html',
    'css!./css/miatelContent'
], function($, k, u, common, local, memberForm) {
    
    var memberFormTmpl = k.template(memberForm);
    
    var public = {
        myModuleName: 'MiatelContentMemberForm',
        memberInfo: null,
        run: function(params) {
            var tmp = params.treeId.split('-');// <-- treeId = 0-3
            
            this.el = params.el;
            this.memberId = tmp[1]; 
            this.departmentId = tmp[0];
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);            
        },
        onClickSubmitBtn: function(el) {
            var that = this,
                form = $('#member-property'),
                value = $.extend(u.getFormValue(form), {
                    userHash: app.getActiveUserHash()
                });
                
            u.ajaxRequest('member/update-member', value, function(err, resp) {
                if (!err) {
                    app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    that.memberInfo = value;
                    
                    if (that.departmentId == value.departmentId) {
                        app.publish('update-member', value);
                    } else {
                        app.publish('del-member', {
                            id: value.id,
                            departmentId: that.departmentId //<-- old value
                        });
                        app.publish('add-member', value);
                    }
                } else {
                    app.showPopupErrors(resp);
                }
            });
        },
        onClickDeleteBtn: function(btn) {
            var that = this,
            data = {
                id: this.memberId,
                userHash: app.getActiveUserHash()
            };
            
            if (confirm(this.i18n.confirmDel)) {
                u.ajaxRequest('member/del-member', data, function(err, resp) {
                    if (!err) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);     
                        app.publish('del-member', {
                            id: that.memberId,
                            departmentId: that.departmentId
                        });                    
                    } else {
                        app.showPopupErrors(resp);
                    }
                });               
            }
        },
        onClickRefreshPartnerCodeBtn: function(btn) {
            var field = $('#partnerCode'),
                partnerCode = this.memberInfo.partnerCode,
                role = this.memberInfo.role;
        
            if (field) {
                if (private.isMemberHasPartnerRole(role) && partnerCode != '') {
                    return;
                } else {
                    field.val(private.getNewPartnerCode());
                }
            }
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '#member-form-submit-btn').on('click', '#member-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });
            $(document).off('click', '#member-form-del-btn').on('click', '#member-form-del-btn', function(e) {
               e.preventDefault();
               that.onClickDeleteBtn.call(that, $(this));
            });
            $(document).off('click', '#parnerCodeRefreshBtn').on('click', '#parnerCodeRefreshBtn', function(e) {
                e.preventDefault();
                that.onClickRefreshPartnerCodeBtn.call(that, $(this));
            });
        },       
        render: function() {
            var that = this,
                data = {
                    id: this.memberId,
                    userHash: app.getActiveUserHash()
                };
                
            u.ajaxRequest('member/get-member', data, function(err, data) {
                if (!err) {
                    var html = memberFormTmpl({
                        i18n: that.i18n,
                        member: data
                    });
                    that.memberInfo = data;
                    that.el.html(html); 
                    that.el.find('.combobox').kendoComboBox();
                    that.el.find('.select').kendoDropDownList();
                    that.el.find('.multiselect').kendoMultiSelect({
                        autoBind: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'member/get-role-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {
                                                var arr = [];

                                                for (var i in resp.data.list) {
                                                    arr.push(resp.data.list[i].text);
                                                }
                                                options.success(arr);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        },
                        dataBound: function(e) {
                            this.value(data.role.split(','))
                        }
                    });
                    that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }       
                        }
                    });
                    var ms = that.el.find('.section-access').kendoMultiSelect({
                        autoBind: true,
                        multiple: true,                        
                        dataTextField: 'name',
                        dataValueField: 'id',                        
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'get-mcc-section-tree',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {
                                                options.success(resp.data.list);
                                                ms.value(eval(data.sectionAccessCode));
                                            }                                                    
                                        }
                                    }); 
                                }
                            },
                            group: {field: 'section'},
                        }                         
                    }).data('kendoMultiSelect');
                    
                    var dd = that.el.find('.department').kendoDropDownList({
                        autoBind: true,
                        dataTextField: 'name',
                        dataValueField: 'id',
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.getServerApiUrl() + 'member/get-department-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(resp) {
                                            if (resp.success) {
                                                options.success(resp.data.list);
                                                dd.value(data.departmentId)
                                            } else {
                                                app.showPopupErrors(resp.data.errors);
                                            }                                                   
                                        }
                                    }); 
                                }
                            }
                        }                        
                    }).data('kendoDropDownList');
                    
                    that.el.find('.datepicker').kendoDatePicker({
                        format: app.getDateFormat()
                    });                    
                } else {
                    app.showPopupErrors(data);
                }
            });
        },
        isMemberHasPartnerRole: function(memberRoleStr) {
            if (!memberRoleStr) {
                return false;
            } else if (memberRoleStr.indexOf('Партнер') !== -1) {
                return true;
            }
        },
        getNewPartnerCode: function() {
            var code = "",
                charLimit = 10,    
                possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i=0; i<charLimit; i++ ) {
                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return code;
        }
    };
    return public;
});