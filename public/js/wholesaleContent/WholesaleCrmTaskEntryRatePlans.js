define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-task-entries-rate.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmTaskEntryRatePlans',
        run: function(params) {
            var tmp = params.treeId.split('-');// <-- treeId = 0-3
            this.el = params.el;
            this.taskId = tmp[3];
            this.taskState = tmp[2];

            this.i18n = $.extend(common, local);
            private.render.call(this);
            private.bindEvents.call(this);
        },
        onClickSubmitBtn: function(btn, level) {
            var that = this;

            $.ajax({
                url: app.wholesaleServerUrl+'crm_task.php?method=update_task',
                type:'post',
                data: {
                    taskId: this.taskId,
                    nextLevel: level
                },
                success: function(resp){
                    var r=JSON.parse(resp);
                    if(r.success){
                        app.showPopupMsg('good',that.i18n.info.title,that.i18n.info.saveComplete);
                        window.location.href = "#section/wholesale/tree/wholesale-crm/wholesale-crm/8";
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
            $(document).off('click', '#entries-submit-btn').on('click', '#entries-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this), 1);
            });
            $(document).off('click', '#entries-cancel-btn').on('click', '#entries-cancel-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this), -1);
            });
        },
        render: function(){
            var that=this;
            var html=templateTmpl({
                i18n:that.i18n
            });
            that.el.html(html);

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
