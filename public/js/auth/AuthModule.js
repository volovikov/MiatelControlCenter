/**
 * AuthModule
 * 
 * @param {type} $
 * @param {type} kendo
 * @param {type} util
 * @returns {AuthModule_L8.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/auth.js',
    'text!./templates/main-page.html',
    'text!./templates/auth-main-form.html',
    'text!./templates/auth-remind-form.html',
    'css!./css/auth'
], function($, k, u, common, local, mainPage, loginForm, remindForm) {

    var mainPageTmpl = k.template(mainPage),
        loginFormTmpl = k.template(loginForm),
        remindFormTmpl = k.template(remindForm);

    var public = {
        run: function() {            
            this.i18n = $.extend(common, local);
            this.el = $('#main-page');            
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickLoginBtn: function() {
            var that = this, 
                validator = $('#main-auth-form').kendoValidator().data('kendoValidator');

            if (validator.validate()) {
                var login = $('#login').val(),
                    password = $('#password').val(),
                    data = {
                        login: login,
                        password: password                    
                    };

                u.ajaxRequest('login', data, function(err, r) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.authForm.badPassword);
                    } else {   
                        location.reload();
                    }
                });
            }
        },
        onClickRemindBtn: function() {
            var that = this, 
                validator = $('#privateroom-remind-form').kendoValidator().data('kendoValidator');

            if (validator.validate()) {
                var login = $('#login').val(),
                    email = $('#email').val(),
                    data = {
                        login: login,
                        email: email
                    };

                u.ajaxRequest('user/remind', data, function(err, r) {
                    if (err) {
                        that.status.text(that.i18n.authForm.badLoginEmail)
                            .removeClass("valid")
                            .addClass("invalid");
                    } else {
                        private.renderLoginForm.call(that);
                        app.showPopupMsg('good', that.i18n.authForm.congr, that.i18n.authForm.passwordIsSend);
                    }
                });
            }            
        },
        onClickCancelBtn: function() {
            $('.k-textbox').val('');
        },
        onClickRemindPaswdLink: function() {
            private.renderRemindPasswdForm.call(this);
        },
        onClickGoBackLink: function() {        
            private.renderLoginForm.call(this);
        }
    };
    var private = {        
        bindEvents: function() {
            var that = this;

            $(document).on('click', '#login-btn', function() {
                that.onClickLoginBtn.call(that);
            });
            $(document).on('click', '#cancel-btn', function() {
                that.onClickCancelBtn.call(that);
            });            
            $(document).on('click', '#remind-btn', function() {
                that.onClickRemindBtn.call(that);
            });
            $(document).on('click', '#remind-password-link', function() {
                that.onClickRemindPaswdLink.call(that);
            });
            $(document).on('click', '#go-back-link', function() {
                that.onClickGoBackLink.call(that);
            });            
        },
        render: function() {
            var html = mainPageTmpl({
                i18n: this.i18n,
                content: loginFormTmpl({ 
                    i18n: this.i18n
                })
            });
            this.el.html(html);            
        },
        renderLoginForm: function() {
            var html = loginFormTmpl({
                i18n: this.i18n
            });
            this.el.html(html);  
        },
        renderRemindPasswdForm: function() {
            var html = remindFormTmpl({
                i18n: this.i18n
            });
            this.el.html(html);
        }
    };
    return public;
});