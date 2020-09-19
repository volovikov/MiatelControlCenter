    define([
    'jquery',
    'kendo',
    'util',    
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    './lib/highlight.pack.js',
    './data/test-public.js',
    './data/test-private.js',
    './data/test-atc.js',
    './data/test-messages.js',
    './data/test-scenario.js',
    './data/test-bills.js',
    './data/test-sorm.js',
    './data/test-documents.js',
    './data/test-production.js',
    './data/test-networktest.js',
    './data/MethodListCollection.js',
    'text!./templates/vats-test.html',
    'css!./css/vatsContent',
    'css!./css/vs',
    
], function($, k, u, common, local, hl, testPublicData, testPrivateData, testAtcData, testMessagesData, testScenarioData, testBillsData,  testSormData,  testDocumentsData, testProdData, testNetworkData, methodListCollection, vatsTest) {
    
    var vatsTestTmpl = k.template(vatsTest);
    
    var public = {
        myModuleName: 'VatsContentTesttModule',
        testPassword: app.getMccRootPassword(),
        testlogin: "79523784792",
        //testLogin:  $("#testselectLogin option:selected").val(),
        run: function(params) {
            /**
             * Все переданные параметры этому модулу, я присваиваю 
             * ему как свойства. Вызвали модуль скажем с 
             * 
             * module.run({
             *     some: 'some'
             * });
             * 
             * После процедуры нижу будет доступно 
             * 
             * this.some = 'some';
             * 
             * @type @arr;params
             */
            for (var key in params) {
                this[key] = params[key];
            }                
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        },
        onClickRowTestResult: function(row) {
            var detail = row.attr('data-result-detail');
            
            if (detail) {
                private.writeTestDetail.call(this, detail);
            }
        },
        
        /*onClickRequestBtn: function(btn) {
            var dataItem = this.grid.dataItem($(btn).closest("tr")),
                data = dataItem.request;

            private.showProtocolDetails.call(this, data);
        },
        onClickResponseBtn: function(btn) {
            var dataItem = this.grid.dataItem($(btn).closest("tr")),
                data = dataItem.response;

            private.showProtocolDetails.call(this, data);
        },
        */
        
        onClickTestRunBtn: function(btn) {
            var that = this; 
            //alert($("#testselectLogin option:selected").val());
            $('#testLogin').val($("#testselectLogin option:selected").val());
            that.testLogin = $('#testLogin').val(); //<-- из формы берем напрямую
            //that.testLogin = $("#testselectLogin option:selected").val();  // из формы из обьекта select
            
            switch (this.treeId) {
                case '10':
                    private.runTestPublicMethods.call(that);
                    break;  
                    
                case '20':
                    private.runTestPrivateMethods.call(that);
                    break;
                    
                case '22':
                    private.runTestAtcMethods.call(that);
                    break;
                    
                case '23':
                    private.runTestBillsMethods.call(that);
                    break;
                    
                case '24':
                    private.runTestMessagesMethods.call(that);
                    break;
                    
                 case '25':
                    private.runTestDocumentsMethods.call(that);
                    break;
                    
                case '3':
                    return private.runTestNewRegister.call(that);
                    break;
                    
                case '4':                        
                    return private.runTestDelCompany.call(that);
                    break;
                    
                case '5':
                    return private.runTestSormMethods.call(that);
                    break;
                
                case '6':
                    return private.runTestProductionMethods.call(that);
                    break;
                
                case '7':
                    return private.runTestNetworkMethods.call(that);
                    break;
            }  
           
        }
    };
    var private = {
       // phash:phash,
        bindEvents: function() {
            var that = this;
            
            $(document).on('click', '.row-test-result', function() {
                that.onClickRowTestResult.call(that, $(this));
            });        
            $(document).on('click', '#test-run', function(e) {
                e.preventDefault();
                that.onClickTestRunBtn.call(that, $(this));
            });
            $(document).off('click', '.request-detail-btn').on('click', '.request-detail-btn', function(e) {
                that.onClickRequestBtn.call(that, $(this));
            });
            $(document).off('click', '.response-detail-btn').on('click', '.response-detail-btn', function(e) {
                that.onClickResponseBtn.call(that, $(this));
            });
            
            
        },
        render: function() {
            var that = this;
            
            private.getCompanyList.call(that, function(companyList) {
                var html = vatsTestTmpl({
                    i18n: that.i18n,
                    testLogin: that.testLogin,
                    companyList: companyList
                });                
                that.el.html(html); 
                that.el.find('.tabstrip').kendoTabStrip({
                    animation:  {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });
                /**
                 * ВВ
                 * После того, как закончатся все тесты, 
                 * а тесты просто в таблицу, в html код пишут данные
                 * <tr><td></td></tr>
                 * Я вызываю вот эту функцию и kendo из html таблицы
                 * делает уже свою таблицу
                 */
                that.el.find('.grid').kendoGrid({
                    // настройки тут 
                });     
                that.el.find('.combobox').kendoComboBox();
                
                that.wnd = that.el.find("#protocol-details").kendoWindow({
                    title: "Details",
                    modal: true,
                    visible: false,
                    resizable: true,
                    width: 700,
                    maxHeight: "90vh"
                }).data("kendoWindow");

                private.getCompanyList.call();            
                //private.renderActionLogTable.call(that);
                
            });            
        },        
        runTestPublicMethods: function() {
            var that = this;
            
            /**
             * ВВ
             * В папуке /data 
             * лежат данные для тестов. Какой метод с какими 
             * параметрами вызывать. Не надо в
             * основной код их вставлять. Читать потом код трудно
             * 
             * @type @arr;testPublicData
             */
            for (var i in testPublicData) {
                var e = testPublicData[i];

                /**
                 * ВВ
                 * Тут именно так надо сделать. 
                 * Надо обернуть вызов AJAX запроса в анонимную функцию и передать в нее данные из массива
                 * выше, занчение e
                 * 
                 */
                (function(e) {
                
                    $.ajax({
                        url: app.wwwServerUrl + '/public.php?method=' + e.method,
                        data: e.data,
                        async: false,
                        success: function(resp) {
                            var r = JSON.parse(resp),
                            rec = {
                                method: e.method,
                                success: r.success,
                                datail: r                        
                            };                                
                            private.writeTestResult(rec);
                            
                           
                        }
                    });
                })(e);                
            }
            
        }, 

        runTestPrivateMethods: function() {
            var that = this,
                data = {
                    login: that.testLogin,
                    password: that.testPassword                    
                };
    
            $.ajax({
                async:false,
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:data,
                success:function(resp) {
                    setTimeout(10000);
                    var r = JSON.parse(resp);

                    private.writeTestResult({
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    });
                    //that.testUserHash = 213123123;
                    //that.testUserHash = r.data.userHash;                        
                    that.testPhoneReserved = r.data.phoneReserved;

                    for (var i in testPrivateData) {
                        var e = testPrivateData[i],
                            data = e.data;

                        (function(e) {
                            data = $.extend(e.data, {
                                userHash: that.testUserHash
                            });
                            $.ajax({
                                url: private.getFileOfMethod(e)+ e.method,
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    private.writeTestResult({
                                        method: e.method,
                                        success: r.success,
                                        datail: r                        
                                    });
                                }                                           
                            });
                        })(e);
                   }
                }
            });           
        },

        runTestAtcMethods: function() {
            var that = this,
                hash=0,
                userglobal;
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:{
                    login: that.testLogin,
                    password: that.testPassword
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r
                    };
                    private.writeTestResult(rec);
                    phash=r.data.userHash;
                    for (var i in testAtcData) {
                        var e = testAtcData[i],
                            data=e.data;

                            (function(e) {
                                //alert(phash);
                                data = $.extend(e.data, {userHash: phash});

                                $.ajax({
                                    url: app.voiceipServerUrl + 'atc.php?method=' + e.method,
                                    async: false,
                                    data: data,
                                    success: function(resp) {
                                        var r = JSON.parse(resp),
                                        rec = {
                                            method: e.method,
                                            success: r.success,
                                            datail: r
                                        };
                                        private.writeTestResult(rec);
                                    }
                                });
                            })(e);
                    }
                 }
            });
        },
        
        runTestMessagesMethods: function() {
            var that = this,
                hash=0,
                userglobal;
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:{
                    login: that.testLogin,
                    password: that.testPassword                    
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    };                                
                    private.writeTestResult(rec);
                    phash=r.data.userHash;
                    for (var i in testMessagesData) {
                        var e = testMessagesData[i],
                            data=e.data;

                            (function(e) {
                                //alert(phash);
                                data = $.extend(e.data, {userHash: phash});
                                
                                $.ajax({
                                    url: app.voiceipServerUrl + 'messages.php?method=' + e.method,
                                    async: false,
                                    data: data,
                                    success: function(resp) {
                                        var r = JSON.parse(resp),
                                        rec = {
                                            method: e.method,
                                            success: r.success,
                                            datail: r                        
                                        };                                
                                        private.writeTestResult(rec);
                                    }
                                });
                            })(e);
                    }
                 }
            });
        },
        
       
        runTestDocumentsMethods: function() {
            var that = this,
                hash=0,
                userglobal;
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:{
                    login: that.testLogin,
                    password: that.testPassword                    
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    };                                
                    private.writeTestResult(rec);
                    phash=r.data.userHash;
                    for (var i in testDocumentsData) {
                        var e = testDocumentsData[i],
                            data=e.data;

                            (function(e) {
                                //alert(phash);
                                data = $.extend(e.data, {userHash: phash});
                                
                                $.ajax({
                                    url: app.voiceipServerUrl + 'documents.php?method=' + e.method,
                                    async: false,
                                    data: data,
                                    success: function(resp) {
                                        var r = JSON.parse(resp),
                                        rec = {
                                            method: e.method,
                                            success: r.success,
                                            datail: r                        
                                        };                                
                                        private.writeTestResult(rec);
                                    }
                                });
                            })(e);
                    }
                 }
            });
        },
        runTestBillsMethods: function() {
            var that = this,
                hash=0,
                userglobal;
            $.ajax({
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:{
                    login: that.testLogin,
                    password: that.testPassword                    
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    };                                
                    private.writeTestResult(rec);
                    phash=r.data.userHash;
                    for (var i in testBillsData) {
                        var e = testBillsData[i],
                            data=e.data;

                            (function(e) {
                                //alert(phash);
                                data = $.extend(e.data, {userHash: phash});
                                
                                $.ajax({
                                    url: app.voiceipServerUrl + 'bills.php?method=' + e.method,
                                    async: false,
                                    data: data,
                                    success: function(resp) {
                                        var r = JSON.parse(resp),
                                        rec = {
                                            method: e.method,
                                            success: r.success,
                                            datail: r                        
                                        };                                
                                        private.writeTestResult(rec);
                                    }
                                });
                            })(e);
                    }
                 }
            });
        },
        
        runTestNewRegister: function() {  
            var that = this,
                testPhoneNum = '79523784792',
                phonecode;
            
            $.ajax({
                url: app.wwwServerUrl + 'sms.php?method=send-confirm-phone-code&mccRootPassword=' + app.getMccRootPassword(),
                async: false,
                data: {
                    phone: testPhoneNum
                },
                success: function(resp) {
                    var r = JSON.parse(resp),
                        rec = {
                            method: 'send-confirm-phone-code',
                            success: r.success,
                            datail: r                        
                        };
                    
                    if (r.error) {
                        
                    } else {
                        
                    $.ajax({
                    url: app.wwwServerUrl + 'sms.php?method=get-confirm-phone-code&mccRootPassword=' + app.getMccRootPassword(),
                    async: false,
                    data: {
                        phone: testPhoneNum
                        },
                    success: function(resp) {
                        //try{
                        var r = JSON.parse(resp),
                            rec = {
                                method: 'get-confirm-phone-code',
                                success: r.success,
                                datail: r                        
                            };
                            alert(JSON.stringify(r.data));
                            phonecode = r.data.confirmCode;
                            alert(phonecode);
                            }
                            });
                            $.ajax({
                                url: 'https://voip-dev.miatel.ru/api/add.php?method=add-company',  //для прода  https://reg.miatel.ru/api/add.php?
                                async: false,                                                       //для дева   https://voip-dev.miatel.ru/api/add.php?method=add-company
                                data: {
                                    companyForm:'ooo',
                                    //companyVersion: 'ur',    // ooo, oao, zao, other 
                                    companyName : 'BetaAutotest',
                                    companyAction: 'Autotest',
                                    companyWorkerCount: '22',
                                    confirmOwnerPhone: phonecode,
                                    ownerName: 'Autotest',
                                    ownerFamily: 'Autotest',    
                                    ownerSurname: 'Autotest',
                                    ownerEmail: 'Autotest@Autotest.ru',
                                    ownerPhone: testPhoneNum,
                                    ownerStatus: 'ur',    // fiz, ur, ip ,
                                    rootPassword : "414116vfvfvskfhfve2128506",
                                    agreement:'1',
                                    reserved: {
                                        phoneList: ['+7 (812) 383-66-75'],
                                        tariffId: 17
                                    }
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    
                                }
                            });
                            
                            
                            
                        }                            
                        private.writeTestResult(rec);

                         $.ajax({
                        url: app.voiceipServerUrl + 'private.php?method=login',
                        async: false,
                        data:{
                                login: that.testLogin,
                                password: that.testPassword                    
                                },
                        success:function(resp) {
                        var r = JSON.parse(resp),
                        rec = {
                            method: 'login',
                            success: r.success,
                            datail: r                        
                        };                                
                        private.writeTestResult(rec);
                        phash=r.data.userHash;
                        alert(phash);
                        for (var i in testScenarioData) {
                            var e = testScenarioData[i],
                                data=e.data;

                                (function(e) {
                                    //alert(phash);
                                    data = $.extend(e.data, {userHash: phash});
                                    
                                    $.ajax({
                                        url: private.getFileOfMethod(e)+ e.method,
                                        async: false,
                                        data: data,
                                        success: function(resp) {
                                            var r = JSON.parse(resp),
                                            rec = {
                                                method: e.method,
                                                success: r.success,
                                                datail: r                        
                                            };                                
                                            private.writeTestResult(rec);
                                            
                                        }
                                    });
                                })(e);
                        }
                     }
                 //}
            });
                }
            });
            
             for (var i in testScenarioData) {
                var e = testScenarioData[i];

                (function(e) {  
                    
})(e); 
                
            }
            
        }, 
        
        runTestDelCompany: function() {
            var that = this;
            $.ajax({
                url:app.voiceipServerUrl + 'private.php?method=del-company&mccRootPassword=' + app.getMccRootPassword(),
                
                data:{
                   userGlobalId:'customer79523784792'                 
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    };                                
                    private.writeTestResult(rec);
                 }
            });
        },
        
        runTestSormMethods: function() {
            var that = this,
                hash=0,
                userglobal;
            alert(1);
            $.ajax({
                url: 'https://sorm-api.miatel.ru/sorm.php?method=login',
                async: false,
                data:{
                    login:'masteradmin',
                    password:'masteradmin'                    
                },
                success:function(resp) {
                    var r = JSON.parse(resp),
                    rec = {
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    };                                
                    private.writeTestResult(rec);
                    phash=r.data.userHash;
                    for (var i in testSormData) {
                        var e = testSormData[i],
                            data=e.data;

                            (function(e) {
                                //alert(phash);
                                data = $.extend(e.data, {userHash: phash});
                                
                                $.ajax({
                                    url: 'https://sorm-api.miatel.ru/sorm.php?method=' + e.method,
                                    async: false,
                                    data: data,
                                    success: function(resp) {
                                        var r = JSON.parse(resp),
                                        rec = {
                                            method: e.method,
                                            success: r.success,
                                            datail: r                        
                                        };                                
                                        private.writeTestResult(rec);
                                    }
                                });
                            })(e);
                    }
                 }
            });
        },
        
        runTestProductionMethods: function() {
            var that = this,
                data = {
                    login: that.testLogin,
                    password: that.testPassword                    
                };
    
            $.ajax({
                async:false,
                url: app.voiceipServerUrl + 'private.php?method=login',
                data:data,
                success:function(resp) {
                    var r = JSON.parse(resp);

                    private.writeTestResult({
                        method: 'login',
                        success: r.success,
                        datail: r                        
                    });
                    that.testUserHash = r.data.userHash;                        
                    that.testPhoneReserved = r.data.phoneReserved;

                    for (var i in testProdData) {
                        var e = testProdData[i],
                            data = e.data;

                        (function(e) {
                            data = $.extend(e.data, {
                                userHash: that.testUserHash
                            });
                            $.ajax({
                                async:false,
                                url: private.getFileOfMethod(e)+ e.method,
                                data: data,
                                success: function(resp) {
                                    var r = JSON.parse(resp);

                                    private.writeTestResult({
                                        method: e.method,
                                        success: r.success,
                                        datail: r                        
                                    });
                                    
                                }                                           
                            });
                        })(e);
                   }
                }
            });           
        }, 
        
        
     
        
        runTestNetworkMethods: function() {
            var that = this;

            //app.publish('preloader-show');   //раскомментить прелоадер потом
            
            //setTimeout(function() {
                for (var i in testNetworkData) {
                    var e = testNetworkData[i];

                    (function(e) {
                        $.ajax({
                            url: app.voiceipServerUrl + 'test.php?method=' + e.method + '&mccRootPassword=' + app.getMccRootPassword(),
                            data: e.data,
                            async: false,
                            success: function(resp) {
                                var r = JSON.parse(resp),
                                rec = {
                                    method: e.method,
                                    success: r.success,
                                    datail: r                        
                                };                                
                                private.writeTestResult(rec);
                                //private.showProtocolDetails.call(this, resp);

                                //if (i == testNetworkData.length-1) {
                                //    app.hidePreloader();
                                //}
                            }
                        });
                    })(e);                
                }                   
            //}, 500)
         
        },
        
        
        writeTestResult: function(rec) {
            var el = $('#test-result'),
                detail = JSON.stringify(rec).split('"').join("'");
            
            /**
             * ВВ
             * обрати внимание 
             * Я объект rec перевожу в строку
             * и убираю ковычки. И далее полученные данные
             * вставляю в доп свойство data-result-detail 
             */
            el.append('<tr style="cursor: pointer" class="row-test-result" data-result-detail="' + detail + '"><td>' + rec.method + '</td><td>' + rec.success + '</td></tr>');
            
        },
        
        /*
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
                           
                            $.ajax({
                                url:'https://www-dev.miatel.ru/api/public.php?method=get-country-list',
                                //url: app.voiceipServerUrl + 'private.php?method=get-company-actions&mccRootPassword=' + app.getMccRootPassword(),
                                type: 'post',
                                data: {
                                   
                                },
                                success: function(resp) {
                                    var r = JSON.parse(resp);
                                    //alert(field);

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
                                companyName: {},
                                request: {},
                                response: {},
                                
                                
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
            this.grid =  this.el.find('#action-log-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '50px',
                    filterable: false
                },{
                    title: 'request',
                    template: function() {
                        return '<button class="k-button request-detail-btn">Показать</button>'
                    },
                    width: "180px"
                },{
                    title: 'response',
                    template: function() {
                        return '<button class="k-button response-detail-btn">Показать</button>'
                    },
                    width: "180px"
                },{
                    field: 'method',
                    title: 'method',                    
                }],                
                dataSource: getDataSource(),
                editable: false
            }).data('kendoGrid');
        },
        */
        
        
        syntaxHighlight: function(json) {
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
        },
        
        showProtocolDetails: function(data) {
            //console.log(data);
            
            function getJsonStr(str) {
                var parsedDataItem = JSON.parse(str);
                return JSON.stringify(parsedDataItem, undefined, 2);
            }
            
            function output(inp) {
                var wrapRequest = document.createElement('pre');
                wrapRequest.innerHTML = inp;
                return wrapRequest;
            }
            this.wnd.content(output(this.syntaxHighlight(getJsonStr(data))));
            this.wnd.center().open();
        },
        
        
        writeTestDetail: function(str) {
            var el = $('#test-result-detail');
            var tmp = str;
            
            //console.log(tmp);
            tmp = tmp.replace( /{/g, '<ul>');
            tmp = tmp.replace( /}/g, '</ul>');
            tmp = tmp.replace( /,/g, '<br>');
            //tmp = tmp.replace( /'/g, ' ');
            tmp = tmp.replace( /true/g, "<font color='green'>'true'</font>");
            el.html(tmp);
             
            /**
             * ВВ
             * После загрузки библиотеки
             * highlight.pack.js
             * доступен объект hljs
             * И после вставки нового текста, нужно вызывать метод highlightBlock
             * чтобы он заново подсветку синтаксиса делал
             */
            
            //el.each(function(i, block) {
            //    hljs.highlightBlock(block);
            //});
        },
        
        writeTestRequest: function(str) {
            var el = $('#test-request-detail');
            var el = $('#test-request-detail');
            
            //el.html(str);
            el.append(str);
            
            el.each(function(i, block) {
                hljs.highlightBlock(block);
            });
            
        },
        
        getFileOfMethod:function(e){
           var i=0, j=0;
           var file='';
           var name='0000000';
             for(key of methodListCollection)
            {
                for(rew of key)
                {
                    name=rew.url;
                    if(rew==undefined){alert(':(');continue;}
                    else if(rew.url===e.method)
                            {
                                //alert(i);
                                switch(i){
                                    case 0:
                                        file=app.voiceipServerUrl+'public.php?method=';
                                        return file;
                                        break;
                                    case 1:
                                        file=app.voiceipServerUrl+'private.php?method=';
                                        return file;
                                        break;
                                    case 2:
                                        file=app.voiceipServerUrl+'atc.php?method=';
                                        return file;
                                        break;
                                    case 4:
                                        file=app.voiceipServerUrl+'proxy.php?method=';       
                                        return file;
                                        break;
                                    case 9:
                                        file=app.voiceipServerUrl+'bills.php?method=';
                                        return file;
                                        break;
                                    case 10:
                                        file=app.voiceipServerUrl+'messages.php?method=';
                                        return file;
                                        break;
                                    case 11:
                                        file=app.voiceipServerUrl+'documents.php?method=';
                                        return file;
                                        break;
                                    
                                    
                                    default:
                                        alert('default');
                                }
                            }
                }
                i++;
                
            }
            return file;
        },
        
        getCompanyList: function(callback) {
            var that = this,
                data = {
                    userHash: app.getActiveUserHash()
                },
                list = [];
            console.log(app.clientServerUrl);
            
            $.ajax({
                url: app.clientServerUrl + 'api/get-company-list-tree' ,
                type: 'post',                
                data: data,
                success: function(resp) {                    
                    if (resp.success) {
                        var items = resp.data.tree.items,
                            companies = {};
                    
                        for (var i in items) {                            
                            var phone = parseInt(items[i].userGlobalId.replace(/\D+/g,"")),
                                name = items[i].text;    
                            
                            list.push({
                                name: name,
                                phone: phone
                            });
                        }                    
                        callback && callback(list);
                    } else {
                        alert(JSON.stringify(resp));
                    }
                }
            });            
        },
    };
    return public;
});