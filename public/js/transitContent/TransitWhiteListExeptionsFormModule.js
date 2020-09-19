define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/transitContent.js',
    'text!./templates/transit-whitelist-exceptions-form.html',
    'css!./css/transitContent'
], function($, k, u, common, local, exceptionClientForm) {
    
    var exceptionClientFormTmpl = k.template(exceptionClientForm);
    
    var public = {        
        myModuleName: 'TransitWhiteListExeptionsFormModule',
        gridPageSize: 20,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.id = this.treeId.split('-')[1];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSubmitBtn: function(btn) {
            var that = this,
                form = $('#exception-property-form'),                
                clientName = form.find('#clientId').data('kendoDropDownList').text(),
                data = $.extend(u.getFormValue(form), {
                    clientName: clientName
                });
                
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=update-white-client-property',
                type: 'post',
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {                           
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        app.publish('update-whitelist-client', data);
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
            $(document).off('click', '#exception-client-form-submit-btn').on('click', '#exception-client-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });          
        },
        render: function() {
            var that = this;
            $.ajax({
                url: app.transitServerUrl + 'whitelist.php?method=get-white-client-property',
                type: 'post',
                data: {
                    id: that.id
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {       
                        var html = exceptionClientFormTmpl({
                            i18n: that.i18n,
                            data: $.extend(r.data, {
                                id: that.id
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
                        that.el.find('#clientId').kendoDropDownList({
                            autoBind: true,    
                            value: r.data.clientId,
                            dataSource: {
                                transport: {
                                    read: function(options) {
                                        $.ajax({
                                            url: app.transitServerUrl + 'whitelist.php?method=get-client-list',
                                            type: 'post',
                                            success: function(resp) {
                                                try {
                                                    var r = JSON.parse(resp);

                                                    if (r.success) {
                                                        options.success(r.data.list);
                                                    }                                                    
                                                } catch(e) {
                                                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                                }
                                            }
                                        }); 
                                    }
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