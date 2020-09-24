var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    u = require('../util'),
    commonSocket,
    localSocket = null;

var updateParentClient= function(parentClientId) {
    var query = "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`clientInspectorId`, `t`.`subject`, `t`.`ClientOwnerId`, DATE_FORMAT(`t`.`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, `t`.`parentClientId`, `t1`.`subject` AS `parentClientSubject`"  +
                "\n FROM `Clients` AS `t` " +
                "\n LEFT JOIN `Clients` AS `t1` ON `t1`.`id` = `t`.`parentClientId`" +
                "\n WHERE `t`.`parentClientId` = '" + parentClientId +"'";
        
    tasksDb.query(query, function(err, data) {
        if (!err) {            
            var query = "\n UPDATE `Clients` SET `hasChildren` = 1 WHERE `id` = '" + parentClientId+ "';"+
                        "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`clientOwnerId`, `t`.`subject`, `t`.`clientOwnerId`, DATE_FORMAT(`t`.`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, `t`.`parentClientId`, `t1`.`subject` AS `parentClientSubject`"  +
                        "\n FROM `Clients` AS `t` " +
                        "\n LEFT JOIN `Clients` AS `t1` ON `t1`.`id` = `t`.`parentClientId`" +
                        "\n WHERE `t`.`id` = '" + parentClientId +"'";                

            tasksDb.query(query, function(err, data) {
                if (!err && commonSocket) {
                    commonSocket.emit('update-client', data[1][0]);
                }
            });            
        }
    }); 
}
var resetParentClientGroupStatus = function(parentClientId) {
    var query = "\n UPDATE `Clients` SET `hasChildren` = 0, `status` = 'Новая' WHERE `id` = '" + parentClientId + "';" +
                "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`clientInspectorId`, `t`.`subject`, `t`.`describe`, `t`.`status`, `t`.`priority`, `t`.`clientAuthorId`, `t`.`clientExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentClientId`, `t1`.`subject` AS `parentClientSubject`"  +
                "\n FROM `Clients` AS `t` " +
                "\n LEFT JOIN `Clients` AS `t1` ON `t1`.`id` = `t`.`parentClientId`" +
                "\n WHERE `t`.`id` = '" + parentClientId +"';";                    

    tasksDb.query(query, function(err, result) {
        if (!err) {
            if (commonSocket) {
                var data = result[1][0];
                commonSocket.emit('update-client', data);
            }                
        } else {

        }            
    });
}; 

router.post('/notify-lockout-client', function(req, res, next) {
    var clientPhone = req.body.clientPhone;
    
    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                var client = result[1][0];

                commonSocket.emit('notify-lockout-client', {
                    clienName: client.subject, 
                    clientId: client.id
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
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/notify-invoice-send', function(req, res, next) {
    var clientPhone = req.body.clientPhone;

    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                commonSocket.emit('notify-invoice-send', result[1][0]);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/notify-change-balance', function(req, res, next) {
    var clientPhone = req.body.clientPhone,
        currentBalance = req.body.currentBalance;

    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                var client = result[1][0];

                commonSocket.emit('notify-change-balance', {
                    clienName: client.subject, //<-- переименовать!!!
                    clientId: client.id,
                    clientBalance: currentBalance
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
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/notify-account-make-error', function(req, res, next) {
    var userGlobalId = req.body.userGloobalId,
        companyId = req.body.clientId;
        
    commonSocket && commonSocket.emit('notify-account-make-error', {
        userGlobalId: userGlobalId,
        companyId: companyId
    });
    res.json({
        success: true
    });
});
router.post('/notify-client-money-end', function(req, res, next) {
    var clientPhone = req.body.clientPhone;

    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                commonSocket.emit('notify-client-money-end', result[1][0]);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/notify-client-phone-reserved', function(req, res, next) {
    var clientPhone = req.body.clientPhone,
        message = req.body.message;

    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                var data = result[1][0];
                data.message = message;
                
                commonSocket.emit('notify-client-phone-reserved', data);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/add-client-call', function(req, res, next) {
    var clientPhone = req.body.clientPhone;

    if (commonSocket && clientPhone) {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientPhone` = '" + clientPhone + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                commonSocket.emit('client-call', result[1][0]);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: true
        });
    }
});
router.post('/add-client-pay', function(req, res, next) {
    var clientGlobalId = req.body.clientGlobalId,
        sum = req.body.sub;

    if (typeof clientGlobalId != 'undefined') {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientGlobalId` = '" + clientGlobalId + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                var data = result[1][0];
                data.paySum = sum;

                commonSocket.emit('client-pay', data);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/add-client-contract-data', function(req, res, next) {
    var clientGlobalId = req.body.clientGlobalId;

    if (typeof clientGlobalId != 'undefined') {
        var query = "\n USE `tasks`;" +
                    "\n SELECT * FROM `Clients` WHERE `clientGlobalId` = '" + clientGlobalId + "' LIMIT 1";

        tasksDb.query(query, function(err, result) {
            if (!err) {
                var data = result[1][0];

                commonSocket.emit('notify-client-contract-filled', data);
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false
                });
            }
        });
    } else {
        res.json({
            success: false
        });
    }
});
router.post('/get-client-list-tree', function(req, res, next) {
    var globalUserClientRead = 1,
        where = [];

    var params = {
        clientOwnerId: req.body.clientOwnerId,
        clientStatus: req.body.clientStatus
    };    
    for (var key in params) {
        if (typeof params[key] != 'undefined') {
            where.push("`t`.`" + key + "` = '" + params[key] +"'");
        }
    }
    if (where.length) {
        where = "\n WHERE `t`.`hasChildren` = 1 OR (" + where.join(' AND ') + ")";
    }
    var query = "\n  SELECT `t`.`id`, `t`.`clientStatus` AS `status`,`t`.`hasChildren`, `t`.`subject` AS `text`, `t`.`parentClientId` AS `parentId`, " +
                "\n (SELECT `tr`.`id` FROM `ClientsUserRead` AS `tr` WHERE `tr`.`clientId` = `t`.`id` AND `tr`.`userId` = '1' LIMIT 1) AS `userClientRead`" + 
                "\n FROM `Clients` AS `t` " +
                where + 
                "\n ORDER BY `t`.`parentClientId` ASC";

    tasksDb.query(query, function(err, rows) {
        if (!err) {
            var tmp = {},
                tree = [];

            for (var i in rows) {
                var el = rows[i];
                
                if (el.userClientRead == null) {
                    el.userClientRead = 0;
                } else {
                    el.userClientRead = 1;
                }
                tmp[el.id] = el;

                if (el.userClientRead == 0) {
                    globalUserClientRead = 0;
                }
            }
            for (var j in tmp) {
                var el = tmp[j];
                
                if (el.parentId == 0) {
                    tree.push(el);                    
                } else  {
                    if (typeof tmp[el.parentId] != 'undefined') {
                        if (typeof tmp[el.parentId]['items'] == 'undefined') {
                            tmp[el.parentId]['items'] = [];
                        }
                        tmp[el.parentId]['items'].push(el);
                    }
                }
            }                        
            if (rows.length) {
                res.json({
                    success: true,
                    data: {
                        tree: {
                            id: 0,    
                            text: 'Клиенты',
                            items: tree,
                            userClientRead: globalUserClientRead,
                            parentId: 0
                        }
                    }
                });                            
            } else {
                res.json({
                    success: true,
                    data: {
                        tree: {
                            id: 0,    
                            text: 'Клиенты',
                            parentId: 0
                        }
                    }
                });                                            
            }
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });
});
router.post('/get-client-list', function(req, res, next) {
    var clientId = req.body.clientId,
        skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        filter = req.body.filter || null;
        
    var order = '',
        logic = '',
        where = ["`t`.`parentClientId` = '" + clientId + "'"];        
        
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }
    if (filter && filter != '') {
        var l = filter.logic;

        if (l == 'OR') {
            logic = ' OR ';
        } else {
            logic = ' AND ';
        }
        for (var i in filter.filters) {
            var f = filter.filters[i];

            if (f.operator == 'like') {
                where.push("`t`.`" + f.field + "` LIKE ('" + f.value + "%')");
            } else if (f.operator == "eq") {
                where.push("`t`.`" + f.field + "` LIKE ('%" + f.value + "%')");
            } else {
                where.push("`t`.`" + f.field + "` != '%" + f.value + "%'");
            }
        }
    }
    if (!logic) {
        logic = ' AND ';
    }
    if (where.length) {
        where = "\n WHERE " + where.join(logic);
    } else {
        where = "";
    }
    var query = "\n SELECT `t`.`clientPhone`, `t`.`partnerCode`, `t`.`id`, `t`.`hasChildren`, `t`.`clientInspectorId`,`t`.`subject`, `t`.`clientStatus`, `t`.`clientOwnerId`, DATE_FORMAT(`t`.`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, `t`.`parentClientId` AS `parentId`,  " +
                "\n (SELECT `name` FROM `Members` WHERE `id` = `t`.`clientOwnerId`) AS `clientOwnerName`," +
                "\n (SELECT COUNT(*) FROM `Clients` AS `c` WHERE `c`.`parentClientId` = `t`.`id`) AS `clientTotal`" +
                "\n FROM `Clients` AS `t`" +
                where + 
                order +
                "\n LIMIT " + skip + ", " + take + '; '+
                "\n SELECT COUNT(*) AS `total` FROM `Clients` AS `t` " + where;

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var total = result[1][0]['total'],
                list = result[0];
              
            res.json({
                success: true,
                data: {
                    list: list,
                    total: total
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
router.post('/get-client-comment-list', function(req, res, next) {
    var clientId = req.body.clientId;
    var query = "\n SELECT `t`.`id`, `t`.`commentAuthorId`, `t`.`comment`, `t`.`clientId`, DATE_FORMAT(`t`.`commentDate`, '%Y-%m-%d %H:%i:%s') AS `commentDate`, `u`.`name` AS `commentAuthorName` FROM `ClientsComment` AS `t`  JOIN `Members` AS `u` ON `u`.`id` = `t`.`commentAuthorId` WHERE `t`.`clientId` = '" + clientId + "' ORDER BY `commentDate`;" +
                "\n SELECT COUNT(*) AS `total` FROM `ClientsComment` WHERE `clientId` = '" + clientId +"'";

    tasksDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    list: data[0],
                    total: data[1][0].total
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
router.post('/get-client', function(req, res, next) {
    var clientId = req.body.clientId;
    
    if (clientId == 0) {
        res.json({
            success: true,
            data: {
                id: 0,
                hasChildren: 1,
                partnerCode: '',
                subject: 'Клиенты',
                clientStatus: 'enable',   
                clientEmail: '',
                clientAuthorId: 1,
                clientOwnerId: 1,
                clientInspectorId: 1,
                registerDatetime: "2015-00-00 00:00:00", //<-- date of start project
                clientPhone: '',
                clientGlobalId: ''
            }
        });         
    } else {
        var query = "\n SELECT `t`.`clientStatus`,`t`.`partnerCode`, `t`.`hasChildren`, `t`.`id`, `t`.`clientInspectorId`, `t`.`subject`, `t`.`clientOwnerId`, DATE_FORMAT(`t`.`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, `t`.`parentClientId`, `t`.`clientPhone`, `t`.`clientGlobalId`,`t1`.`subject` AS `parentClientSubject`, `t`.`clientEmail`"  +
                    "\n FROM `Clients` AS `t` " +
                    "\n LEFT JOIN `Clients` AS `t1` ON `t1`.`id` = `t`.`parentClientId`" +
                    "\n WHERE `t`.`id` = '" + clientId +"'";

        tasksDb.query(query, function(err, data) {
            if (!err) {
                var client = data[0];

                if (typeof client == 'undefined') {
                    res.json({
                        success: true,
                        data: client
                    });                    
                } else if (typeof client.clientGlobalId != 'undefined') {
                    var query = "\n SELECT `id` FROM `mvatc_voicenode` WHERE `globalid` = '" + client.clientGlobalId + "'";
                    
                    sbcDb.query(query, function(err, data) {                  
                        if (!err) {
                            if (data && data.length) {
                                client.clientCompanyId = data[0]['id'];
                            }
                            res.json({
                                success: true,
                                data: client
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
                        success: true,
                        data: client
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
router.post('/add-client', function(req, res, next) {   
    var userId = u.getUserIdFromHash(req.body.userHash),
        userName = u.getActiveUserName(req.body.userId, req.session.users);

    var userHash = req.body.userHash || '';
        partnerCode = req.body.partnerCode || '',
        subject = req.body.subject,
        registerDatetime = u.getCurrentDate(),
        parentClientId = req.body.parentClientId || 0,        
        clientStatus = req.body.clientStatus,
        clientOwnerId = req.body.clientOwnerId,
        clientInspectorId = req.body.clientInspectorId,
        clientEmail = req.body.clientEmail || '',
        clientPhone = req.body.clientPhone || '',
        clientGlobalId = req.body.clientGlobalId || '',
        clientCompanyId = req.param('clientCompanyId') || '',
        clientInspectorStr = '';

    if (typeof clientInspectorId == 'object')  {
        clientInspectorStr = clientInspectorId.join(',');
    } else {
        clientInspectorStr = clientInspectorId;
    }
    var query = "\n INSERT INTO `Clients` (`partnerCode`, `id`, `subject`,  `clientStatus`, `clientOwnerId`, `registerDatetime`, `parentClientId`, `clientPhone`, `clientGlobalId`, `clientEmail`, `clientInspectorId`)" +
                "\n VALUES ('" + partnerCode + "', null, '" + subject + "', '" + clientStatus + "', '" + clientOwnerId + "', '" + registerDatetime + "', '" + parentClientId + "', '" + clientPhone+ "', '" + clientGlobalId + "', '" + clientEmail + "', '" + clientInspectorStr + "');" +
                "\n UPDATE `Clients` SET `hasChildren` = 1 WHERE `id` = '" + parentClientId + "'";

    tasksDb.query(query, function(err, result) {
        if (!err) {   
            updateParentClient(parentClientId);
            var query = "\n INSERT INTO `ClientsChangeHistory` (`id`, `clientId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                        "\n VALUES(null, '" + result.insertId + "', '" + userId + "', 'Пользователь " + userName + " создал задачу', '" + registerDatetime + "')";

            var newClientId =  result[0].insertId;

            tasksDb.query(query);

            var data = {
                id: newClientId,                
                partnerCode: partnerCode,
                subject: subject,
                clientCompanyId: clientCompanyId,
                clientStatus: clientStatus,
                clientOwnerId: clientOwnerId,                
                clientInspectorId: clientInspectorId,
                clientEmail: clientEmail,
                clientPhone: clientPhone,
                registerDatetime: registerDatetime,
                parentClientId: parentClientId                
            };
            res.json({
                success: true,
                data: data
            });
            data.userHash = userHash;
            commonSocket && commonSocket.emit('add-client', data);                               
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });    
});
router.post('/add-client-comment', function(req, res, next) {
    var userHash = req.body.userHash,
        clientId = req.body.clientId,
        clientSubject = req.body.clientSubject,
        commentAuthorId = parseInt(req.body.commentAuthorId),
        commentAuthorName = req.body.commentAuthorName || '',
        commentDate = req.body.commentDate,
        comment = req.body.comment.replace(/'/g, "\'");


    if (typeof clientId == 'undfined' || clientId == 0) {
        return res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
    var query = "\n SELECT * FROM `Clients` WHERE `id` = '" + clientId + "'; "+
                "\n INSERT INTO `ClientsComment` (`id`, `clientId`, `commentAuthorId`, `commentDate`, `comment`) " +
                "\n VALUES (null, '" + clientId + "' , '" + commentAuthorId + "', '" + commentDate + "', '" + comment + "')";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var client = result[0][0];
            
            var data = {
                id: result.insertId,
                clientId: clientId,
                clientSubject: clientSubject,
                clientOwnerId: client.clientOwnerId,
                clientInspectorId: client.clientInspectorId || '',
                commentAuthorId: commentAuthorId,
                commentAuthorName: commentAuthorName,
                commentDate: commentDate,
                comment: comment,
                userHash: userHash
            };
            res.json({
                success: true,
                data: data
            });
            commonSocket && commonSocket.emit('add-client-comment', data);
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });
    
});
router.post('/del-client', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id;
        
    if (typeof id == 'undefined' || id == 0) {
        return res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
    var query = "\n SELECT * FROM `Clients` WHERE `id` = '" + id+ "'; " +     
                "\n DELETE FROM `Clients` WHERE `id` = '" + id +"'";

    tasksDb.query(query, function(err, result) {        
        if (!err) {
            var clientInfo = result[0][0],
                query = "\n SELECT COUNT(*) AS `total` FROM `Clients` WHERE `parentClientId` = '" + clientInfo.parentClientId +"'";
                
            tasksDb.query(query, function(err, result) {
                if (!err) {
                    if (result[0]['total'] == 0) {
                        resetParentClientGroupStatus(clientInfo.parentClientId);
                    } else {
                        updateParentClient(clientInfo.parentClientId);
                    }
                }
            });
            var data = {
                id: id
            };
            res.json({
                success: true,
                data: data
            });
            data.userHash = userHash;            
            commonSocket && commonSocket.emit('del-client', data);
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });    
});
router.post('/del-client-comment', function(req, res, next) {
    var userHash = req.param('userHash'),
        clientCommentId = req.param('clientCommentId');
        
    var query  = "\n DELETE FROM `ClientsComment` WHERE `id` = '" + clientCommentId +"'";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var data = {
                clientCommentId: clientCommentId
            };
            res.json({
                success: true,
                data: data
            });
            data.userHash = userHash;            
            commonSocket && commonSocket.emit('del-client-comment', data);
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });    
});
router.post('/update-client', function(req, res, next) {
    var getClientChangeHistoryMsg = function(newClientInfo, userName, callback) {
        var query = "\n SELECT `t`.`id`, `t`.`clientInspectorId`, `t`.`subject`, `t`.`clientOwnerId`, DATE_FORMAT(`t`.`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, `t`.`clientStatus`, `t`.`parentClientId`, `t1`.`subject` AS `parentClientSubject`"  +
                    "\n FROM `Clients` AS `t` " +
                    "\n LEFT JOIN `Clients` AS `t1` ON `t1`.`id` = `t`.`parentClientId`" +
                    "\n WHERE `t`.`id` = '" + newClientInfo.id +"'";

        tasksDb.query(query, function(err, result) {
            var oldClientInfo = result[0],
                message = [];
            
            if (!err && result.length) {
                if (newClientInfo.subject != oldClientInfo.subject) {
                    message.push('Пользователь ' + userName + ' изменил наименование клиента ');
                }
                if (newClientInfo.clientOwnerId != oldClientInfo.clientOwnerId) {
                    message.push('Пользователь ' + userName + ' назначил сменил ответственного у клиента ');
                }
                if (newClientInfo.clientStatus != oldClientInfo.clientStatus) {
                    message.push('Пользователь ' + userName + ' изменил статус у клиента ');
                }                
                if (!message.length) {
                    message.push('Пользователь ' + userName + ' изменил свойства карточки клиента');
                }                
                callback && callback(message.join('<br>'));
            }
        });
    };
    var userHash = req.body.userHash || '',
        userId = req.body.userId,
        userName = u.getActiveUserName(req.body.userId, req.session.users),
        query;
  
    var obj = {
        id: req.body.id || req.body.userId,
        partnerCode: req.body.partnerCode || '',
        subject: req.body.subject,
        clientStatus: req.body.clientStatus,         
        clientOwnerId: req.body.clientOwnerId || cnt.robotId,
        clientEmail: req.body.clientEmail || '',
        clientPhone: req.body.clientPhone || '',        
        clientInspectorId: req.body.clientInspectorId,
        registerDatetime: req.body.registerDatetime || u.getCurrentDate(),
        parentClientId: req.body.parentClientId || req.body.parentId || 0        
    };    
    if (typeof obj.clientInspectorId != 'undefined') {
        if (typeof obj.clientInspectorId != 'object') {
            obj.clientInspectorId = [obj.clientInspectorId];
        }        
    } else {
        obj.clientInspectorId = '';
    }
    var set = [];
    
    for (var key in obj) {
        var value = obj[key];

        if (typeof value != 'undefined') {
            if (typeof value == 'object') {
                set.push("`" + key + "` = '" + value.join(',') + "'" );
            } else if (value != '') {
                set.push("`" + key + "` = '" + value + "'" );
            }            
        }
    };
    getClientChangeHistoryMsg(obj, userName, function(changeMessage) {
        var changeDate = u.getCurrentDate(),
            query = "\n INSERT INTO `ClientsChangeHistory` (`id`, `clientId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                    "\n VALUES(null, '" + obj.id + "', '" + userId + "', '" + changeMessage + "', '" + changeDate + "')";

        tasksDb.query(query, function(err) {
            if (!err && commonSocket) {
                commonSocket.emit('update-client-change-history', {
                    clientId: obj.id,
                    changeUserId: userId,
                    changeMessage: changeMessage,
                    changeDate: changeDate,
                    registerDatetime: obj.registerDatetime,
                    clientOwnerId: obj.clientOwnerId,
                    clientEmail: obj.clientEmail,
                    clientPhone: obj.clientPhone,
                    clientInspectorId: obj.clientInspectorId == 'undefined' ? [] : obj.clientInspectorId
                });
            }
        });    
    });    
    query = "\n UPDATE `Clients` SET " + set.join(', ') + " WHERE `id` = '" + obj.id + "'; "; 
    
    tasksDb.query(query, function(err) {
        if (!err) {
            if (typeof obj.clientOwnerId != 'undefined') {
                query = "\n SELECT *, DATE_FORMAT(`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, " +
                        "\n (SELECT `name` FROM `Members` WHERE `id` = '" + obj.clientOwnerId + "') AS `clientOwnerName` " +
                        "\n FROM `Clients`" +
                        "\n WHERE `id` = '" + obj.id + "'";                
            } else {
                query = "\n SELECT *, DATE_FORMAT(`registerDatetime`, '%Y-%m-%d %H:%i:%s') AS `registerDatetime`, " +
                        "\n FROM `Clients`" +
                        "\n WHERE `id` = '" + obj.id + "'";                     
            }
            tasksDb.query(query, function(err, result) {
                if (!result.length) {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbWrite]
                    });
                } else if (err) {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbWrite]
                    });                    
                } else {
                    var data = result[0];
                    data.userHash = userHash;
                    data.userName = userName;
                    data.clientSubject = obj.subject;
                    data.originParentClientId = req.body.originParentClientId || null;
                    res.json({
                        success: true,
                        data: data
                    });
                    updateParentClient(data.parentClientId);

                    if (commonSocket) {
                        commonSocket.emit('update-client', data);
                        commonSocket.emit('set-client-unread', {
                            clientId: data.id,
                            userHash: userHash
                        });
                        commonSocket.emit('set-client-unread', {
                            clientId: data.parentClientId,
                            userHash: userHash
                        });
                    }                    
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
router.post('/set-client-read', function(req, res, next) {
    var clientId = req.body.clientId,
        userId = req.body.userId,
        forceMode = req.body.forceMode || false,
        queryArr = [],
        query; 
    
    if (clientId) {
        if (clientId == 0) {
            res.json({
                success: true
            });
        } else {
            query = "\n SELECT `parentClientId` FROM `Clients` WHERE `id` = '" + clientId + "'";

            tasksDb.query(query, function(err, clientDetail) {
                if (!err) {

                    // BB
                    // attention!
                    // the condition must be only such!!
                    //
                    if (forceMode == 'true') {
                        queryArr.push("\n INSERT INTO `ClientsUserRead` (`id`, `clientId`, `userId`, `datetime`, `parentClientId`) VALUES(null, '" + clientId + "', '" + userId + "', NOW(), '" + clientDetail[0].parentClientId +"')");
                        query = "\n SELECT `id`, `parentClientId` FROM `Clients` WHERE `parentClientId` = '" + clientId + "'";

                        tasksDb.query(query, function(err, clientList) {
                            if (!err) {
                                for (var i in clientList) {
                                    var rec = clientList[i];
                                    queryArr.push("\n INSERT INTO `ClientsUserRead` (`id`, `clientId`, `userId`, `datetime`, `parentClientId`) VALUES(null, '" + rec.id + "', '" + userId + "', NOW(), '" + clientId +"')");
                                }
                                tasksDb.query(queryArr.join(';'), function(err) {
                                    if (!err) {
                                        res.json({
                                            success: true
                                        });                                      
                                    } else {
                                        res.json({
                                            success: false,
                                            errors: [cnt.errorDbWrite]
                                        });                
                                    }
                                });                            
                            }
                        });                    
                    } else {
                        queryArr.push("\n INSERT INTO `ClientsUserRead` (`id`, `clientId`, `userId`, `datetime`, `parentClientId`) VALUES(null, '" + clientId + "', '" + userId + "', NOW(), '" + clientDetail[0].parentClientId +"')");
                        
                        tasksDb.query(queryArr.join(';'), function(err) {
                            if (!err) {
                                res.json({
                                    success: true
                                });                                      
                            } else {
                                res.json({
                                    success: false,
                                    errors: [cnt.errorDbWrite]
                                });                
                            }
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
    } else {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    }
});
router.post('/set-client-unread', function(req, res, next) {
    var clientId = req.body.clientId,
        userId = req.body.userId,
        forceMode = req.body.forceMode || false,
        queryArr = [];

    if (clientId) {
        query = "\n SELECT * FROM `Clients` WHERE `id` = '" + clientId + "'";

        tasksDb.query(query, function(err, clientDetail) {
            if (!err) {
                if (forceMode == 'true') {
                    queryArr.push("\n DELETE FROM `ClientsUserRead` WHERE `parentClientId` = '" + clientId + "' AND `userId` = '" + userId + "'");
                    queryArr.push("\n DELETE FROM `ClientsUserRead` WHERE `id` = '" + clientId + "' AND `userId` = '" + userId + "'");
                } else {
                    queryArr.push("\n DELETE FROM `ClientsUserRead` WHERE `clientId` = '" + clientId + "' AND `userId` = '" + userId + "'");
                }
                tasksDb.query(queryArr.join(';'), function(err) {
                    if (!err) {
                        res.json({
                            success: true
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
                    errors: [cnt.errorDbRead]
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
router.post('/is-client-read', function(req, res, next) {
    var clientId = req.body.clientId,
        userId = req.body.userId,
        query;

    if (!clientId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else if (clientId == '0') {
        res.json({
            success: false
        });
    } else {
        query = "\n SELECT * FROM `Clients` WHERE `id` = '" + clientId + "'";

        tasksDb.query(query, function(err, clientDetail) {
            if (!err) {
                if (!clientDetail[0].hasChildren) {
                    query = "\n SELECT COUNT(*) AS `clientReadTotal` FROM `ClientsUserRead` WHERE `userId` = '" + userId + "' AND `id` = '" + clientDetail[0].id + "'";

                    tasksDb.query(query, function(err, result) {
                        if (!err) {
                            if (result[0].clientReadTotal > 0) {
                                res.json({
                                    success: true
                                });
                            } else {
                                res.json({
                                    success: false
                                });                            
                            }
                        }
                    });
                } else {
                    query = "\n SELECT COUNT(*) AS `clientTotal` FROM `Clients` WHERE `parentClientId` = '" + clientDetail[0].id + "'; " +
                            "\n SELECT COUNT(DISTINCT(`clientId`)) AS `clientReadTotal` FROM `ClientsUserRead` WHERE `userId` = '" + userId + "' AND `parentClientId` = '" + clientDetail[0].id + "'";

                    tasksDb.query(query, function(err, result) {
                        if (!err) {
                            var a = result[0][0],
                                b = result[1][0];

                            if (a.clientTotal == b.clientReadTotal) {
                                res.json({
                                    success: true
                                });
                            } else {
                                res.json({
                                    success: false
                                });                            
                            }
                        }
                    });
                }
            }
        });         
    }   
});
router.post('/add-client-notify', function(req, res, next) {
    var msg = req.body.msg,
        date = req.body.date || u.getCurrentDate(),
        notifyAuthorId = req.body.notifyAuthorId || req.body.userId, //<-- if not set notifyAuthorId get userId from userHash
        notifyTargetUserId = req.body.notifyTargetUserId;

    var isMessageAlreadyHas = function(callback) {
        var query = "\n SELECT COUNT(*) AS `total` FROM `ClientsNotify` " +
                    "\n WHERE `msg` = '" + msg + "' AND `notifyAuthorId` = '" + notifyAuthorId + "' AND `notifyTargetUserId` = '" + notifyTargetUserId.join(',') + "'";

        tasksDb.query(query, function(err, result) {
            if (err) {
                callback(false);
            } else {
                var total = result[0]['total'];

                if (total > 0) {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        });
    }
    isMessageAlreadyHas(function(result) {
        if (result == false) {
            var query = "\n INSERT INTO `ClientsNotify` (`id`, `msg`, `notifyAuthorId`, `notifyTargetUserId`, `date`)" +
                "\n VALUES(null, '" + msg+ "', '" + notifyAuthorId + "', '" + notifyTargetUserId.join(',') + "', '" + date + "')";

            tasksDb.query(query, function(err, result) {
                if (!err) {
                    res.json({
                        success: true
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
                success: true
            });
        }
    });
});
router.post('/del-client-notify', function(req, res, next) {
    var notifyId = req.body.notifyId || null,
        userTargetId = req.body.userTargetId,
        where,
        query;
    
    if (!userTargetId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    } else {
        if (notifyId != null) {
            where = "\n WHERE `id` = '" + notifyId +"'";
        } else {
            where = "\n WHERE `notifyTargetUserId` = '" + userTargetId + "'";
        }
        query = "\n DELETE FROM `ClientsNotify` " + where;
        
        tasksDb.query(query, function(err, result) {
            if (!err) {
                res.json({
                    success: true
                });
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });                
            }
        });
    }
        
});
router.post('/get-client-notify', function(req, res, next) {
    var notifyId = req.body.notifyId,
        query = "\n SELECT * FROM `ClientsNotify` WHERE `id` = '" + notifyId + "'";    
    
    tasksDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: result[0]
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });
});
router.post('/get-client-notify-list', function(req, res, next) {
    var userTargetId = req.body.userTargetId || 0, // 0 - для всех
        skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || null,
        limit;


    if (take != null) {
        limit = "\n LIMIT " + skip + ", " + take + ";"
    } else {
        limit = ";";
    }
    var query = "\n SELECT `id`, `msg`, `notifyAuthorId`, `notifyTargetUserId`, DATE_FORMAT(`date`, '%Y-%m-%d %H:%i:%s') AS `date` FROM `ClientsNotify` WHERE FIND_IN_SET(`notifyTargetUserId`, '" + userTargetId + "')>0" +
                "\n ORDER BY `date` DESC"+
                limit +
                "\n SELECT COUNT(*) AS `total` FROM `ClientsNotify` WHERE FIND_IN_SET(`notifyTargetUserId`, '" + userTargetId + "')>0";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    list: result[0],
                    total: result[1][0]['total']
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
router.post('/add-client-history', function(req, res, next) {
    var clientId = req.body.clientId,
        changeMessage = req.body.changeMessge,
        changeDate = req.body.changeDate || u.getCurrentDate(),        
        changeMessage = req.body.changeMessge,
        changeUserId = req.body.changeUserId;        
        
    var query = "\n INSERT INTO `ClientsChangeHistory` (`id`, `clientId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                "\n VALUES(null, '" + clientId + "', '" + changeUserId + "', '" + changeMessage + "', '" + changeDate + "')";
       
    tasksDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });            
});
router.post('/get-client-history-list', function(req, res, next) {
    var clientId = req.body.clientId,
        query = "\n SELECT `id`, `clientId`, `changeUserId`, `changeMessage`, DATE_FORMAT(`changeDate`, '%Y-%m-%d %H:%i:%s') AS `changeDate` FROM `ClientsChangeHistory` WHERE `clientId` = '" + clientId + "' ORDER BY `changeDate`";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    list: result,
                    total: result.length
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
module.exports = function(io, settings, constant) {
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
        socket.emit('client-socket-ready');
        localSocket = socket;
    });   
    return router;
};
