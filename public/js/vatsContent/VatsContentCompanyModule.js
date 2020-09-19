define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-company.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsCompany) {
    
    var vatsCompanyTmpl = k.template(vatsCompany);
    
    var public = {
        myModuleName: 'VatsContentCompanyModule',
        companyInfo: null,
        run: function(params) {
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
                data = {
                    id: this.treeId,
                    userHash: app.getActiveUserHash()
                };
            
            u.ajaxRequest('get-company', data, function(err, company) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.companyInfo = company;
                    that.el.html(vatsCompanyTmpl({
                        i18n: that.i18n,
                        user: data
                    }));                    
                    private.renderCompanyForm(that.companyInfo);
                    private.renderCompanyTrafic(that.companyInfo);
                    private.renderCompanyGrid(that.companyInfo);
                }
            });        
        },
        renderCompanyForm: function(companyInfo) {
            requirejs(['js/vatsContent/VatsContentCompanyFormModule.js'], function(module) {                
                module && module.run({
                    el: $('#company-form'),
                    companyInfo: companyInfo
                });
            });
        },
        renderCompanyTrafic: function(companyInfo) {
            requirejs(['js/vatsContent/VatsContentCompanyTraficModule.js'], function(module) {
                module && module.run({
                    el: $('#company-trafic'),
                    companyInfo: companyInfo
                });
            });
        },
        renderCompanyGrid: function(companyInfo) {
            requirejs(['js/vatsContent/VatsContentCompanyGridModule.js'], function(module) {
                module && module.run({
                    el: $('#company-grid'),
                    companyInfo: companyInfo
                });
            });
        }                
    };
    return public;
});