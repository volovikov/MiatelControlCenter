define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-property-atc-chime.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, atcChime) {
    
    var atcChimeTmpl = k.template(atcChime);
    
    var public = {
        myModuleName: 'VatsContentAtcChimeModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            this.chimeId = this.treeId && this.treeId.split('-')[1];
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSubmitBtn: function(btn) {
            var that = this,
                form = $('#atc-chime-form');
            
            if (this.validator.validate()) {
                $.ajax({
                    url: app.voiceipServerUrl + 'private.php?method=update-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                    type: 'post',
                    data: $.extend(u.getFormValue(form), {
                        id: that.chimeId
                    }),
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
        },
        onClickDeleteBtn: function(btn) {
            var that = this;
            
            if (confirm(this.i18n.confirmDel)) {                
                $.ajax({
                    url: app.voiceipServerUrl + 'private.php?method=del-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                    type: 'post',
                    data: {
                        chimeId: that.chimeId
                    },
                    success: function(resp) {
                        var r = JSON.parse(resp);

                        if (r.success) {                           
                            app.publish('del-atc-chime', that.chimeId);
                            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        } else {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                        }
                    }
                });                
            }            
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
            $(document).off('click', '#atc-chime-form-submit-btn').on('click', '#atc-chime-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });  
            $(document).off('click', '#atc-chime-form-delete-btn').on('click', '#atc-chime-form-delete-btn', function(e) {
                e.preventDefault();
                that.onClickDeleteBtn.call(that, $(this));
            });              
        },
        render: function() {
            var that = this;

            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: {
                    chimeId: that.chimeId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        if (r.data.chimeComment == null) {
                            r.data.chimeComment = '';
                        }
                        var html = atcChimeTmpl({
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
                        that.el.find('input[name="chimeFilePreview"]').kendoUpload({
                            async: {
                                widthCredentiald: true,
                                saveUrl: app.wwwServerUrl + "public.php?method=upload-image&mccRootPassword=" + app.getMccRootPassword(),
                                autoUpload: true
                            },
                            success: function(e) {
                                var resp = e.response;

                                if (resp.success) {
                                    private.setNewPreviewChime.call(that, resp.file);
                                } else {
                                    app.showPopupErrors(resp.errors);
                                }
                            }
                        });                         
                        that.el.find('input[name="chimeColorFile"]').kendoUpload({
                            async: {
                                widthCredentiald: true,
                                saveUrl: app.wwwServerUrl + "public.php?method=upload-image&mccRootPassword=" + app.getMccRootPassword(),
                                autoUpload: true
                            },
                            success: function(e) {
                                var resp = e.response;

                                if (resp.success) {
                                    private.setNewColorChime.call(that, resp.file);
                                } else {
                                    app.showPopupErrors(resp.errors);
                                }
                            }
                        });   
                        that.el.find('input[name="chimeBwFile"]').kendoUpload({
                            async: {
                                widthCredentiald: true,
                                saveUrl: app.wwwServerUrl + "public.php?method=upload-image&mccRootPassword=" + app.getMccRootPassword(),
                                autoUpload: true
                            },
                            success: function(e) {
                                var resp = e.response;

                                if (resp.success) {
                                    private.setNewBwChime.call(that, resp.file);
                                } else {
                                    app.showPopupErrors(resp.errors);
                                }
                            }
                        });                        
                        that.el.find('.number').kendoNumericTextBox();
                        that.validator = that.el.find('form').kendoValidator().data("kendoValidator");                    
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });
        },
        setNewColorChime: function(url) {
            if (url) {
                $('#chimeColorFileUrl').val(url);
                $('#vats-property-atc-chime-color-img').html('<img src="' + url + '">');                
            }                       
        },
        setNewBwChime: function(url) {
            if (url) {
                $('#chimeBwFileUrl').val(url);
                $('#vats-property-atc-chime-bw-img').html('<img src="' + url + '">');                
            }           
        },
        setNewPreviewChime: function(url) {
            if (url) {
                $('#chimeFilePreviewUrl').val(url);
                $('#chimeFilePreviewImg').html('<img src="' + url + '">');                
            }                                    
        }
    };
    return public;
});