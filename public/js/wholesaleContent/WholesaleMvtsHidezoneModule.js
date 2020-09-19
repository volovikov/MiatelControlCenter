define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-mvts-hidezone-form.html',
    'css!./css/wholesaleContent'
], function($, k, u, common, local, mvtsHidezoneForm) {

    var mvtsHidezoneFormTmpl = k.template(mvtsHidezoneForm);

    var public = {        
        myModuleName: 'WholesaleMvtsHidezoneModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
            console.log("add");
        },
        onClickSubmitBtn: function(btn) {
            var that = this;
            $.ajax({
              url: app.transitServerUrl+'mvts.php?method=set-hidezone',
              type:'post',
              data:$('#wholesale-mvts-hidezone-form').serialize(),
              success: function(resp){
                var r=JSON.parse(resp);
                if(r.success){
                  app.showPopupMsg('good',that.i18n.info.title,that.i18n.info.saveComplete);
                }else{
                  app.showPopupMsg('bad',that.i18n.info.title,that.i18n.err.crytical);
                }
              }
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            $(document).off('click', '#mvts-hidezone-form-submit-btn').on('click', '#mvts-hidezone-form-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this));
            });
        },
        render: function(){
          var that=this;
          var html=mvtsHidezoneFormTmpl({
            i18n:that.i18n
          });
          that.el.html(html);
          that.el.find('.combobox').kendoComboBox();
          that.el.find('.tabstrip').kendoTabStrip({
            animation:{
              open:{
                effects: "fadeIn"
              }
            }
          });
        }
    };
    return public;
});



