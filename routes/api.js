var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    u = require('../util'),
    commonSocket,
    localSocket = null;

router.all('*', function(req, res, next) {
    var userHash = req.body.userHash;

    if (req.originalUrl == '/api/login') {
        next();
    } else if (req.originalUrl == '/api/remind') {
        next();
    } else if (req.originalUrl == '/api/is-user-logined') {
        next();
    } else if (req.originalUrl == '/api/task/add-task') {
        if (userHash && userHash != '') {    
            req.body.userId = u.getUserIdFromHash(userHash, req.session.users);
        }        
        next();
    } else if (req.originalUrl == '/api/task/add-task-comment') {
        if (userHash && userHash != '') {    
            req.body.userId = u.getUserIdFromHash(userHash, req.session.users);
        }
        next();
    } else if (req.originalUrl == '/api/is-user-logined') {
        next();              
    } else if (req.originalUrl == '/api/get-company-invoice-sum') {
        next();        
    } else if (req.originalUrl == '/api/get-company-voip-server-url') {
        next();
    } else if (req.originalUrl == '/api/notify-operator') {
        next();
    } else if (req.originalUrl == '/api/client/notify-lockout-client') {
        next();           
    } else if (req.originalUrl == '/api/client/notify-account-make-error') {
        next();  
    } else if (req.originalUrl == '/api/client/notify-change-balance') {
        next();           
    } else if (req.originalUrl == '/api/client/notify-invoice-send') {
        next();        
    } else if (req.originalUrl == '/api/client/notify-client-money-end') {
        next();    
    } else if (req.originalUrl == '/api/client/notify-client-phone-reserved') {
        next();            
    } else if (req.originalUrl == '/api/client/add-client-call') {
        next();
    } else if (req.originalUrl == '/api/client/add-client') {
        next();
    } else if (req.originalUrl == '/api/client/add-client-comment') {
        next();
    } else if (req.originalUrl == '/api/client/add-client-contract-data') {
        next();
    } else if (req.originalUrl == '/api/client/add-client-pay') {
        next();
    } else if (userHash && userHash != '') {    
        req.body.userId = u.getUserIdFromHash(userHash, req.session.users);
        next();
    } else {
         res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
});
router.post('/notify-operator', function(req, res, next) {
    var message = req.body.message,
        operatorTargetId = req.body.operatorTargetId || 0; //<-- 0 for all
    
    if (typeof operatorTargetId != 'object') {
        operatorTargetId = [operatorTargetId];
    }    
    if (commonSocket) {
        commonSocket.emit('notify-operator', {
            message: message, 
            operatorTargetId: operatorTargetId
        });
        res.json({
            success: true
        });
    } else {
         res.json({
            success: false
        });
    }
});
router.post('/is-user-logined', function(req, res, next) {
    var cookie = req.cookies['session_cookie_name'],
        searchResult = false,
        user;
        
    if (req.sessionID && req.session.users) {
        for (var i in req.session.users) {
            var el = req.session.users[i];

            if (el.cookie == cookie) {
                searchResult = true;
                user = el;
            }
        }
        if (searchResult) {
            res.json({
                success: searchResult,
                data: user //<-- delete password in future!
            });            
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });            
        }
    } else {
        res.json({
            success: false
        });        
    }
});
router.post('/login', function(req, res, next) {
    var login = req.body.login,
        password = req.body.password;
    
    if (!login || !password) {
        res.json({
            success: false
        });
    } else {
        var getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };    
        var query = "\n SELECT * FROM `Members` WHERE `login` = '" + login + "' AND `password` = '" + password + "' AND `sectionAccessCode` != ''";

        tasksDb.query(query, function(err, resp) {      
            if (!err && resp.length != 0) {
                var user = resp[0],
                    cookie = req.cookies['session_cookie_name'];

                if (!req.session.users) {
                    req.session.users = {};
                }
                var userHash = getRandomInt(1000, 99999999);
                user.userHash = userHash;   
                delete user.password;
                delete user.cookie;
                req.session.users[userHash] = user;
                req.session.users[userHash].cookie = cookie;

                res.json({
                    success: true
                    //data: user
                });
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorUserNotFound]
                });
            }
        });        
    }
});
router.post('/logoff', function(req, res, next) {
    var userHash = req.body.userHash;

    if (req.session && req.session.users) {
        delete req.session.users[userHash];        
        //req.session.reset();
    }
    res.json({
        success: true
    });    
});
router.post('/get-company-invoice-sum', function(req, res, next) {
    // BB
    // дата приходит так 
    // 01-MAR-17
    // 
    // Или блять так
    //  20170701000000
    //
    var getMonthValue = function(monthStr) {
        var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return parseInt(months.indexOf(monthStr)) + 1;
    };
    var getReverseMonthValue = function(monthVal) {
        var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return months[parseInt(monthVal)-1];
    };
    var isDateValidFormat = function(date) {
        var a = date.split(' ')[0],
            b = a.split('-');

        if (b.length > 1) {
            return true;
        } else {
            return false;
        }
    };
    var makeDateValidFormat = function(date) {
        // BB
        // сюда приходит дата 20170701000000 
        // вот в таком ебнутом виде
        //
        var d = date.substr(6, 2) + '-' + getReverseMonthValue(date.substr(4, 2)) + '-' + date.substr(2, 2);
        return d;
    };
    var isCompanyWorkFirstMonth = function(contractDate, invoiceDateEnd) {
        // BB
        // invoiceDateEnd должен быть формата 01-MAR-17
        //
        var dr = contractDate.split(' ')[0], //<-- need only first part, don`r neet time
            di = invoiceDateEnd.split(' ')[0];
            
        var contractYear = dr.split('-')[0].substr(2),
            invoiceYear = di.split('-')[2];
    
        var contractMonth = dr.split('-')[1],
            invoiceMonth = di.split('-')[1];
    
        var tmp = getMonthValue(invoiceMonth),
            realInvoiceMonth;
        
        // BB
        // инвойс системой вызывается в ночь с 31 на 1ое, после 12 ночи
        // То есть invoiceDate будет 01 число
        //
        if (tmp == 1) {
            realInvoiceMonth = 12;
            contractYear++;
        } else {
            realInvoiceMonth = tmp-1;
        }        
        if (invoiceYear > contractYear) {
            return false;
        } else if (realInvoiceMonth > parseInt(contractMonth)) {
            return false;
        } else {
            return true;
        }
    };
    var mvtsCompanyId = req.body.mvtsCompanyId,
        userGlobalId = req.body.userGlobalId,
        companyId = req.body.companyId,
        userPhone = req.body.userPhone,
        invoiceSum = req.body.invoiceSum,
        invoiceDateEnd = req.body.invoiceDateEnd,
        query, where = '';
        
    if (!invoiceSum || !invoiceDateEnd) {
        return res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    }
    if (!isDateValidFormat(invoiceDateEnd)) {
        invoiceDateEnd = makeDateValidFormat(invoiceDateEnd);
    }
    if (typeof mvtsCompanyId != 'undefined') {
        where = "\n WHERE `v`.`mvtsCompanyId` = '" + mvtsCompanyId + "'";
    } else if (typeof userGlobalId != 'undefined') {
        where = "\n WHERE `v`.`globalid` = '" + userGlobalId + "'";
    } else if (typeof companyId != 'undefined') {
        where = "\n WHERE `v`.`id` = '" + companyId + "'";
    } else if (typeof userPhone != 'undefined') {
        where = "\n WHERE `v`.`ownerPhone` = '" + userPhone + "'";
    } else {
        return res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
    query = "\n USE `miatelSbc`;"+
            "\n SELECT `v`.`id` AS `companyId`, DATE_FORMAT(`v`.`contractDate`, '%Y-%m-%d %H:%i:%s') AS `contractDate`, `t`.`cost` AS `companyNeedEveryMothPay`" + 
            "\n FROM `mvatc_voicenode` AS `v`" + 
            "\n LEFT JOIN `mvatc_tariffList` AS `t` ON `t`.`id` = `v`.`tariffId`" +            
            where;
    
    sbcDb.query(query, function(err, data) {        
        if (!err) {
            var c =  data[1][0];
        
            if (!data) {
                return res.json({
                    success: false,
                    errors: [cnt.errorDbRead]
                });    
            } else if (typeof c == 'undefined') {
                // BB
                // это значит что в МВТС есть такая компания
                // а у нас в базе ее нет
                //
                return res.json({
                    success: false,
                    errors: [cnt.errorDbRead] 
                });                    
            } else if (c.contractDate == null ||c.contractDate == '' || typeof c.contractDate == 'undefined') {
                return res.json({
                    success: false,
                    errors: ['USER_DATE_CONTRACT_MISSING']
                });                
            } else if (isCompanyWorkFirstMonth(c.contractDate, invoiceDateEnd)) {
                return res.json({
                    success: true,
                    data: invoiceSum
                });
            } else if (parseInt(invoiceSum) < parseInt(c.companyNeedEveryMothPay)) {
                return res.json({
                    success: true,
                    data: c.companyNeedEveryMothPay
                });                    
            } else {
                return res.json({
                    success: true,
                    data: invoiceSum
                });                                    
            }
        } else {
            return res.json({
                success: false,
                errors: [cnt.errorDbRead]
            }); 
        }
    });
});
router.post('/get-company-voip-server-url', function(req, res, next) {
    var mvtsCompanyId = req.body.mvtsCompanyId,
        userGlobalId = req.body.userGlobalId,
        companyId = req.body.companyId,
        userPhone = req.body.userPhone,
        query, where = '';

    if (typeof mvtsCompanyId != 'undefined') {
        where = "\n WHERE `mvtsCompanyId` = '" + mvtsCompanyId + "'";
    } else if (typeof userGlobalId != 'undefined') {
        where = "\n WHERE `globalid` = '" + userGlobalId + "'";
    } else if (typeof companyId != 'undefined') {
        where = "\n WHERE `id` = '" + companyId + "'";
    } else if (typeof userPhone != 'undefined') {
        where = "\n WHERE `ownerPhone` = '" + userPhone + "'";
    } else {
        return res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
    query = "\n USE `miatelSbc`;" + 
            "\n SELECT `voiceipServerUrl`, `voiceipServerIp` FROM `mvatc_voicenode` " +
            where;

    sbcDb.query(query, function(err, data) {
        if (!err) {
            var tmp =  data[1][0];
            
            // BB
            // not math this user. Return false
            //
            if (typeof tmp == 'undefined') {
                return res.json({
                    success: false
                });                
            } else {
                return res.json({
                    success: true,
                    data: tmp
                });
            }
        } else {
            return res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });            
        }
    });
});
router.post('/get-company-list-tree', function(req, res, next) {
    var q = [],
        tree = [],
        companies = [],
        sipUsers = [];
    
    var query = "\n USE `miatelSbc`;"+
                "\n SELECT `id`, 0 AS `parentId`, `companyVersion`, CONCAT(`companyName`, ' (', RTRIM(CONCAT_WS(' ', `ownerFamily`,  `ownerName`, `ownerSurname`)), ')') AS `text`, `globalid` AS `userGlobalId`" +
                "\n FROM `mvatc_voicenode`" +
                "\n ORDER BY `id`;";
        
    sbcDb.query(query, function(err, data) {
        if (!err) {
            var items = [];
            
            for (var i in data[1]) {
                var item = data[1][i];                
                delete item.companyVersion;
                items.push(item);
            }
            res.json({
                success: true,
                data: {
                    tree: {
                        id: 0,
                        text: 'Компании',
                        items: items,
                        parentId: 0
                    }
                }
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }        
    });        
});
router.post('/get-company-list', function(req, res, next) {
    var skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null;
        filter = req.body.filter || null;

    var order = '',
        logic = '',
        where = [];
    
    if (sortDir && sortField)  {
        order = "\n ORDER BY `a`.`" + sortField + "` " + sortDir;
    }
    if (filter && filter != '') {
        var l = filter.logic;

        if (l == 'OR') {
            logic = ' OR ';
        }
        for (var i in filter.filters) {
            var f = filter.filters[i];

            if (f.field == 'userGlobalId') {
                f.field = 'globalid';
            } else if (f.field == 'tariffId') {
                f.field = 'tariffName';
            }
            if (f.operator == 'like') {
                where.push("`a`.`" + f.field + "` LIKE ('" + f.value + "%')");
            } else if (f.operator == "eq") {
                where.push("`a`.`" + f.field + "` LIKE ('%" + f.value + "%')");
            } else {
                where.push("`a`.`" + f.field + "` != '%" + f.value + "%'");
            }
        }
    }
    if (where.length) {
        where = "\n WHERE " + where.join(logic);
    } else {
        where = "";
    }
    var query = "\n USE `miatelSbc`;" +
                "\n SELECT * FROM (" + 
                "\n SELECT `globalid`, `m`.`id`, `userBalance`, `ownerEmail`, `statusContract`, `globalid` AS `userGlobalId`, `activity`, `companyAction`, `companyForm`, `companyName`, `companyVersion`, `companyWorkerCount`, CONCAT_WS(' ', `ownerFamily`,  `ownerName`, `ownerSurname`) AS `owner`,  `ownerPhone`, `phoneList`, `tariffId`, `userRole`, CONCAT_WS(' ', `directorFamily`, `directorName`,  `directorSurname`) AS `director`" +
                "\n , `directorEmail`, `directorPhone`, "+
                "\n (SELECT `r`.`name` FROM `mvatc_tariffList` AS `r` WHERE `r`.`id` = `m`.`tariffId`) AS `tariffName`" +
                "\n FROM `mvatc_voicenode` AS `m`" +
                "\n ) AS `a`" +
                where + 
                order + 
                "\n LIMIT " + skip + ", " + take + '; '+
                "\n SELECT COUNT(*) AS `total` FROM (" +
                "\n SELECT `globalid`, `m`.`id`, `userBalance`, `ownerEmail`, `statusContract`, `globalid` AS `userGlobalId`, `activity`, `companyAction`, `companyForm`, `companyName`, `companyVersion`, `companyWorkerCount`, CONCAT_WS(' ', `ownerFamily`,  `ownerName`, `ownerSurname`) AS `owner`,  `ownerPhone`, `phoneList`, `tariffId`, `userRole`, CONCAT_WS(' ', `directorFamily`, `directorName`,  `directorSurname`) AS `director`" +
                "\n , `directorEmail`, `directorPhone`, "+
                "\n (SELECT `r`.`name` FROM `mvatc_tariffList` AS `r` WHERE `r`.`id` = `m`.`tariffId`) AS `tariffName`" +
                "\n FROM `mvatc_voicenode` AS `m`" +
                "\n ) AS `a`" +
                where;

    sbcDb.query(query, function(err, data) {
        var query = [];

        if (!err) {            
            for (var i in data[1]) {
                var r = data[1][i],
                    q = "\n USE " + r.userGlobalId + ";" +
                        "\n SELECT '" + r.userGlobalId + "' AS `userGlobalId`, DATE_FORMAT(`calldate`, '%Y-%m-%d %H:%i:%s') AS `calldate` FROM `cdr` ORDER BY `calldate` LIMIT 1;";
                
                query.push(q);
            }
            voiceipDb.query(query.join(''), function(err, results) {
                var calldates = {};
                
                for (var i in results) {
                    var r = results[i];
                    
                    if (i % 2 != 0) {
                        if (typeof r[0] != 'undefined') {
                            calldates[r[0]['userGlobalId']] = r[0]['calldate'];
                        }
                    }
                }
                for (var i in data[1]) {
                    var r = data[1][i];

                    data[1][i]['lastCallDate'] = calldates[r.userGlobalId];
                }
                res.json({
                    success: true,
                    data: {
                        list: data[1],
                        total: data[2][0]['total']
                    }
                });                 
            });  
        } else {
             res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });    
});
router.post('/get-company', function(req, res, next) {
    /**
     * BB
     * Можно получить информацию о компании передав ее идентификатор id
     * или userGlobalId
     * 
     */
    var id = req.body.id,
        userGlobalId = req.body.userGlobalId;
        
    if (id == 0) {
        res.json({
            success: true,
            data: {
                id: 0,
                subject: 'Компании'
            }
        });         
    } else {
        var where = '';
        
        if (userGlobalId) {
            where = "\n WHERE `globalid` = '" + userGlobalId + "';";
        } else {
            where = "\n WHERE `id` = '" + id + "';";
        }
        var query = "\n USE `miatelSbc`;"+
                    "\n SELECT `clientId`,`notifyEmail`, `notifyPhone`, `m`.`id`, `globalid` AS `userGlobalId`, `activity`, `companyAction`, `companyForm`, `companyName`, `companyVersion`, `companyWorkerCount`, `ownerFamily`, `ownerName`, `ownerPhone`, `ownerEmail`, `ownerSurname`,  `phoneList`, `tariffId`, `userBalance`, `userRole`, `contractNumber`, `partnerId`, `fileUrlContract` AS `contractFileUrl`, `esignFileUrl`, `statusContract` AS  `contractStatus`, `voiceipServerUrl`, `directorName`, `directorSurname`, `directorFamily`, `directorPhone`, `directorEmail`, `companyQuality`, " +
                    "\n (SELECT `r`.`name` FROM `mvatc_tariffList` AS `r` WHERE `r`.`id` = `m`.`tariffId`) AS `tariffName`"+
                    "\n FROM `mvatc_voicenode` AS `m`" +
                    where;

        sbcDb.query(query, function(err, data) {
            if (!err) {
                if (data[1].length) {
                    var company = data[1][0];

                    var query = "\n USE `miatelVoice`;" + 
                                "\n SELECT *, DATE_FORMAT(`ownerDateOfBirth`, '%Y-%m-%d %H:%i:%s') AS `ownerDateOfBirth`, DATE_FORMAT(`ownerPassportDate`, '%Y-%m-%d %H:%i:%s') AS `ownerPassportDate` FROM `mvatc_voicenodeMoreData` WHERE `globalid` = '" + company.userGlobalId + "';";
                    
                    voiceipDb.query(query, function(err, data) {
                        if (!err) {
                            var detail = data[1][0];
                            
                            for (var key in detail) {
                                if (key != 'id')  {
                                    company[key] = detail[key];
                                }
                            }
                            company['companyName'] = u.getQuoteToHtmlStr(company['companyName']);
                            
                            res.json({
                                success: true,
                                data: company
                            });
                        } else {
                            res.json({
                                success: false,
                                errors: [cnt.errorDbRead]
                            });                            
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbRead]
                    });                    
                }
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorDbRead]
                });
            }
        });        
    }      
});
router.post('/update-company', function(req, res, next) {
    var id = req.body.id,
        set = [];
    
    var obj = {
        companyAction: req.body.companyAction,
        companyForm: req.body.companyForm,        
        companyName: u.getHtmlToQuoteStr(req.body.companyName),
        companyWorkerCount: req.body.companyWorkerCount,
        ownerEmail: u.getHtmlToQuoteStr(req.body.ownerEmail),
        ownerFamily: u.getHtmlToQuoteStr(req.body.ownerFamily),
        ownerName: u.getHtmlToQuoteStr(req.body.ownerName),
        ownerPhone: u.getHtmlToQuoteStr(req.body.ownerPhone),
        ownerSurname: u.getHtmlToQuoteStr(req.body.ownerSurname),
        tariffId: req.body.tariffId,
        partnerId: req.body.partnerId,
        directorName: u.getHtmlToQuoteStr(req.body.directorName),
        directorSurname: u.getHtmlToQuoteStr(req.body.directorSurname),
        directorFamily: u.getHtmlToQuoteStr(req.body.directorFamily),
        directorEmail: u.getHtmlToQuoteStr(req.body.directorEmail),
        directorPhone: u.getHtmlToQuoteStr(req.body.directorPhone),
        notifyEmail: u.getHtmlToQuoteStr(req.body.notifyEmail) || '',
        notifyPhone: u.getHtmlToQuoteStr(req.body.notifyPhone) || ''
    };
    if (obj.partnerId == 'undefined' || obj.partnerId == 'null' || obj.partnerId == '') {
        obj.partnerId = null;
    }    
    if (typeof obj.ownerPhone != 'undefined') {
        obj.ownerPhone = obj.ownerPhone.replace('(', '').replace(')', '');
    }    
    for (var key in obj) {
        var value = obj[key];
        
        if (typeof value != 'undefined') {
            set.push("`" + key + "`='" + value + "'");
        }
    }    
    var query = "\n USE `miatelSbc`;"+
                "\n UPDATE `mvatc_voicenode` " +
                "\n SET " + set.join(', ')  +
                "\n WHERE `id` = '" + id + "'";

    sbcDb.query(query, function(err) {
        if (!err) {
            res.json({
                success: true
            });
            var q = [],
                ownerPassportDetail = "номер " + req.body.companyPassport + " выдан " + req.body.ownerPassportIssued + " код подразделения " + req.body.ownerPassportCode + " дата выдачи " + req.body.ownerPassportDate,
                companyBankDetail = "Номер счета в банке: " + req.body.companyBankAccount +" Наименование банка: " + req.body.companyBankName + " КОРСЧЕТ банка: " + req.body.companyBankKorAccount + " БИК банка: " + req.body.companyBik,
                obj = {
                    companyInn: req.body.companyInn,
                    companyKpp: req.body.companyKpp,
                    companyOgrn: req.body.companyOgrn,
                    companyRealCountry: req.body.companyRealCountry,
                    companyRealCity: req.body.companyRealCity,
                    companyRealIndex: req.body.companyRealIndex,
                    companyRealStreet: req.body.companyRealStreet,
                    companyRealHouse: req.body.companyRealHouse,
                    companyPostCountry: req.body.companyPostCountry,
                    companyPostCity: req.body.companyPostCity,
                    companyPostIndex: req.body.companyPostIndex,
                    companyPostStreet: req.body.companyPostStreet,
                    companyPostHouse: req.body.companyPostHouse,
                    companyBankAccount: req.body.companyBankAccount,
                    companyBankName: req.body.companyBankName,
                    companyBankKorAccount: req.body.companyBankKorAccount,
                    companyBik: req.body.companyBik,
                    companyPassport: req.body.companyPassport,
                    ownerDateOfBirth: req.body.ownerDateOfBirth,
                    ownerPlaceOfBirth: req.body.ownerPlaceOfBirth,
                    ownerPassportIssued: req.body.ownerPassportIssued,
                    ownerPassportDate: req.body.ownerPassportDate,
                    ownerPassportCode: req.body.ownerPassportCode,
                    ownerAddress: req.body.ownerAddress,
                    ownerPassportDetail: ownerPassportDetail,
                    companyBankDetail: companyBankDetail,
                    companyPassportFileUrl1: req.body.companyPassportFileUrl1,
                    companyPassportFileUrl2: req.body.companyPassportFileUrl2
                };
            
            for (var key in obj) {
                var value = obj[key];
                
                if (typeof value != 'undefined') {
                    q.push("`" + key + "` = '" + value + "'");
                }
            }
            var query = "\n USE `miatelVoice`;" +
                        "\n UPDATE `mvatc_voicenodeMoreData` " +
                        "\n SET " + q.join(", ")  +
                        "\n WHERE `globalid` = '" + req.body.userGlobalId + "'";

            voiceipDb.query(query, function(err, resp) {
                if (err) {

                }
                // WTF ?? 
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    }); 
});
router.post('/get-inner-user-list', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,        
        skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake;
    
    var query = "\n USE `miatelSbc`;"+
                "\n SELECT `globalid` AS `userGlobalId`, `phoneList`, `userRole`, `ownerEmail` FROM `mvatc_voicenode` WHERE `id` = '" + id + "';";
    
    sbcDb.query(query, function(err, data) {
        if (!err) {
            var user = data[1][0],
                order = '';
            
            if (sortDir && sortField)  {
                order = "\n ORDER BY `" + sortField + "` " + sortDir;
            }                     
            var query = "\n USE `" + user.userGlobalId + "`;" +
                        "\n SELECT `id`, `globalid` AS `userGlobalId`, `domid` AS `domElementId`, `name` AS `userFullName`, `num` AS `innerPhoneNumber`, '" + user.ownerEmail + "' AS `userEmail`, `cellphone` AS `userMobilePhone`, " +
                        "\n `roumingphone` AS `userRomingNumber`, `cityphone` AS `phoneAon`, '" + user.phoneList + "' AS `phoneAonList`, '" + user.userRole + "' AS `userRole`,  `timewait` AS `phoneCallUpTime`, `redirect` AS `phoneRedirect`, `record` AS `phoneTalkRec` " +
                        "\n FROM `users` WHERE `domid` IS NOT NULL AND `type` = 'inner-user'" +
                        order +
                        "\n LIMIT " + skip + ", " + take +";" +
                        "\n SELECT COUNT(*) AS `total` FROM `users` WHERE `domid` IS NOT NULL AND `type` = 'inner-user';"

            voiceipDb.query(query, function(err, data) {
                if (!err) {
                    res.json({
                        success: true,
                        data: {
                            list: data[1],
                            total: data[2][0]['total']
                        }
                    });             
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbRead]
                    });
                }
            });             
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });
   
});
router.post('/get-inner-user', function(req, res, next) {
    var id = req.body.id;
    
    if (id) {
        var companyId = id.split('-')[0],
            sipUserId = id.split('-')[1];

        var query = "\n USE `miatelSbc`;"+
                    "\n SELECT `globalid` AS `userGlobalId`, `phoneList`, `userRole` FROM `mvatc_voicenode` WHERE `id` = '" + companyId + "';";

        sbcDb.query(query, function(err, data) {
            if (!err) {
                var user = data[1][0];

                var query = "\n USE `" + user.userGlobalId + "`;" +
                             "\n SELECT `id`, `globalid` AS `userGlobalId`, `domid` AS `domElementId`, `name` AS `userFullName`, `num` AS `innerPhoneNumber`, `mail` AS `userEmail`, `cellphone` AS `userMobilePhone`, " +
                             "\n `roumingphone` AS `userRomingNumber`, `cityphone` AS `phoneAon`, '" + user.phoneList + "' AS `phoneAonList`, '" + user.userRole + "' AS `userRole`,`timewait` AS `phoneCallUpTime`, `redirect` AS `phoneRedirect`, `record` AS `phoneTalkRec` " +
                             "\n FROM `users` WHERE `domid` IS NOT NULL AND `id` = '" + sipUserId +"'";

                voiceipDb.query(query, function(err, data) {
                    if (!err) {
                        res.json({
                            success: true,
                            data: data[1][0]
                        });                      
                    } else {
                        res.json({
                            success: false,
                            errors: [err]
                        });
                    }
                });          
            } else {
                res.json({
                    success: false,
                    errors: [err]
                });
            }
        });          
    } else {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        }); 
    } 
});
router.post('/update-inner-user', function(req, res, next) {
    var id = req.param('id'),
        userFullName = req.param('userFullName'),
        userGlobalId = req.param('userGlobalId'),
        innerPhoneNumber = req.param('innerPhoneNumber'),
        userMobilePhone = req.param('userMobilePhone'),
        userEmail = req.param('userEmail'),
        userRomingNumber = req.param('userRomingNumber'),
        userRole = req.param('userRole'),
        phoneCallUpTime = req.param('phoneCallUpTime'),
        phoneAon = req.param('phoneAon'),
        phoneTalkRec = req.param('phoneTalkRec'),
        phoneRedirect = req.param('phoneRedirect'),        
        userHash = req.param('userHash');
    
    var query = "\n USE `" + userGlobalId + "`;" +
                "\n UPDATE `users` " +
                "\n SET `name` = '" + userFullName +"', `num` = '" + innerPhoneNumber + "', `cellphone` = '" + userMobilePhone + "', " +
                "\n `roumingphone` = '" + userRomingNumber + "', `timewait` = '" + phoneCallUpTime + "', `cityphone` = '" + phoneAon + "', `record` = '" + phoneTalkRec+ "', " +
                "\n `redirect` = '" +phoneRedirect + "', `mail` = '" + userEmail + "'" + 
                "\n WHERE `id` = '" + id + "'";

    voiceipDb.query(query, function(err, data) {
        if (!err) {
            var query = "\n USE `miatelSbc`;"+
                        "\n UPDATE `mvatc_voicenode` SET `userRole` = '" + userRole + "' WHERE `globalid` = '" + userGlobalId + "'";
                
            sbcDb.query(query, function(err) {
                if (!err) {
                    res.json({
                        success: true,
                        data: {
                            id: id,
                            userRole: userRole,
                            userFullName: userFullName,
                            userGlobalId: userGlobalId,
                            innerPhoneNumber: innerPhoneNumber,
                            userMobilePhone: userMobilePhone,
                            userEmail: userEmail,
                            userRomingNumber: userRomingNumber,
                            phoneCallUpTime: phoneCallUpTime,
                            phoneAon: phoneAon,
                            phoneTalkRec: phoneTalkRec,
                            phoneRedirect:  phoneRedirect
                        }
                    });                      
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbWrite]
                    });
                }                 
            });            
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });   
});
router.post('/add-tariff', function(req, res, next) {
    var userHash = req.body.userHash,
        mvtsRatePlanId = req.body.mvtsRatePlanId || req.body['mvtsRatePlanId[id]'] || '',
        active = req.body.active || req.body.active.value,
        color = req.body.color || req.body.color.text,
        cost = req.body.cost,
        descr = req.body.descr,
        name = req.body.name;
    
    var query = "\n INSERT INTO `mvatc_tariffList` (`id`, `mvtsRatePlanId`, `name`, `cost`, `descr`, `color`, `active`)" +
                "\n VALUES (null, '" + mvtsRatePlanId + "', '" + name + "', '" + cost + "', '" + descr + "', '" + color+ "', '" + active +"'); ";

    wwwDb.query("\n USE `miatel_net`;" + query, function(err, result) {
        if (!err) {
            
            // BB
            // id must by equal between another table, another database!
            //
            var lastInsertId = result[1].insertId,
                query = "\n INSERT INTO `mvatc_tariffList` (`id`, `mvtsRatePlanId`, `name`, `cost`, `descr`, `color`, `active`)" +
                        "\n VALUES ('" + lastInsertId + "', '" + mvtsRatePlanId + "', '" + name + "', '" + cost + "', '" + descr + "', '" + color+ "', '" + active +"'); ";
                
            sbcDb.query("\n USE `miatelSbc`;" + query, function(err, result) {
                if (!err) {
                    res.json({
                        success: true,
                        data: {
                            id: lastInsertId,
                            mvtsRatePlanId: mvtsRatePlanId ,
                            name: name,
                            color: color,
                            cost: cost,
                            descr: descr,
                            active: active
                        }
                    });                                        
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbWrite]
                    });                    
                }
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    }); 
});
router.post('/del-tariff', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id;
        
    var query = "\n DELETE FROM `mvatc_tariffList` WHERE `id` = '" + id +"'";
        
        wwwDb.query("\n USE `miatel_net`;" + query, function(err, result) {
            if (!err) {
                sbcDb.query("\n USE `miatelSbc`;" + query, function(err, result) {
                    if (!err) {
                        res.json({
                            success: true,
                            data: {
                                id: id
                            }
                        });                        
                    } else {
                        res.json({
                            success: false,
                            errors: [cnt.errorDbWrite]
                        });
                    }
                });
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            }
        });
});
router.post('/update-tariff', function(req, res, next) {
    var id = req.body.id,
        set = [];
    
    var obj = {
        active: req.body.active || 1, // 1 - active
        color: req.body.color,
        mvtsRatePlanId: req.body.mvtsRatePlanId || req.body.mvtsRatePlanId.id,
        cost: req.body.cost,
        descr: req.body.descr,
        name: req.body.name
    };
    for (var key in obj) {
        var value = obj[key];
        
        if (typeof value != 'undefined') {
            set.push("`" + key + "` = '" + value + "'" );
        }
    };    
    var query = "\n UPDATE `mvatc_tariffList` "+
                "\n SET " + set.join(', ') +
                "\n WHERE `id` = '" + id + "';";

    wwwDb.query("\n USE `miatel_net`;" + query, function(err, data) {
        if (!err) {      
            sbcDb.query("\n USE `miatelSbc`;" + query, function(err, data) {
                if (!err) {
                    obj.id = id;

                    res.json({
                        success: true,
                        data: obj
                    });                    
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbWrite]
                    });                    
                }
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });    
});
router.post('/get-tariff-list-tree', function(req, res, next) {
    var query = "\n USE `miatel_net`;" +
                "\n SELECT `id`, `name` AS `text`, '0' AS `parentId` FROM `mvatc_tariffList`;";
        
    wwwDb.query(query, function(err, data) {
        if (!err) {            
            res.json({
                success: true,
                data: {
                    tree: {
                        id: 0,    
                        text: 'Тарифы',
                        items: data[1],
                        parentId: 0                                      
                    }
                }
            });                    
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });            
        }
    });        
});
router.post('/get-tariff-list', function(req, res, next) {  
    var userHash = req.body.userHash,
        skip = req.body.skip || 0,
        take = req.body.take || cnt.defaultTake,   
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '';
        
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }
    var query = "\n USE `miatelSbc`;" +
                "\n SELECT `id`, `mvtsRatePlanId`, `name`, `color`, `cost`, `active`, `descr`, "+
                "\n (SELECT COUNT(`tariffId`) FROM `mvatc_voicenode` WHERE  `tariffId` != '' AND `tariffId` = `m`.`id`) AS `quantityUse`" +
                "\n FROM `mvatc_tariffList` AS `m` "+
                order +
                "\n LIMIT " + skip + ", " + take + '; ' +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_tariffList`;";

    sbcDb.query(query, function(err, data) {
        if (!err) {            
            res.json({
                success: true,
                data: {
                    list: data[1],
                    total: data[2][0]['total']
                }
            });                    
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });  
        }
    });    
});
router.post('/get-tariff', function(req, res, next) {
    var tariffId = req.body.id || req.body.tariffId;
    
    var query = "\n USE `miatelSbc`;" +
                "\n SELECT `id`, `mvtsRatePlanId`, `name`, `color`, `cost`, `active`, `descr`" +
                "\n FROM `mvatc_tariffList`" +
                "\n WHERE `id` = '" + tariffId +"'";

    sbcDb.query(query, function(err, data) {
        if (!err) {            
            res.json({
                success: true,
                data: data[1][0]
            });                    
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            }); 
        }
    });    
});
router.post('/get-tariff-company-use-list', function(req, res, next) {
    var obj = {
        id: req.body.id || req.body.tariffId,
        userHash: req.body.userHash,
        skip: parseInt(req.body.skip) || 0,
        take: parseInt(req.body.take) || cnt.defaultTake,
        sortField: req.body.sort && req.body.sort.field || null,
        sortDir: req.body.sort && req.body.sort.dir || null
    };
    var order = '';
    
    if (obj.sortDir && obj.sortField)  {
        order = "\n ORDER BY `m`.`" + obj.sortField + "` " + sortDir;
    } 
    var query = "\n USE `miatel`;"+
                "\n SELECT `m`.`id`, `globalid` AS `userGlobalId`, `activity`, `companyAction`, `companyForm`, `companyName`, `companyVersion`, `companyWorkerCount`, `ownerFamily`, `ownerName`, `ownerPhone`, `ownerSurname`,  `phoneList`, `tariffId`, `userBalance`, `userRole`, " +
                "\n (SELECT `r`.`name` FROM `mvatc_tariffList` AS `r` WHERE `r`.`id` = `m`.`tariffId`) AS `tariffName`"+
                "\n FROM `mvatc_voicenode` AS `m`" +
                "\n WHERE `tariffId` = '" + obj.id + "'" +
                order +
                "\n LIMIT " + obj.skip + ", " + obj.take + '; '+
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_voicenode` WHERE `tariffId` = '" + obj.id + "';"

    sbcDb.query(query, function(err, data) {  
        if (!err) {
            res.json({
                success: true,
                data: {
                    list: data[1],
                    total: data[2][0]['total']
                }
            });             
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });        
});
router.post('/get-chime-list-tree', function(req, res, next) {
    var userHash = req.body.userHash;
    
    var query = "\n USE `miatelSbc`;"+
                "\n SELECT `id`, CONCAT(`companyName`, ' (', RTRIM(CONCAT_WS(' ', `ownerFamily`,  `ownerName`, `ownerSurname`)), ')') AS `text`" +
                "\n FROM `mvatc_voicenode`" +
                "\n ORDER BY `id`;";
        
    sbcDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    tree: {
                        id: 0,    
                        text: 'Схемы',
                        items: data[1],
                        parentId: 0                                      
                    }
                }
            });             
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });
});
router.post('/get-mcc-user-list', function(req, res, next) {
    /**
     * This method is old
     * replace into get-member-list
     * 
     * @type String
     */
    var query = "\n SELECT `id`, `name`, `login`, `email` FROM `Users`;" +
                "\n SELECT COUNT(*) AS `total` FROM `Users`";
    
    tasksDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    list: result[0],
                    total: result[1][0].total
                }
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });            
        }
    });
});
router.post('/get-mcc-section-tree', function(req, res, next) {
    res.json({
        success: true,
        data: {
            list: [{
                id: 1,
                name: 'Полный доступ',
                section: 'Полный доступ'
            },{
                id: 2,
                name: 'Сотрудники',
                section: 'Миател'
            },{
                id: 3,
                name: 'Задачи',
                section: 'Миател'
            },{
                id: 4,
                name: 'Сайт',
                section: 'Миател'
            },{
                id: 5,
                name: 'Клиенты',
                section: 'Виртуальная АТС'
            },{
                id: 6,
                name: 'Компании',
                section: 'Виртуальная АТС'
            },{
                id: 7,
                name: 'Телефоны',
                section: 'Виртуальная АТС'
            },{
                id: 8,
                name: 'Тарифы',
                section: 'Виртуальная АТС'
            },{
                id: 9,
                name: 'Схемы',
                section: 'Виртуальная АТС'
            },{
                id: 10,
                name: 'Свойства',
                section: 'Виртуальная АТС'
            },{
                id: 11,
                name: 'Сервера',
                section: 'Виртуальная АТС'
            },{
                id: 12,
                name: 'Белые списки',
                section: 'Транзитная АТС'
            },{
                id: 13,
                name: 'CDR',
                section: 'Транзитная АТС'
            },{
                id: 14,
                name: 'Ителлектуальная подмена номеров',
                section: 'Транзитная АТС'
            },{
                id: 15,
                name: 'Черные списки',
                section: 'Транзитная АТС'
            },{
                id: 16,
                name: 'MVTS',
                section: 'Транзитная АТС'
            },{
                id: 17,
                name: 'CRM',
                section: 'Транзитная АТС'
            }]
        }
    });
});
module.exports = function(io, settings) {
    commonSocket = io;
    tasksDb = db = mysql.createConnection(settings.tasksDb);
    voiceipDb = mysql.createConnection(settings.voiceipDb);    
    wwwDb = mysql.createConnection(settings.wwwDb);
    sbcDb = mysql.createConnection(settings.sbcDb);    
    u.handleDisconnect(tasksDb);
    u.handleDisconnect(voiceipDb);
    u.handleDisconnect(wwwDb);
    u.handleDisconnect(sbcDb);         
    
    io.on('connection', function(socket) {
        socket.emit('api-socket-ready');
        localSocket = socket;
    });   
    return router;
};