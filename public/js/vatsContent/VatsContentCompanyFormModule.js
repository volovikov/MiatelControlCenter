define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-company-form.html'
], function($, k, u, common, local, vatsCompanyForm) {
    
    var vatsCompanyFormTmpl = k.template(vatsCompanyForm);
    
    var public = {
        myModuleName: 'VatsContentCompanyFormModule',
        companyInfo: null,
        validator: null,
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }             
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickSaveBtn: function() {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    id: that.treeId
                });
       
            private.updateCompany.call(this, data, function() {
                that.companyInfo = data;
                app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                app.publish('update-company', data);                                    
            });
        },
        onClickDeleteBtn: function() {
            var that = this,
                clientPhoneList = this.companyInfo.phoneList,
                clientGlobalId = this.userGlobalId,
                clientPhone = this.companyInfo.ownerPhone;
            
            var delCompany = function(callback) {
                private.delCompany.call(that, clientGlobalId, function(err, resp) {
                    if (!err) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.vatsContent.deleteComplete);
                        app.publish('del-company', that.companyInfo.id);                        
                        callback && callback();
                    } else {
                        app.showPopupErrors(resp);                        
                    }                    
                });                
            };           
            var addComment = function(clientId, clientName, callback) {
                var user = app.getActiveUser();
                
                var msg = 'Компания была удалена ' + user.name + ' ' + u.getCurrentDate() + ' числа\n' +
                        'Компания владела следующими номерами: ' + clientPhoneList;
                
                var data = {
                    clientId: clientId,
                    clientSubject: clientName,
                    commentAuthorId: 31, //<-- robot Id
                    commentAuthorName: 'robot',
                    commentDate: u.getCurrentDate(),
                    comment: msg,
                    userHash: app.getActiveUserHash() // userHash:89485493
                };
                u.ajaxRequest('client/add-client-comment', data, function(err, resp) {
                    if (err) {
                        app.showPopupErrors(resp);
                    } else {
                        callback && callback();
                    }
                });
            };
            var setClientDisabled = function(clientId, callback) {
                var data = {
                    id: clientId,
                    clientStatus: 'disable',
                    userHash: app.getActiveUserHash()
                };
                u.ajaxRequest('client/update-client', data, function(err, resp) {
                    if (!err) {
                        callback && callback();
                    } else {
                        app.showPopupErrors(resp);
                    }
                    app.publish('preloader-hide');
                });
            };
            if (confirm(this.i18n.confirmDel)) {
                app.publish('preloader-show');
                
                private.getClientDetail.call(that, clientPhone, function(resp) {
                    if (resp.success) {
                        var client = resp.data;
                        
                        if (confirm(that.i18n.confirmClientDel)) {
                            delCompany(function() {
                                addComment(client.id, client.subject, function() {
                                    setClientDisabled(client.id, function() {
                                        app.publish('preloader-hide');
                                        app.goto('section/vats/tree/clients/client/' + client.id);                                        
                                    });
                                });
                            });
                        } else {
                            app.publish('preloader-hide');
                        }
                    } else {
                        delCompany(function() {
                            app.publish('preloader-hide');
                            app.goto('section/vats/tree/company/company/0'); 
                        });
                    }
                });
            }
        },
        onClickContractSignBtn: function(btn) {
            var that = this,
                formEl = this.el.find('form'),
                formValue = u.getFormValue(formEl),
                data = $.extend(formValue, {
                    userHash: app.getActiveUserHash(),
                    companyId: that.treeId
                });
                
            app.publish('preloader-show');    
            
            private.createPartner.call(that, function(partner) {
                private.createPartnerContract.call(that, partner.partnerId, function(contractNumber) {
                    private.createCompanyBills.call(that, partner.partnerId, function() {
                        data = $.extend(data, {
                            partnerId: partner.partnerId, 
                            contractStatus: 'signed', 
                            contractNumber: contractNumber
                        });
                        private.updateCompany.call(that, data, function() {                            
                            private.setContractSign.call(that, partner.partnerId, function() {
                                private.removeContractSignBtn.call(that);
                                private.notifyContractSignMsg.call(that);
                                app.publish('update-company', $.extend(data, {
                                    contractStatus: 'signed'
                                }));
                                app.publish('preloader-hide');
                            });                                                                   
                        });
                    });
                });
            });
        },
        onClickReplacePassportFileBtn: function(fileField) {
            var that = this,
                uploadUrl = app.voiceipServerUrl + 'private.php?method=upload-passport&mccRootPassword=' + app.getMccRootPassword() +'&userGlobalId=' + this.companyInfo.userGlobalId,
                validFormat = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png'
                ];

            private.ajaxFileUpload.call(this, validFormat, uploadUrl, fileField, function(resp) {
                var passportFileKey = $(fileField).attr('data-key'),
                    gridRowUid = $(fileField).attr('data-uid'),
                    formEl = that.el.find('form'),
                    formValue = u.getFormValue(formEl),
                    data = $.extend(formValue, {
                        userHash: app.getActiveUserHash(),
                        id: that.treeId
                    });

                data[passportFileKey] = resp.fname;
                
                u.ajaxRequest('update-company', data, function(err) {
                    if (err) {
                        app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                    } else {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);                        
                        app.publish('update-company', data);
                        var fileName = data[passportFileKey];
                        that.companyInfo[passportFileKey] = fileName;                        
                        var td = $('#ownerPassportFiles').find('[data-uid="' + gridRowUid + '"] a').parent();
                        td.html('<a target="_blank" href="' + app.voiceipServerUrl + 'private.php?method=get-passport-content&mccRootPassword=' + app.getMccRootPassword() +'&userGlobalId=' + that.companyInfo.userGlobalId +'&content='+ fileName + '">' + fileName + '</a>');                        
                    }
                });
            });
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;

           $(document).off('click', '.user-form-submit-btn').on('click', '.user-form-submit-btn', function(e) {
               e.preventDefault();
               that.onClickSaveBtn.call(that);
           });
           $(document).off('click', '.user-form-del-btn').on('click', '.user-form-del-btn', function(e) {
               e.preventDefault();
               that.onClickDeleteBtn.call(that);
           });
           $(document).off('click', '.contract-sign-btn').on('click', '.contract-sign-btn', function(e) {
               e.preventDefault();
               that.onClickContractSignBtn.call(that, $(e));
            });
            $(document).off('click', '.audio-control .play-stop').on('click', '.audio-control .play-stop', function() {
                that.onClickStopPlayBtn.call(that, $(this));
            });
            $(document).off('change', '#ownerPassportFiles input[name="files"]').on('change', '#ownerPassportFiles input[name="files"]', function() {
                that.onClickReplacePassportFileBtn.call(that, $(this));
            });            
        },
        render: function() {
            var that = this;
            
            if (!this.el) {
                return;
            } else if (!this.companyInfo) {
                return;
            }
            this.userGlobalId = this.companyInfo.userGlobalId;

            this.el.html(vatsCompanyFormTmpl({
                i18n: this.i18n,
                user: this.companyInfo
            }));
            this.el.find('.combobox').kendoComboBox();
            this.tabStrip = this.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            });  
            this.validator = this.el.find('form').kendoValidator({
                rules: {
                    myRule: function(input) {
                        return private.isCompanyFormValid.call(this, input);
                    }
                }
            }).data("kendoValidator");                    

            private.getUserBalance.call(this, function(balance) {
                that.el.find('input[name="balance"]').val(balance);
            });
            private.renderOwnerPassportFilesTable.call(this, this.companyInfo, {
                companyPassportFileUrl1: this.companyInfo.companyPassportFileUrl1, 
                companyPassportFileUrl2: this.companyInfo.companyPassportFileUrl2
            });        
        },
        renderOwnerPassportFilesTable: function(company, filesRec) {
            this.passportFileGrid = this.el.find('#ownerPassportFiles').kendoGrid({
                columns: [{
                    field: 'name',
                    title: 'Имя',                    
                    template: function(row) {
                        return '<a target="_blank" href="' + app.voiceipServerUrl + 'private.php?method=get-passport-content&mccRootPassword=' + app.getMccRootPassword() +'&userGlobalId=' + company.userGlobalId +'&content='+ row.name + '">' + row.name+ '</a>';
                    }
                },{
                    width: 94,    
                    template: function(row) {
                        return '<button class="k-button k-upload-button pasport-file-replace-btn"><input data-uid="' + row.uid + '" data-key="' + row.key +'" name="files" id="files" type="file" data-role="upload" multiple="multiple" autocomplete="off"><span>Заменить</span></button>';
                    }                    
                }],
                dataSource: [{
                    name: filesRec.companyPassportFileUrl1,
                    key: 'companyPassportFileUrl1'
                },{
                    name: filesRec.companyPassportFileUrl2,
                    key: 'companyPassportFileUrl2'
                }],
                editable: false
            }).data('kendoGrid');
        },
        isCompanyFormValid: function(input) {
            var tab = $('#user-form-tabstrip').find('.k-state-active'),
                control = tab.attr('aria-controls');
            
            if (control != 'user-form-tabstrip-3') {
                return true;
            } else if (input.is("[name=uniqFinanceId]")) {
                return input.val() == '' ? false : true;
            } else {
                return true;
            }
        },
        removeContractSignBtn: function() {
            this.el.find('.contract-sign-btn').remove();
        },
        createPartner: function(callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'proxy.php?method=create-partner&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.vatsContent.createPartnerFine);
                        callback && callback(r.data);
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });            
        },
        createPartnerContract: function(partnerId, callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'proxy.php?method=create-partner-contract&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId,
                    partnerId: partnerId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.vatsContent.createPartnerContractFine);
                        callback && callback(r.data.contractNumber); //<-- return only contract number
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });             
        },
        createCompanyBills: function(partnerId, callback) {
            var that = this;
            
            $.ajax({
                url: app.voiceipServerUrl + 'bills.php?method=create-company-bills-auto&mccRootPassword=' + app.getMccRootPassword(),
                data: {
                    userGlobalId: that.userGlobalId,
                    partnerId: partnerId
                },
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (r.success) {
                        app.showPopupMsg('good', that.i18n.info.title, that.i18n.vatsContent.billsMakeFine);
                        setTimeout(function() {
                            callback && callback();
                        }, 5);                        
                    } else {
                        app.showPopupErrors(r.errors);
                    }                                        
                }
            });             
        },
        updateCompany: function(info, callback) {
            var that = this;

            u.ajaxRequest('update-company', info, function(err) {
                if (!err) {
                    that.companyInfo = info;

                    setTimeout(function() {
                        callback && callback();
                    }, 5);
                } else {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });
        },
        notifyContractSignMsg: function() {
            var that = this,
                user = app.getActiveUser(),
                data = {
                    messageType: 'info',
                    messageAuthorId: app.mccUserRobotId,
                    messageDate: u.getCurrentDateTime(),
                    messageTarget: [{
                        id: this.companyInfo.id,
                        companyName: this.companyInfo.companyName
                    }],
                    messageShort: app.contratSignFineMsgShort,
                    messageFull: app.contractSignFineMsg,
                };

            $.ajax({
                url: app.voiceipServerUrl + 'messages.php?method=add-message&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                type: 'post',
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (!r.success) {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        },
        setContractSign: function(partnerId, callback) {
            var that = this,
                formEl = this.el.find('form'),
                data = {
                    partnerId: partnerId,
                    userGlobalId: this.userGlobalId,
                    contractNumber: this.companyInfo.contractNumber,
                    signed: 1
                };
            
            $.ajax({
                url: app.voiceipServerUrl + 'documents.php?method=update-contract&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                type: 'post',
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        that.el.find('select[name="contractStatus"]').data('kendoComboBox').value('Подписан');
                        
                        setTimeout(function() {
                            callback && callback();
                        }, 5);
                    } else {
                        app.showPopupErrors(r.errors);
                    }
                }
            });
        },
        getUserBalance: function(callback) {
            var data = {
                userGlobalId: this.companyInfo.userGlobalId
            };
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-balance&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        callback && callback(r.data.balance);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            });
        },
        ajaxFileUpload: function(validFormatArr, uploadUrl, fileField, callback) {
            var that = this,
                file = fileField[0].files[0],
                data = new FormData();

            var showProgress = function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = (evt.loaded / evt.total) * 100;
                    private.drawUploadProgressBar.call(that, percentComplete, fileField);
                }
            };
            var isFileFormatValid = function(file) {
                if (validFormatArr.indexOf(file.type) == -1) {
                    return false;
                } else {
                    return true;
                }
            };
            if (!isFileFormatValid(file)) {
                app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err['-1']);
                return;
            }
            data.append('file', file);

            $.ajax({
                url: uploadUrl,
                data: data,
                processData: false,
                contentType: false,
                cache: false,
                dataTyle: 'script',
                complete: function(xhr) {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            var resp = JSON.parse(xhr.responseText),
                                el;

                            if (resp.succes || resp.fname) {
                                callback && callback(resp);
                            } else {
                                app.showPopupErrors(resp.errors);
                            }
                        } else {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                        }
                    }
                },
                xhr: function() {
                    var myXhr = $.ajaxSettings.xhr();

                    if (myXhr.upload){
                        //myXhr.upload.addEventListener('progress', showProgress, false);
                        
                    } else {
                        // Uploadress is not supported!
                    }
                    return myXhr;
                }
            });

        },        
        getClientDetail: function(clientPhone, callback) {
            if (!clientPhone) {
                callback && callback(false); //<-- отвечаю false, client не найдет
            }
            var data = {
                clientPhone: clientPhone
            };
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-client&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);                                        
                    callback && callback(r);
                }
            });
        },
        delCompany: function(clientGlobalId, callback) {
            if (!clientGlobalId) {
                callback && callback(false);
            }
            var data = {
                userGlobalId: clientGlobalId
            };
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=del-company&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);

                    callback && callback(!r.success); //<-- false - ошибки нет
                }
            });            
        }
    };
    return public;
});