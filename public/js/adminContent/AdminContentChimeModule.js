/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} adminChimeForm
 * @returns {AdminContentChimeModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/adminContent.js',
    'text!./templates/admin-chime-form.html',
    'css!./css/adminContent'
], function($, k, u, common, local, adminChimeForm) {
    
    var adminChimeFormTmpl = k.template(adminChimeForm);
    
    var public = {        
        myModuleName: 'AdminContentChimeModule',
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }     
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this);             
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

          
        },
        render: function() {
            var that = this,
                wwwServerUrl = app.wwwServerUrl.replace('/api', ''),
                data = {
                    id: this.treeId,
                    userHash: app.getActiveUserHash()
                };

            u.ajaxRequest('get-company', data, function(err, data) {
                if (err) {
                    app.showPopupErrors(data);
                } else {
                    var html = adminChimeFormTmpl({
                        i18n: that.i18n,
                        companyId: that.treeId,
                        password: app.getMccRootPassword(),
                        login: data.ownerPhone,
                        wwwServerUrl: wwwServerUrl
                    });
                    that.el.html(html); 
                    that.el.find('.combobox').kendoComboBox();
                    that.el.find('.tabstrip').kendoTabStrip({
                        animation:  {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });                    
                }
            });
        }
    };
    return public;
});