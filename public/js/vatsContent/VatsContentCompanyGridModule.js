define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-company-grid.html',
    'text!./templates/vats-company-audio-player.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, vatsCompanyGrid, vatsPlayer) {
    
    var vatsCompanyGridTmpl = k.template(vatsCompanyGrid),
        vatsPlayerTmpl = k.template(vatsPlayer);
    
    var public = {
        myModuleName: 'VatsContentCompanyGridModule',
        companyInfo: null,
        actionLogGrid: null,
        aonListGrid: null,
        documentListGrid: null,
        messageListGrid: null,
        passportFileGrid: null,
        innerUserListGrid: null,
        payHistoryGrid: null,
        invoiceListGrid: null,
        window: null,
        tabStrip: null,
        params: {},
        currentPlay: {
            el: null,
            id: null,
            position: null
        },
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }             
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickPausePlayBtn: function(btn) {
            var that = this,
                playCond = btn.hasClass('k-i-play'),
                el = btn.closest('.audio-control');
                src = el.attr('data-download-src'),
                recId = el.attr('data-id');
        
            var play = function() {
                private.play.call(that, el);
                btn.removeClass('k-i-play').addClass('k-i-pause');                
            };
            var pause = function() {
                private.pause.call(that, el);
                btn.removeClass('k-i-pause').addClass('k-i-play');                
            };
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId,
                    position: 0
                };
            }
            if (recId == this.currentPlay.id) {
                if (!playCond) {
                    pause();
                } else {
                    play();
                }                
            } else {
                private.pause.call(this, this.currentPlay.el);
                
                this.currentPlay = {
                    el: el,
                    id: recId,
                    position: 0
                };
                if (!playCond) {
                    pause();
                } else {
                    play();
                }
            }            
        },        
        onClickPlayBtn: function(btn) {
            var el = btn.closest('.audio-control');
                recId = el.attr('data-id');
        
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId,
                    position: 0
                };
            }
            if (recId == this.currentPlay.id) {
                private.play.call(this, el);
            } else {
                private.pause.call(this, this.currentPlay.el);
                
                this.currentPlay = {
                    el: el,
                    id: recId,
                    position: 0
                };
                private.play.call(this, el);
            }
        },
        onClickPauseBtn: function(btn) {
            var el = btn.closest('.audio-control');
                src = el.attr('data-download-src'),
                recId = el.attr('data-id');
        
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId
                };
            }
            if (recId == this.currentPlay.id) {                
                private.pause.call(this, el);
            }
        },        
        onClickStopBtn: function(btn) {
            var el = btn.closest('.audio-control');
                src = el.attr('data-download-src'),
                recId = el.attr('data-id');
        
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId
                };
            }
            if (recId == this.currentPlay.id) {                
                private.stop.call(this, el);
            }
        },                
        onClickSeekToBegin: function(btn) {
            var el = btn.closest('.audio-control');
                src = el.attr('data-download-src'),
                recId = el.attr('data-id');
        
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId
                };
            }
            if (recId == this.currentPlay.id) {                
                private.seekToBegin.call(this, el);
            }
        },
        onClickSeekToEnd: function(btn) {
            var el = btn.closest('.audio-control');
                src = el.attr('data-download-src'),
                recId = el.attr('data-id');
        
            if (!this.currentPlay.id) {
                this.currentPlay = {
                    el: el,
                    id: recId
                };
            }
            if (recId == this.currentPlay.id) {                
                private.seekToEnd.call(this, el);
            }
        },        
        onClickRequestBtn: function(btn) {
            var that = this,
                recId = btn.attr('data-rec-id'),
                data = {
                    recId: recId
                };
            
            if (!recId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-company-action-detail&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        private.showRequestProtocolDetail.call(that, r.data.request);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            });            
        },
        onClickResponseBtn: function(btn) {
            var that = this,
                recId = btn.attr('data-rec-id'),
                data = {
                    recId: recId
                };
            
            if (!recId) {
                return;
            }
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=get-company-action-detail&mccRootPassword=' + app.getMccRootPassword(),
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);
                    
                    if (r.success) {
                        private.showRequestProtocolDetail.call(that, r.data.response);
                    } else {
                        app.showPopupErrors(resp);
                    }
                }
            }); 
        },
        onClickDownloadBtn: function(btn) {
            var that = this,
                audioControlEl = btn.closest('.audio-control'),
                voiceContent = audioControlEl.attr('data-download-voice-content'),
                userGlobalId = audioControlEl.attr('data-user-global-id');

            private.transferVoiceContent.call(that, voiceContent, userGlobalId, function(voiceContentUrl) {
                if (voiceContentUrl) {
        	   var a = document.createElement('a');	
                    a.setAttribute('download', voiceContentUrl);
                    a.href = voiceContentUrl;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();                    
                }
            });
        },
        onChangeSliderValue: function(value, el) {
            var audioEl = el.closest('td').find('audio')[0],
                controlEl = el.closest('.audio-control'),
                playerId = controlEl.attr('data-id');

            audioEl.currentTime = value;
            this.currentPlay = {
                el: controlEl,
                position: value,
                id: playerId
            }
        },
    };
    var private = {
        bindEvents: function() {
            var that = this;

            $(document).off('click', '.request-detail-btn').on('click', '.request-detail-btn', function(e) {
                that.onClickRequestBtn.call(that, $(this));
            });
            $(document).off('click', '.response-detail-btn').on('click', '.response-detail-btn', function(e) {
                that.onClickResponseBtn.call(that, $(this));
            });            
            $(document).off('change', '#ownerPassportFiles input[name="files"]').on('change', '#ownerPassportFiles input[name="files"]', function() {
                that.onClickReplacePassportFileBtn.call(that, $(this));
            });            
        },
        render: function() {
            var that = this;
            
            this.el.html(vatsCompanyGridTmpl({
                i18n: that.i18n
            }));
            this.el.find('.combobox').kendoComboBox();
            this.window = this.el.find("#protocol-details")
                .kendoWindow({
                    title: "Details",
                    modal: true,
                    visible: false,
                    resizable: true,
                    width: 700,
                    maxHeight: "90vh"
                }).data("kendoWindow");
                
            this.tabStrip = that.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            }); 
            private.renderInnerUsersTable.call(that);
            private.renderAonListTable.call(that);
            private.renderBillsTable.call(that);
            private.renderHistoryCallTable.call(that);
            private.renderActionLogTable.call(that);
            private.renderMessagesTable.call(that);
            private.renderDocumentsTable.call(that);
            private.renderInvoiceTable.call(that);
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
        renderAonListTable: function() {
            var phoneNumberMaskedInput = function(container, options) {
                $('<input value="' + options.model.phone +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '99999999999' //<-- old value 7(000)9999999
                    });
            };            
            var getDataSource = function() {
                var that = this; 

                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=get-aon-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    userGlobalId: that.companyInfo.userGlobalId
                                },
                                success: function(resp) {
                                    var r;

                                    if (!resp || typeof resp == 'undefined') {
                                        options.error();
                                    } else {
                                        r = JSON.parse(resp);

                                        if (r.success) {
                                           options.success(r);
                                        } else {
                                           options.error();
                                           app.showPopupErrors(r.errors);
                                        }
                                    }
                                }
                            });
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0];

                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=del-aon&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.companyInfo.userGlobalId,
                                    number: rec.phone
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        options.success(r);
                                        app.publish('del-aon', r.data);
                                    } else {
                                        options.error();
                                        app.showPopupErrors(r.errors);
                                    }
                                }
                            }); 
                        },   
                        update: function(options) {
                            return this.create(options);
                        },
                        create: function(options) {
                            var data = $.extend(options.data.models[0], {
                                userGlobalId: that.companyInfo.userGlobalId
                            });                            
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=add-aon&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        app.publish('add-aon', r.data);                                                
                                        options.success(r);                                            
                                    } else {
                                        options.error();
                                        app.showPopupErrors(r.errors);
                                    }
                                }
                            });                                
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {
                            if (resp.success && typeof resp.data == 'undefined')  {
                                return {};
                            } else if (resp.success && typeof resp.data != 'undefined') {
                                if (typeof resp.data.list == 'undefined') {
                                    return resp.data;
                                } else {
                                    return resp.data.list;
                                }
                            }
                        },
                        model: {
                            id: "phone",
                            fields: {                                
                                phone: {},
                                type: {editable: false},
                                cityName: {editable: false},
                                countryName: {editable: false},
                           }
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                               
            };     
            this.aonListGrid = this.el.find('#aon-list').kendoGrid({
                columns: [{
                    field: 'phone',    
                    title: 'Номер',
                    editor: phoneNumberMaskedInput,
                    width: '25%'
                },{ 
                    field: 'type',
                    title: 'Тип'
                },{ 
                    field: 'countryName',
                    title: 'Страна'
                },{ 
                    field: 'cityName',
                    title: 'Город'
                },{
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            }).data('kendoGrid');           
        },
        renderInnerUsersTable: function() {
            var getDataSource = function() {
                var that = this; 

                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.getServerApiUrl() + 'get-inner-user-list',
                                type: 'post',
                                data: {
                                    userHash: app.getActiveUserHash(), 
                                    id: that.companyInfo.id,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                    } else {
                                        options.error();
                                    }
                                }
                            });
                        },
                        update: function(options)  {
                            var v = options.data.models[0];

                            v.userMobilePhone = u.getServerPhoneFormatStr(v.userMobilePhone);
                            v.userRomingNumber = u.getServerPhoneFormatStr(v.userRomingNumber);
                            v.phoneAon = u.getServerPhoneFormatStr(v.phoneAon);

                            $.ajax({
                                url: app.getServerApiUrl() + 'update-inner-user',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash()}),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('update-inner-user', resp.data);
                                    }
                                }
                            });                        
                        },
                        destroy: function(options) {
                            // BB
                            // not work!
                            
                            return;                             
                        },
                        create: function(options) {
                            var workBegin = options.data.models[0].workBegin,
                                workEnd = options.data.models[0].workEnd;

                            options.data.models[0].workBegin = u.getTimeFormatStr(workBegin);                        
                            options.data.models[0].workEnd = u.getTimeFormatStr(workEnd);

                            $.ajax({
                                url: app.getServerApiUrl() + 'add-task',
                                type: 'post',
                                data: $.extend(options.data.models[0], {userHash: app.getActiveUserHash(), parentTaskId: that.taskId}),
                                success: function(resp) {
                                    if (resp.success) {
                                        options.success(resp);
                                        app.publish('add-task', resp.data);
                                    }
                                }
                            });                        
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: { editable: false, nullable: true },
                                userFullName: {},
                                innerPhoneNumber: {},
                                userEmail: {},
                                userMobilePhone: {},
                                userRomingNumber: {},
                                phoneAon: {},
                                phoneAonList: {},
                                phoneCallUpTime: {},
                                phoneRedirect: {},
                                phoneTalkRec: {}                            
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });              
            };                    
            var redirectDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Вкл',
                            value: 'on'
                        },{
                            text: 'Выкл',
                            value: 'off'
                        }]
                    });
            };      
            var phoneTalkRecDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Вкл',
                            value: 'on'
                        },{
                            text: 'Выкл',
                            value: 'off'
                        }]
                    });
            };
            var phoneCallUpTimeDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: '5 сек',
                            value: '5'
                        },{
                            text: '10 сек',
                            value: '10'
                        },{
                            text: '30 сек',    
                            value: '30'
                        },{
                            text: '1 мин',
                            value: '60'
                        },{
                            text: '2 мин',
                            value: '120'
                        },{
                            tex: '5 мин',
                            value: '300'
                        }]
                    });
            };
            var phoneAonDropDownEditor = function(container, options) {
                var aon = options.model.phoneAon,
                    list = options.model.phoneAonList.split(','),
                    arr = [];

                for (var i in list) {
                    var p = list[i];

                    arr.push({
                        value: u.getMainPhoneFormatStr(p)
                    });
                }    
                var cb = $('<input required data-text-field="value" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: arr
                    }).data('kendoDropDownList');

                cb.value({value: aon});
            };
            var userRomingNumberMaskedInput = function(container, options) {
                $('<input value="' + options.model.userRomingNumber +'" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMaskedTextBox({
                        mask: '0(000)9999999'
                    });
            };
            
            var treeId = this.treeId;
            
            this.innerUserListGrid = this.el.find('#inner-users-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px',
                    template: function(row) {
                        return '<a href="/#section/vats/tree/innerusers/user/' + treeId + '-' + row.id + '">'  + row.id + '</a>'
                    }
                },{
                    field: 'userFullName',    
                    title: 'Имя',
                    width: '25%'
                },{ 
                    field: 'innerPhoneNumber',
                    title: 'Вн.номер'
                },{ 
                    field: 'userEmail',
                    title: 'E-mail'
                },{ 
                    field: 'userMobilePhone',
                    title: 'Моб.телефон'
                },{ 
                    field: 'userRomingNumber',
                    title: 'Номер в роуменге',
                    editor: userRomingNumberMaskedInput
                },{ 
                    field: 'phoneAon',
                    title: 'АОН' ,
                    width: '120px',
                    editor: phoneAonDropDownEditor
                },{ 
                    field: 'phoneCallUpTime',
                    title: 'Вр.дозвона',
                    editor: phoneCallUpTimeDropDownEditor
                },{ 
                    field: 'phoneRedirect',
                    title: 'Переадресация',
                    editor: redirectDropDownEditor,  
                    template: function(row) {
                        if (row.phoneRedirect == 'on') {
                            return "Включен";
                        } else if (row.phoneRedirect == 'off') {
                            return "Выключен";
                        }
                    }                                        
                },{ 
                    field: 'phoneTalkRec',
                    title: 'Запись раз-ра',
                    editor: phoneTalkRecDropDownEditor,  
                    template: function(row) {
                        if (row.phoneTalkRec == 'on') {
                            return "Включен";
                        } else if (row.phoneTalkRec == 'off') {
                            return "Выключен";
                        }
                    }                     
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                //toolbar: ["create"],
                editable: false
            }).data('kendoGrid');    
        },
        renderBillsTable: function() {
            var that = this;
            
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'bills.php?method=get-bills-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    userGlobalId: that.companyInfo.userGlobalId
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       options.error(r.errors);
                                       app.showPopupErrors(r.errors);
                                    }
                                }
                            });
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: {editable: false, nullable: true},
                                date: {},
                                accountNumber: {},
                                accountType: {},
                                totalToPay: {},
                                payStatus: {}
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });              
            };     
            this.payHistoryGrid = this.el.find('#payments-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'date',    
                    title: 'Дата'
                },{ 
                    field: 'accountNumber',
                    title: '№ счета'
                },{ 
                    field: 'accountType',
                    title: 'Тип платежа',
                    template: function(row) {
                        if (row.accountType == 'tax') {
                            return 'Счет на оплату связи';
                        } else if (row.accountType == 'phone') {
                            return 'Счет на оплату телефонного номера';
                        }
                    }
                },{ 
                    field: 'totalToPay',
                    title: 'Сумма'
                },{ 
                    field: 'payStatus',
                    title: 'Статус',
                    template: function(row) {
                        if (row.payStatus == "error") {
                            setTimeout(function() {
                                 that.payHistoryGrid.tbody.find('tr[data-uid="' + row.uid+ '"]').addClass('pay-error');
                            }, 50);
                        }
                        if (row.payStatus == 'display') {
                            return 'Выставлен';
                        } else if (row.payStatus == 'paid') {
                            return 'Оплачен';
                        } else {
                            return 'Ошибка'
                        }                        
                    }
                }],                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },                
                editable: false
            }).data('kendoGrid');               
            
        },
        renderHistoryCallTable: function() {
            var that = this,
                userGlobalId = that.companyInfo.userGlobalId;
    
            var soundPlayerTmpl = function(row) {
                if (row.duration == '0') {
                    return '';
                } else {
                    return vatsPlayerTmpl({
                        duration: row.duration,
                        recId: row.recId,
                        src: app.voiceipServerUrl + 'private.php?method=get-voice-content&content=' + row.file + '&userGlobalId=' + userGlobalId  + '&mccRootPassword=' + app.getMccRootPassword(),
                        voiceContent: row.file,
                        userGlobalId: userGlobalId 
                    });
                }
            };
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=get-calls-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    userGlobalId: userGlobalId ,
                                    callType: 'all'
                                },
                                success: function(resp) {
                                    var r;

                                    if (!resp || typeof resp == 'undefined') {
                                        options.error();
                                    } else {
                                        try {
                                            r = JSON.parse(resp);

                                            if (r.success) {
                                               options.success(r);
                                               setTimeout(function() {
                                                   app.publish('history-call-load-complete', r.data.list);
                                               }, 100);
                                            } else {
                                               options.error(r.errors);
                                               app.showPopupErrors(r.errors);
                                            }
                                        } catch(e) {
                                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                                        }
                                    }                                    
                                }
                            });
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                recId: { editable: false, nullable: true },
                                callType: {},
                                time: {},
                                src: {},
                                dst: {},
                                who: {},
                                duration: {},
                                answerStatus: {},
                                callType: {},
                                file: {}
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });              
            };     
            this.el.find('#history-call-list').kendoGrid({
                columns: [{
                    field: 'recId',
                    title: '№',
                    width: '40px'
                },{
                    field: 'callType',
                    title: 'Тип',
                    template: function(row) {
                        if (row.callType == 'in') {
                            return 'Входящий';
                        } else if (row.callType == 'out') {
                            return 'Исходящий';
                        } else if (row.callType == 'transfer') {
                            return 'Переведенный';
                        } else {
                            return 'Внутренний';
                        }
                    }
                },{
                    field: 'status',
                    title: 'Статус',
                    template: function(row) {
                        if (row.status == 'missed') {
                            return 'Пропущен';
                        } else if (row.status == 'skipped') {
                            return 'Отклонен';
                        } else if (row.status == 'answered') {
                            return 'Отвечен';
                        } else if (row.status == 'busy') {
                            return 'Занято';
                        } else { 
                            return 'Ошибка';
                        }
                    }
                },{
                    field: 'time',    
                    title: 'Время'
                },{ 
                    field: 'src',
                    title: 'Откуда'
                },{ 
                    field: 'dst',
                    title: 'Куда'
                },{ 
                    field: 'who',
                    title: 'Кто',
                    encoded: false
                },{ 
                    field: 'duration',
                    title: 'Длительность',
                },{ 
                    field: 'file',
                    title: 'Запись',
                    width: 350,
                    template: soundPlayerTmpl
                }],                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },  
                dataBound: function() {
                    private.renderAudioPlayer.call(that);                   
                },
                editable: false
            });              
        },
        renderActionLogTable: function() {
            var that = this;
   
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            if (options.data.filter && options.data.filter.filters.length) {
                                for (var i in options.data.filter.filters) {
                                    var el = options.data.filter.filters[i],
                                        type = el.type,        
                                        v = el.value;
                                
                                    if (el.field == 'date') {
                                        var tmp = u.getTimeFormatStr(v);
                                        options.data.filter.filters[i].value = tmp.split(' ')[0]; // <-- только YYYY-mm-dd
                                    }
                                }
                            }                             
                            $.ajax({
                                url: app.voiceipServerUrl + 'private.php?method=get-company-action-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.companyInfo.userGlobalId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    filter: options.data.filter,
                                    sort: sort
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        options.success(r);
                                    } else {
                                        options.error();
                                    }
                                }
                            });
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total;
                        },
                        data: function(resp) {
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: "id",
                            fields: {
                                id: { editable: false, nullable: true },
                                date: {},
                                companyId: {},
                                companyName: {},
                                request: {},
                                response: {},
                                method: {},
                                typeMethod: {},
                                ipAddress: {}
                           }
                        }                    
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),   
                    serverFiltering: true,
                    serverPaging: true,
                    serverSorting: true
                });              
            };
            this.actionLogGrid =  this.el.find('#action-log-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px',
                    filterable: false
                },{
                    field: 'date',    
                    title: 'data',
                    filterable: {
                        operators:{
                            date:{
                                en: "После или равна"
                            }
                        },
                        ui: function (element) {
                            element.kendoDatePicker({
                                format: "yyyy-MM-dd HH:mm:ss"
                            });
                        }
                    }                    
                },{
                    title: 'request',
                    template: function(row) {
                        return '<button data-rec-id="' + row.id + '" class="k-button request-detail-btn">Показать</button>'
                    },
                    width: "180px"
                },{
                    title: 'response',
                    template: function(row) {
                        return '<button data-rec-id="' + row.id + '" class="k-button response-detail-btn">Показать</button>'
                    },
                    width: "180px"
                },{
                    field: 'method',
                    title: 'method',                    
                },{
                    field: 'typeMethod',
                    title: 'typeMethod',                    
                },{
                    field: 'ipAddress',
                    title: 'ipAddress',                    
                }],                
                dataSource: getDataSource(),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    numeric: false,
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                }, 
                filterable: {
                    extra: false,
                    operators: {
                        string:{
                            like: "Начинается с",
                            eq: "Равно",
                            neq: "Не равно"
                        }
                    }
                },                
                editable: false
            }).data('kendoGrid');
        },
        renderMessagesTable: function() {
            var that = this;

            var dateTimeEditor= function(container, options) {
                $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                    .appendTo(container)
                    .kendoDateTimePicker({});
            };
            var messageTargetTemplate = function(row) {
                var arr = row.messageTarget || [],
                    html = [];

                if (arr && arr.forEach) {
                    arr.forEach(function(el) {
                        html.push(el.companyName);
                    });
                }
                return html.join(',');
            };
            var messageReadTemplate = function(row) {
                var arr = row.messageRead || [],
                    html = [];

                if (!arr) {
                    return '';
                } else if (arr.forEach) {
                    arr.forEach(function(el) {
                        html.push(el.userName);
                    });                    
                } else {
                    $.each(arr, function(el) {
                        html.push(el.userName);
                    });
                }
                return html.join(',');                
            };
            var messageReadDropDownEditor = function(container, options) {
                var company = that.companyInfo,
                    userName = company.ownerFamily + ' ' + company.ownerName + ' ' + company.ownerSurname;

                $('<input data-text-field="userName" data-value-field="id" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        dataValueField: 'id',
                        dataTextField: 'userName',
                        dataSource: [
                            {id: company.id, userName: userName} 
                        ]
                    });               
            };            
            var messageTargetDropDownEditor = function(container, options) {
                $('<input data-text-field="companyName" data-value-field="id" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        autoBind: true,
                        dataValueField: 'id',
                        dataTextField: 'companyName',
                        multiple: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.serverUrl + 'api/get-company-list',
                                        data: {
                                            userHash: app.getActiveUserHash()
                                        },
                                        type: 'post',
                                        success: function(r) {
                                            if (r.success) {
                                                options.success(r.data.list);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        }                            
                    });
            };            
            var messageAuthorDropDownEditor = function(container, options) {
                $('<input required data-text-field="name" data-value-field="id" data-bind="value:messageAuthorId"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: {
                            transport: {
                                read: function(options) {
                                    $.ajax({
                                        url: app.serverUrl + 'api/member/get-member-list',
                                        data: {
                                            userHash: app.getActiveUserHash(),
                                            departmentId: 0 //<-- all departments get
                                        },
                                        type: 'post',
                                        success: function(r) {
                                            if (r.success) {
                                                options.success(r.data.list);
                                            }                                                    
                                        }
                                    }); 
                                }
                            }
                        }                            
                    }); 
            };              
            var messageTypeDropDownEditor = function(container, options) {
                $('<input required data-text-field="text" data-value-field="value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        dataSource: [{
                            text: 'Информационные',
                            value: 'info'
                        },{
                            text: 'Важные',
                            value: 'alert'
                        },{
                            text: 'Критические',    
                            value: 'crytical'
                        }]
                    });
            };            
            var getDataSource = function() {
                var that = this; 

                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=get-message-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort,
                                    messageTargetId: that.companyInfo.id
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       app.showPopupErrors(r.errors);
                                       options.error();
                                    }
                                }
                            });
                        },
                        destroy: function(options) {
                            var rec = options.data.models[0],
                                data = {
                                    messageId: rec.id,
                                };
                            
                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=del-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                        options.success({data: data});
                                        app.publish('del-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
                                        options.error();
                                    }
                                }
                            }); 
                        },   
                        update: function(options) {
                            var data = $.extend(options.data.models[0], {
                                //
                            });                    
                            if (data.messageTarget[0].id == 0) {
                                return; // for all messages not editind
                            }
                            data.messageDate = u.getTimeFormatStr(data.messageDate);

                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=update-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    
                                    if (r.success) {
                                        data.messageAuthorName = r.data.messageAuthorName;
                                        options.success({data: data});
                                        app.publish('update-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
                                        options.error();
                                    }
                                }
                            });                            
                        },
                        create: function(options) {
                            var data = $.extend(options.data.models[0], {
                                messageAuthorId: app.getActiveUser().id,
                                messageTarget: [{
                                    id: that.companyInfo.id,
                                    companyName: that.companyInfo.companyName
                                }],
                                messageAuthorName: app.getActiveUser().name
                            });
                            data.messageDate = u.getTimeFormatStr(data.messageDate);
                            
                            $.ajax({
                                url: app.voiceipServerUrl + 'messages.php?method=add-message&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    
                                    if (r.success) {
                                        data.id = r.data.id;
                                        options.success({data: data});
                                        app.publish('add-message', data);
                                    } else {
                                        app.showPopupErrors(r.errors);
                                        options.error();
                                    }
                                }
                            });
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {                            
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: 'id',
                            fields: {
                                messageType: {defaultValue: 'info'},
                                messageDate: {defaultValue: u.getCurrentDateTime()},
                                messageAuthorId: {},
                                messageAuthorName: {},
                                messageTarget: {editable: false},
                                messageShort: {},
                                messageFull: {},
                                messageReadId: {},
                                messageReadName: {},
                           }
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                               
            };     
            var messageListGrid = this.el.find('#messages-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'messageType',
                    title: 'Тип',
                    editor: messageTypeDropDownEditor,
                    template: function(row) {
                        return that.i18n.vatsContent.msgType[row.messageType] || that.i18n.vatsContent.msgType['info'];
                    }
                },{ 
                    field: 'messageDate',
                    title: 'Дата',
                    format: '{0:yyyy-MM-dd HH:mm}',
                    editor: dateTimeEditor
                },{
                    field: 'messageAuthor',
                    title: 'Автор',
                    sortable: false,
                    editor: messageAuthorDropDownEditor,
                    template: function(row) {
                        return row.messageAuthorName
                    }
                },{
                    field: 'messageShort',
                    title: 'Вступление',
                    encoded: false
                },{
                    field: 'messageFull',
                    title: 'Сообщение',
                    encoded: false
                },{
                    field: 'messageTarget',
                    title: 'Предназначено',
                    editor: messageTargetDropDownEditor,
                    template: messageTargetTemplate,
                    sortable: false
                },{
                    field: 'messageRead',
                    title: 'Прочитано',
                    template: messageReadTemplate,
                    editor: messageReadDropDownEditor,
                    sortable: false
                },{
                    title: '&nbsp;',
                    width: '110px',
                    template: function(r) {
                        return '<a class="k-button k-button-icontext k-grid-delete" href="javascript:;"><span class="k-icon k-delete"></span>Delete</a>';
                    }
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            }).data('kendoGrid');;             
        },
        renderDocumentsTable: function() {
            var that = this;
            
            var dateTimeEditor= function(container, options) {
                $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
                    .appendTo(container)
                    .kendoDateTimePicker({});
            };
            var getDataSource = function() {
                return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'documents.php?method=get-document-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.companyInfo.userGlobalId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       app.showPopupErrors(r.errors);
                                       options.error();
                                    }
                                }
                            });
                        },  
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {                            
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: 'id',
                            fields: {
                                num: {editable: false},
                                date: {editable: false, defaultValue: u.getCurrentDateTime()},
                                signed: {editable: false},
                                type: {editable: false},
                                url: {editable: false},
                           }
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                               
            };     
            this.documentListGrid = this.el.find('#documents-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'num',
                    title: 'Номер'
                },{ 
                    field: 'date',
                    title: 'Дата',
                    format: '{0:yyyy-MM-dd HH:mm}'
                },{
                    field: 'signed',
                    title: 'Подписано'
                },{
                    field: 'type',
                    title: 'Тип'
                },{
                    field: 'url',
                    title: 'Файл',
                    template: function(r) {
                        return '<a href="' + r.url + ' " target="_blank" rel="nofollow noopener">Скачать</a>'
                    }                    
                },{
                    title: '&nbsp;',
                    width: '110px',
                    template: function(r) {
                        return '<a class="k-button k-button-icontext k-grid-delete" href="javascript:;"><span class="k-icon k-delete"></span>Delete</a>';
                    }
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },                
                editable: true
            }).data('kendoGrid');
        },        
        renderInvoiceTable: function() {
            var that = this;
            
            var getDataSource = function() {
               return new kendo.data.DataSource({
                    transport: {
                        read: function(options) {
                            var sort = {};

                            if (options.data.sort && options.data.sort.length) {
                                sort = {
                                    field: options.data.sort[0].field,
                                    dir: options.data.sort[0].dir
                                };
                            }
                            $.ajax({
                                url: app.voiceipServerUrl + 'bills.php?method=get-invoice-list&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                    userGlobalId: that.companyInfo.userGlobalId,
                                    skip: options.data.skip,
                                    take: options.data.take,
                                    sort: sort
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    if (r.success) {
                                       options.success(r);
                                    } else {
                                       app.showPopupErrors(r.errors);
                                       options.error();
                                    }
                                }
                            });
                        },  
                        parameterMap: function(options, operation) {
                            if (operation !== 'read' && options.models) {
                                return {models: kendo.stringify(options.models)};
                            }
                        }
                    },
                    schema: {
                        total: function(resp) {
                            return resp.data.total || 0; //<-- replace in future
                        },
                        data: function(resp) {                            
                            if (typeof resp.data.list == 'undefined') {
                                return resp.data;
                            } else {
                                return resp.data.list;
                            }                        
                        },
                        model: {
                            id: 'id',
                            fields: {
                                num: {editable: false},
                                date: {editable: false, defaultValue: u.getCurrentDateTime()},
                                signed: {editable: false},
                                type: {editable: false},
                                url: {editable: false},
                           }
                        }
                    },
                    autoSync: true,
                    batch: true,
                    pageSize: app.getGridPageSize(),                
                    serverPaging: true,
                    serverSorting: true
                });                               
            };     
            this.invoiceListGrid = this.el.find('#invoice-list').kendoGrid({
                columns: [{
                    field: 'id',    
                    title: 'id',
                    width: '45px'
                },{ 
                    field: 'date',
                    title: 'Дата'
                },{ 
                    field: 'invoiceDateBegin',
                    title: 'Период С',
                    format: '{0:yyyy-MM-dd HH:mm}'
                },{
                    field: 'invoiceDateEnd',
                    title: 'по',
                    format: '{0:yyyy-MM-dd HH:mm}'
                },{                    
                    field: 'invoiceMvtsId',
                    title: 'invoiceMvtsId'
                },{
                    field: 'invoiceId',
                    title: 'invoiceId'                    
                },{
                    field: 'invoiceNumber',
                    title: 'invoiceNumber'                                        
                },{
                    field: 'actId',
                    title: 'actId'                                        
                },{
                    field: 'actNumber',
                    title: 'actNumber'                                                            
                },{
                    field: 'serviceName',
                    title: 'serviceName'                                                                                
                },{    
                    field: 'invoiceRealSum',
                    title: 'invoiceRealSum'                    
                },{
                    field: 'invoiceSum',
                    title: 'invoiceSum'                    
                },{
                    field: 'invoceFileUrl',
                    title: 'Счет-фактура',
                    template: function(r) {
                        return '<a href="' + r.invoiceFileUrl + '&mccRootPassword='+ app.getMccRootPassword() +'" target="_blank" rel="nofollow noopener">Скачать</a>';
                    }                    
                },{
                    field: 'actFileUrl',
                    title: 'Акт',
                    template: function(r) {
                        return '<a href="' + r.actFileUrl  + '&mccRootPassword='+ app.getMccRootPassword() +'" target="_blank" rel="nofollow noopener">Скачать</a>';
                    }                    
                }],                
                dataSource: getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },                
                editable: false
            }).data('kendoGrid');              
        },
        renderAudioPlayer: function() {
            var that = this; 
     
            $('.audio-progress-bar').kendoToolBar({
                resizable: false,
                items: [{
                    type: 'button',
                    icon: 'play',
                    togglable: false, 
                    overflow: 'never', 
                    click: function(e) {
                        that.onClickPausePlayBtn.call(that, $(e.target).find('span'));
                    }
                },{
                    template: function(e) {
                        return "<span class='audio-duration-txt'>00:00</span>";
                    }
                },{    
                    template: function(e) {
                        return "<input class='audio-progress-spliter' style='width: 120px'/>";
                    },
                    overflow: 'never'
                },{
                    type: 'button',
                    icon: 'download',
                    overflow: 'never',
                    click: function(e) {
                        that.onClickDownloadBtn.call(that, e.target);
                    }
                }]
            });
            setTimeout(function() {
                var elems = $('.audio-progress-spliter');
            
                for (var i=0; i<elems.length; i++) {
                    var el = $(elems[i]),                    
                        controlEl = el.closest('.audio-control'),
                        duration = controlEl.attr('data-duration');

                    (function(el) {
                        var slider = el.kendoSlider({
                            showButtons: false,
                            tickPlacement: 'none',
                            smallStep: 1,
                            largeStep: 2,
                            precision: 1,
                            max: duration,
                            change: function(e) {
                                that.onChangeSliderValue.call(that, e.value, el);
                            }
                        });                        
                    })(el) 
                }
            }, 5); 
        },
        pause: function(el) {
            var that = this,
                audioEl = el.closest('td').find('audio')[0];
            
            el.removeClass('stop').addClass('play');
            audioEl.pause();
            clearInterval(that.i);
        },
        stop: function(el) {
            var that = this,
                audioEl = el.closest('td').find('audio')[0];
            
            audioEl.currentTime = 0;
            audioEl.pause();
            clearInterval(that.i);
            
            var controlEl = el.closest('.audio-control'),
                tmpEl = controlEl.find('.audio-progress-spliter')[1],                                
                kendoSlider = $(tmpEl).getKendoSlider();
        
            kendoSlider.value(0);            
        },        
        play: function(el) {
            var that = this,
                audioEl = el.closest('td').find('audio')[0];
        
            audioEl.play();

            var duration = el.attr('data-duration'),
                tmpEl = el.find('.audio-progress-spliter')[1],                                
                kendoSlider = $(tmpEl).getKendoSlider();

            var currentPosition = kendoSlider.value();
            
            if (currentPosition == duration) {
                private.seekToBegin.call(this, el);
            }
            that.i = setInterval(function() {
                private.setSoundProgressPosition.call(that, audioEl, kendoSlider);
            }, 100);          
        },
        seekToBegin: function(el) {
            var that = this,
                audioEl = el.closest('td').find('audio')[0];
        
            audioEl.currentTime = 0;
            
            var controlEl = el.closest('.audio-control'),
                tmpEl = controlEl.find('.audio-progress-spliter')[1],                                
                kendoSlider = $(tmpEl).getKendoSlider();
        
            kendoSlider.value(0);
        },
        seekToEnd: function(el) {
            var that = this,
                duration = el.attr('data-duration'),
                audioEl = el.closest('td').find('audio')[0];
      
            audioEl.currentTime = duration + 1; //<-- set more if need!       
            
            var controlEl = el.closest('.audio-control'),
                tmpEl = controlEl.find('.audio-progress-spliter')[1],                                
                kendoSlider = $(tmpEl).getKendoSlider();
        
            kendoSlider.value(duration);            
        },
        setSoundProgressPosition: function(audioEl, kendoSliderEl) {
            var el = $(audioEl),
                durationTxtEl = el.next().find('.audio-duration-txt'),
                audioPlayBtn = el.next().find('span.k-icon');
                  
            var getFormatedDurationStr = function(duration) {
                var tmp = duration.toString().split('.'),
                    a,b = '';
            
                var min = Math.floor(tmp[0]/60),
                    sec = tmp[0]-(min*60);    

                if (typeof sec == 'undefined') {
                    sec = '00';
                }
                if (sec == 0) {
                    b = '00';
                } else if (sec < 10) {
                    b = '0' + sec;
                } else {
                    b = sec;
                }
                if (min == 0) {
                    a = '00';
                } else if (min < 10) {
                    a = '0' + min;
                } else {
                    a = min;
                }
                return a + ':' + b;
            };
            if (audioEl.currentTime > 0) {
                this.currentPlay.position = audioEl.currentTime;
                kendoSliderEl.value(audioEl.currentTime);
                durationTxtEl.text(getFormatedDurationStr(audioEl.currentTime));
                
                if (audioEl.duration == audioEl.currentTime) {
                    kendoSliderEl.value(0);
                    durationTxtEl.text('00:00');
                    
                    this.currentPlay = {
                        id: null,
                        el: null,
                        position: null
                    };
                    clearInterval(this.i);
                    this.onClickPausePlayBtn.call(this, audioPlayBtn);
                }
            }
        },
        showRequestProtocolDetail: function(data) {
            function getJsonStr(str) {
                var parsedDataItem = JSON.parse(str);
                return JSON.stringify(parsedDataItem, undefined, 2);
            }
            function syntaxHighlight(json) {
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                    var cls = 'number';

                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }
            function output(inp) {
                var wrapRequest = document.createElement('pre');
                wrapRequest.innerHTML = inp;
                return wrapRequest;
            }
            this.window.content(output(syntaxHighlight(getJsonStr(data))));
            this.window.center().open();
        },
        transferVoiceContent: function(voiceContent, userGlobalId, callback) {
            var data = {
                voiceContent: voiceContent,
                userGlobalId: userGlobalId                
            };
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=transfer-voice-content&mccRootPassword=' + app.getMccRootPassword(),
                type: 'post',
                data: data,
                success: function(resp) {
                    var r = JSON.parse(resp);

                    if (!r.success) {
                       app.showPopupErrors(r.data);
                    } else {
                        callback && callback(r.data.fileUrl);
                    }
                }
            });
        }
    };
    return public;
});