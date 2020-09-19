define([
    'jquery',
    'kendo',
    'util',
    'i18n!../../js/common/nls/main.js',
    'i18n!./nls/wholesaleContent.js',
    'text!./templates/wholesale-crm-task-contract-download.html',
    'css!./css/wholesaleContent'
], function ($, k, u, common, local, template) {

    var templateTmpl = k.template(template);

    var public = {
        myModuleName: 'WholesaleCrmTasksContractDownload',
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
            $(document).off('click', '#contract-submit-btn').on('click', '#contract-submit-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this), 1);
            });
            $(document).off('click', '#contract-cancel-btn').on('click', '#contract-cancel-btn', function(e) {
                e.preventDefault();
                that.onClickSubmitBtn.call(that, $(this), -1);
            });
        },
        render: function(){
            var downloadContract = function() {
                var url = app.wholesaleServerUrl + 'crm.php?method=get_contract';
                console.log(this.taskId);
                var params = {
                    userHash: app.getActiveUserHash(),
                    groupId: row.groupId,
                    taskId: row.taskId,
                    recordId: row.recordId,
                    fileId: interceptedFile.fileId
                };
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    if (this.status === 200) {
                        var filename = "";
                        var disposition = xhr.getResponseHeader('Content-Disposition');
                        if (disposition && disposition.indexOf('attachment') !== -1) {
                            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(disposition);
                            if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                        }
                        var type = xhr.getResponseHeader('Content-Type');

                        var blob = new Blob([this.response], { type: type });
                        if (typeof window.navigator.msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                            window.navigator.msSaveBlob(blob, filename);
                        } else {
                            var URL = window.URL || window.webkitURL;
                            var downloadUrl = URL.createObjectURL(blob);

                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                var a = document.createElement("a");
                                // safari doesn't support this yet
                                if (typeof a.download === 'undefined') {
                                    window.location = downloadUrl;
                                } else {
                                    a.href = downloadUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                }
                            } else {
                                window.location = downloadUrl;
                            }

                            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                        }
                    }
                };
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.send($.param(params));
            };
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
