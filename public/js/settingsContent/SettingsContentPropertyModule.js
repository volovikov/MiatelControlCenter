/**
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} propertyGeneral
 * @returns {SettingsContentPropertyModule_L12.public}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/settingsContent.js',
    'text!./templates/settings-property-general.html',
    'css!./css/settingsContent'
], function($, k, u, common, local, propertyGeneral) {
    
    var propertyGeneralTmpl = k.template(propertyGeneral);
    
    var public = {        
        myModuleName: 'SettingsContentPropertyModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSubmitBtn: function(btn) {
            var that = this,
                form = $('#property-form');
            
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=set-property-general&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: u.getFormValue(form),
                success: function(resp) {
                    try {
                        var r = JSON.parse(resp);

                        if (r.success) {                           
                            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        } else {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                        }                                        
                    } catch(e) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }
                }
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
            $(document).off('click', '#property-general-form-submit-btn').on('click', '#property-general-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });          
        },
        render: function() {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-property-general&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {                           
                        var html = propertyGeneralTmpl({
                            i18n: that.i18n,
                            data: r.data
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
                    } else {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }                                        
                }
            });
        }
    };
    return public;
});