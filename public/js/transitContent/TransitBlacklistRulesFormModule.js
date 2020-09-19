define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-blacklist-rules-form.html',
    'css!./css/transitContent'
], function($, k, u, common, local, template) {
    
    var templateTmpl = k.template(template);
    
    var public = {        
        myModuleName: 'TransitBlacklistRulesFormModule',
        gridPageSize: 20,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.nameFilter = this.treeId.split('-')[1];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSubmitBtn: function(btn) {
            var that = this;
            $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=set-rules',
                type: 'post',
                data: $('#blacklist-rules-form').serialize(),
                success: function(resp) {
                    var r = JSON.parse(resp);
                    if (r.success) {                           
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                    } else {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    }                                        
                }
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            $(document).off('click', '#blacklist-rules-form-submit-btn').on('click', '#blacklist-rules-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });          
        },
        render: function() {
            var that = this;
            $.ajax({
                url: app.transitServerUrl + 'blacklist.php?method=get-rules',
                type: 'post',
                data: {
                    nameFilter: that.nameFilter
                },
                success: function(resp) {
                    var r = JSON.parse(resp);
                    if (r.success) {       
                        var html = templateTmpl({
                            i18n: that.i18n,
                            data: $.extend(r.data, {         
                            })
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
                        that.el.find('#active').kendoDropDownList({
                            autoBind: true,
                            value: r.data.active,
                            dataSource: [{
                                    value: 'yes'
                                },{
                                    value: 'no'
                                }]
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