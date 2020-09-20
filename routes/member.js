var mccDefaultPassword = 'miatel';

var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    commonSocket,
    localSocket = null;

var getCurrentDate = function() {
    var now = new Date();
    var year = "" + now.getFullYear();
    var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
};
var getUserIdFromHash = function(userHash, session) {
    if (session && typeof session[userHash] != 'undefined') {
        return session[userHash].id;
    } else {
        return false;
    }
};
function handleDisconnect(connection) {
    connection.on('error', function(err) {
        if (!err.fatal) {
            return;
        } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Re-connecting lost connection ');
            connection = mysql.createConnection(connection.config);
            handleDisconnect(connection);
            connection.connect();
        } else {
            throw err;
        }        
    });
}
router.post('/get-partner', function(req, res, next) { 
    var partnerCode = req.body.partnerCode;

    if (typeof partnerCode != 'undefined') {
        var query = "\n SELECT * FROM `Members` WHERE `partnerCode` = '" + partnerCode + "' LIMIT 1";
 
        tasksDb.query(query, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    errors: [cnt.errorDbRead]
                });
            } else {
                res.json({
                    success: true,
                    data: result[0]
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
router.post('/get-member-list', function(req, res, next) {
    var userHash = req.body.userHash,
        departmentId = req.body.departmentId;        
        skip = req.body.skip || 0,
        take = req.body.take || cnt.defaultTake,    
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '', where = '', limit = '';
        
    if (!departmentId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else if (departmentId != 0) {
        where = "\n WHERE `departmentId` = '" + departmentId + "'" ;
    }    
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }        
    if (take != 0) {
        limit = "\n LIMIT " + skip + ", " + take + ';';
    } else {
        limit = ';';
    }
    var query = "\n SELECT `m`.*, " +
                "\n (SELECT `name` FROM `MembersDepartment` AS `md` WHERE `id` = `m`.`departmentId`) AS `departmentName`"+
                "\n FROM `Members` AS `m`"+
                where +
                order +
                limit + 
                "\n SELECT COUNT(*) AS `total` FROM `Members` " + where;

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var total = result[1][0]['total'],
                list = result[0];

            for (var i in list) {
                var el = list[i];

                if (el.sectionAccessCode == '') {
                    el.sectionAccessCode = {}
                } else {
                    el.sectionAccessCode = eval(el.sectionAccessCode);
                }
            }                    
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
router.post('/add-member', function(req, res, next) {
    var query = "\n SELECT MAX(`id`) AS `id` FROM `Members`";
    
    tasksDb.query(query, function(err, result) {
        if (!err) {
            /**
             * ВВ
             * В задачах есть поле taskExecutorId 
             * Оно типа SET
             * На задачу можно назначить несколько человек. 
             * По полю SET удобно искать. И не надо связанных таблиц делать. 
             * Но поле SET ограничено. Сейчас там сл. значения 1,2,3,4..60 Максимум 60
             * То есть максимальный id у пользователя может быть 60
             * В случае, если удалять и добавлять пользователей из таблицы Members
             * И не прописывать им id, будет подставляться autoincrement
             * И он будет рваный. 240 ив, 550 ид. Вот поэтому я тут и делаю, так, чтобы 
             * было последовательно. 50-й пользователь, будет иметь 50-ый Id
             * 
             * @type Number
             */
            var id = ++result[0]['id'],
                query = "\n INSERT INTO `Members` (`id`, `name`, `login`, `password`, `email`, `sectionAccessCode`, `departmentId`, `innerPhoneNumber`, `partnerCode`)" +
                        "\n VALUES(" + id + ", '', '', '', '', '', NULL, '', '')";

            tasksDb.query(query, function(err, result) {
                if (!err) {
                    var lastInsertId = result.insertId;

                    res.json({
                        success: true,
                        data: {
                            id: lastInsertId
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
            
        }
    });
});
router.post('/get-member', function(req, res, next) {
    var id = req.body.id;
    
    if (!id) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        }); 
    } else {
        var query = "\n SELECT * FROM `Members` WHERE `id` = '" + id + "' LIMIT 1";

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
    }
});
router.post('/update-member', function(req, res, next) {
    var id = req.body.id,
        set = [];

    if (!id) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    } else {
        var getRoleSet = function() {
            var role = req.body.role,
                set = [];

            if (typeof role == 'object') {
                for (var i in role) {
                    var el = role[i];
                    set.push(el);
                }                
                return set.join(',');
            } else {
                return role;
            }            
        };
        var obj = {
            partnerCode: req.body.partnerCode,
            departmentId: req.body.departmentId,
            sectionAccessCode: JSON.stringify(req.body.sectionAccessCode),
            email: req.body.email,
            login: req.body.login,
            name: req.body.name,
            role: getRoleSet(),
            position: req.body.position,
            birthday: req.body.birthday || '',
            password: req.body.password || mccDefaultPassword,
            innerPhoneNumber: req.body.innerPhoneNumber || ''
        };
        if (typeof obj.sectionAccessCode == 'undefined') {
            obj.sectionAccessCode = '';
        }
        for (var key in obj) {
            var value = obj[key];

            if (typeof value != 'undefined') {
                set.push("`" + key + "` = '" + value + "'" );
            }
        };   
        var query = "\n UPDATE `Members` "+
                    "\n SET " + set.join(', ') +
                    "\n WHERE `id` = '" + id + "';";    

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
router.post('/del-member', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id;

    if (!id) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n DELETE FROM `Members` WHERE `id` = '" + id +"'";

        tasksDb.query(query, function(err, result) {
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
    }
});
router.post('/get-member-list-tree', function(req, res, next) {
    var query = "\n SELECT `m`.`id`, `m`.`innerPhoneNumber`,`m`.`name`, `m`.`login`, `m`.`password`, `m`.`email`, `m`.`sectionAccessCode`, `md`.`name` AS `departmentName`, `md`.`id` AS `departmentId`" +
                "\n FROM `MembersDepartment` AS `md`" +
                "\n LEFT JOIN `Members` AS `m` ON `m`.`departmentId` = `md`.`id`";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var tmp = {},
                arr = [];

            for (var i in result) {
                var rec = result[i],
                    departmentId  = rec.departmentId;
                    
                if (typeof tmp[departmentId] == 'undefined') {
                    tmp[departmentId] = {
                        id: departmentId,
                        text: rec.departmentName,
                        items: [],
                        parentId: 0
                    };
                }
                if (rec.id) {
                    tmp[departmentId].items.push({
                        id: departmentId + '-' + rec.id,
                        text: rec.name,
                        parentId: departmentId
                    });                    
                }
            }
            for (var i in tmp) {
                arr.push(tmp[i]);
            }
            res.json({
                success: true,
                data: {
                    tree: {
                        id: 0,    
                        text: 'Сотрудники',
                        items: arr,
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
router.post('/get-department', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id;
        
    if (!id) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        }); 
    } else {
        var query = "\n SELECT * FROM `MembersDepartment` WHERE `id` = '" + id + "'";
        
        tasksDb.query(query, function(err, result) {
            if (!err) {
                res.json({
                    success: true,
                    data: result[0]
                })
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorDbRead]
                });                
            }
        });
    }
});
router.post('/get-department-list', function(req, res, next) {
    var userHash = req.body.userHash,
        skip = req.body.skip || 0,
        take = req.body.take || cnt.defaultTake,   
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '';
        
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }    
    var query = "\n SELECT `md`.*," +
                "\n (SELECT COUNT(*) FROM `Members` AS `m` WHERE `departmentId` = `md`.`id`) AS `memberTotal`" +
                "\n FROM `MembersDepartment` AS `md`"+
                order +
                "\n LIMIT " + skip + ", " + take + ';' +
                "\n SELECT COUNT(*) AS `total` FROM `MembersDepartment`;";

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
router.post('/update-department', function(req, res, next) {
    var id = req.body.id,
        set = [];
        
    var obj = {
        name: req.body.name
    };
    for (var key in obj) {
        var value = obj[key];
        
        if (typeof value != 'undefined') {
            set.push("`" + key + "` = '" + value + "'" );
        }
    };    
    var query = "\n UPDATE `MembersDepartment` "+
                "\n SET " + set.join(', ') +
                "\n WHERE `id` = '" + id + "';";    
        
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
router.post('/add-department', function(req, res, next) {
    var query = "\n INSERT INTO `MembersDepartment` (`id`, `name`) VALUES(null, '')";
    
    tasksDb.query(query, function(err, result) {
        if (!err) {
            var lastInsertId = result.insertId;
            
            res.json({
                success: true,
                data: {
                    id: lastInsertId,
                    memberTotal: 0
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
router.post('/del-department', function(req, res, next) {
    var userHash = req.body.userHash,
        id = req.body.id;

    if (!id) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n DELETE FROM `MembersDepartment` WHERE `id` = '" + id +"'";

        tasksDb.query(query, function(err, result) {
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
    }
});
router.post('/get-role-list', function(req, res, next) {
    res.json({
        success: true,
        data: {
            list: [{
                value: 'Директор',
                text: 'Директор'                
            },{
                value: 'Руководитель отдела',
                text: 'Руководитель отдела'
            },{
                value: 'Инженер',
                text: 'Инженер'
            },{
                value: 'Менеджер',
                text: 'Менеджер'
            },{
                value: 'Партнер',
                text: 'Партнер'
            }]
        }
    });
});
module.exports = function(io, settings, constant) {
    commonSocket = io;
    tasksDb = db = mysql.createConnection(settings.tasksDb);
    voiceipDb = mysql.createConnection(settings.voiceipDb);    
    wwwDb = mysql.createConnection(settings.wwwDb);
    sbcDb = mysql.createConnection(settings.sbcDb);    
    handleDisconnect(tasksDb);
    handleDisconnect(voiceipDb);
    handleDisconnect(wwwDb);
    handleDisconnect(sbcDb);         
    
    io.on('connection', function(socket) {
        socket.emit('api-socket-ready');
        localSocket = socket;
    });   
    return router;
};
