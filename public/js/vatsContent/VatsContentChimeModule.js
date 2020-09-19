define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-chime-form.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsChimeForm) {
    
    var vatsChimeFormTmpl = k.template(vatsChimeForm);
    
    var public = {        
        myModuleName: 'VatsContentChimeModule',
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
                    var html = vatsChimeFormTmpl({
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