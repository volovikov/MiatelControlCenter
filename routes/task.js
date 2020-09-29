var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    u = require('../util'),
    commonSocket,
    localSocket = null;

(function() {
    function decimalAdjust(type, value, exp) {  
        if (typeof exp === 'undefined' || +exp === 0) {
          return Math[type](value);
        }
        value = +value;
        exp = +exp;
        
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
          return NaN;
        }
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
          return decimalAdjust('round', value, exp);
        };
    }
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
          return decimalAdjust('floor', value, exp);
        };
    }
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
          return decimalAdjust('ceil', value, exp);
        };
    }
})();

var updateParentTask = function(parentTaskId, userHash) {
    if (typeof parentTaskId == 'undefined') {
        return;
    } else if (parentTaskId == 0) {
        return;
    }
    var query = "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`taskInspectorId`, `t`.`subject`, `t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`,`t`.`needTime`, `t`.`complete`, `t`.`parentTaskId`, `t1`.`subject` AS `parentTaskSubject`"  +
                "\n FROM `Tasks` AS `t` " +
                "\n LEFT JOIN `Tasks` AS `t1` ON `t1`.`id` = `t`.`parentTaskId`" +
                "\n WHERE `t`.`parentTaskId` = '" + parentTaskId +"'";

    tasksDb.query(query, function(err, data) {
        var completeSum = 0,
            needTimeSum = 0,
            hasChildren = 1,
            status = 'Закрыта',
            complete;
            
        if (!err) {
            if (data.length) {
                for (var i in data) {
                    var v = data[i],
                        complete = v.complete.replace('%', '');

                    completeSum += parseInt(complete);
                    needTimeSum += parseInt(v.needTime);

                    if (v.status != 'Закрыта') {
                        status = 'В работе';
                    }
                }
                complete = Math.round10(completeSum/data.length, 1);            
            } else {
                status = 'Новая';
                hasChildren = 0;
                complete = 0;
            }

            // BB
            // parentTaskId и parentTaskSubject нужны для формы 
            // Дополнитльено -> Родительная задача
            //
            var query = "\n UPDATE `Tasks` SET `hasChildren` = '" + hasChildren + "' ,`needTime` = '" + needTimeSum + "', `complete` = '" + complete + "%', `status` = '" + status + "' WHERE `id` = '" + parentTaskId+ "';"+
                        "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`taskInspectorId`, `t`.`subject`, `t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentTaskId`, `t1`.`subject` AS `parentTaskSubject`"  +
                        "\n FROM `Tasks` AS `t` " +
                        "\n LEFT JOIN `Tasks` AS `t1` ON `t1`.`id` = `t`.`parentTaskId`" +
                        "\n WHERE `t`.`id` = '" + parentTaskId +"'";                

            tasksDb.query(query, function(err, data) {
                if (!err && commonSocket) {
                    var task = data[1][0];
      
                    if (typeof task.id != 'undefined') {
                        commonSocket.emit('update-task', task);
                        commonSocket.emit('set-task-unread', {
                            taskId: task.id,
                            userHash: userHash
                        });
                        if (task.parentTaskId != 0) {
                            updateParentTask(task.parentTaskId, userHash);
                        }
                    }
                }
            });
        }
    }); 
};
var resetParentTaskGroupStatus = function(parentTaskId) {
    var query = "\n UPDATE `Tasks` SET `hasChildren` = 0, `status` = 'Новая' WHERE `id` = '" + parentTaskId + "';" +
                "\n SELECT `t`.`hasChildren`, `t`.`id`, `t`.`taskInspectorId`, `t`.`subject`,  `t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentTaskId`, `t1`.`subject` AS `parentTaskSubject`"  +
                "\n FROM `Tasks` AS `t` " +
                "\n LEFT JOIN `Tasks` AS `t1` ON `t1`.`id` = `t`.`parentTaskId`" +
                "\n WHERE `t`.`id` = '" + parentTaskId +"';";                    

    tasksDb.query(query, function(err, result) {
        if (!err) {
            if (commonSocket) {
                var data = result[1][0];
                commonSocket.emit('update-task', data);
            }                
        } else {

        }            
    });
}; 
var getGroupParentIds = function(taskId, callback) {
    /**
     * ВВ
     * Нет ни каких других способов получить идентификатороы всех 
     * вложенных папок одним запросом. 
     * А следать в цикле несолько запросов, или рекурсивно - невозможно
     * Это не php :-)
     */
    var query = "\n SELECT `t1`.`id` AS `l1`, `t2`.`id` AS `l2`, `t3`.`id` AS `l3`, `t4`.`id` AS `l4`, `t5`.`id` AS `l5`, `t6`.`id` AS `l6` " +
                "\n FROM `Tasks` AS `t1` " +
                "\n LEFT JOIN `Tasks` AS `t2` ON `t2`.`parentTaskId` = `t1`.`id` AND `t2`.`hasChildren` = 1" +
                "\n LEFT JOIN `Tasks` AS `t3` ON `t3`.`parentTaskId` = `t2`.`id` AND `t3`.`hasChildren` = 1" + 
                "\n LEFT JOIN `Tasks` AS `t4` ON `t4`.`parentTaskId` = `t3`.`id` AND `t4`.`hasChildren` = 1" +
                "\n LEFT JOIN `Tasks` AS `t5` ON `t5`.`parentTaskId` = `t4`.`id` AND `t5`.`hasChildren` = 1" +
                "\n LEFT JOIN `Tasks` AS `t6` ON `t6`.`parentTaskId` = `t5`.`id` AND `t6`.`hasChildren` = 1" +
                "\n WHERE `t2`.`parentTaskId` = '" + taskId + "'";        
 
    tasksDb.query(query, function(err, rows) {
        var result = []; 
        
        if (!err) {
            for(var i in rows) {
                var row = rows[i];

                for (var j in row) {
                    var taskId = row[j];

                    if (taskId != null) {
                        if (result.indexOf(taskId) == -1) {
                            result.push(taskId);
                        }
                    }
                }
            }
            callback && callback(result);
        }
    });        
};
var setTaskRead = function(taskId, userId, forceMode, callback) {
    var forceMode = forceMode || false,
        queryArr = [],
        query; 
    
    if (taskId) {
        if (taskId == 0) {
            callback && callback({success: true});
        } else {
            query = "\n SELECT `parentTaskId` FROM `Tasks` WHERE `id` = '" + taskId + "'";

            tasksDb.query(query, function(err, taskDetail) {
                if (!err) {

                    // BB
                    // attention!
                    // the condition must be only such!!
                    //
                    if (forceMode == 'true') {
                        queryArr.push("\n INSERT INTO `TasksUserRead` (`id`, `taskId`, `userId`, `datetime`, `parentTaskId`) VALUES(null, '" + taskId + "', '" + userId + "', NOW(), '" + taskDetail[0].parentTaskId +"')");
                        query = "\n SELECT `id`, `parentTaskId` FROM `Tasks` WHERE `parentTaskId` = '" + taskId + "'";

                        tasksDb.query(query, function(err, taskList) {
                            if (!err) {
                                for (var i in taskList) {
                                    var rec = taskList[i];
                                    queryArr.push("\n INSERT INTO `TasksUserRead` (`id`, `taskId`, `userId`, `datetime`, `parentTaskId`) VALUES(null, '" + rec.id + "', '" + userId + "', NOW(), '" + taskId +"')");
                                }
                                tasksDb.query(queryArr.join(';'), function(err) {
                                    if (!err) {
                                        callback && callback({success: true});
                                    } else {
                                        callback && callback({success: false, errors: [cnt.errorDbWrite]});
                                    }
                                });                            
                            }
                        });                    
                    } else {
                        queryArr.push("\n INSERT INTO `TasksUserRead` (`id`, `taskId`, `userId`, `datetime`, `parentTaskId`) VALUES(null, '" + taskId + "', '" + userId + "', NOW(), '" + taskDetail[0].parentTaskId +"')");
                        
                        tasksDb.query(queryArr.join(';'), function(err) {
                            if (!err) {
                                callback && callback({success: true});
                            } else {
                                callback && callback({success: false, errors: [cnt.errorDbWrite]});               
                            }
                        });                    
                    }
                } else {
                    callback && callback({success: false, errors: [cnt.errorDbRead]});
                }
            });            
        }
    } else {
        callback && callback({success: false, errors: [cnt.errorParamsGet]});
    }    
};
router.post('/get-task-list-tree', function(req, res, next) {
    var globalUserTaskRead = 1,
        where = [];

    var params = {
        taskAuthorId: req.body.taskAuthorId,
        taskExecutorId: req.body.taskExecutorId,
        status: req.body.status
    };    
    for (var key in params) {
        if (typeof params[key] != 'undefined') {
            if (key == 'taskExecutorId') {
                where.push("FIND_IN_SET('" + params[key] +"', `t`.`" + key + "`)>0");                
            } else {
                where.push("`t`.`" + key + "` = '" + params[key] +"'");
            }            
        }
    }
    if (where.length) {
        where = "\n WHERE `t`.`hasChildren` = 1 OR (" + where.join(' AND ') + ")";
    } else {
        where = "\n WHERE `t`.`archive` = 0";
    }
        var query = "\n SELECT `t`.`id`, `t`.`hasChildren`, `t`.`subject` AS `text`, `t`.`parentTaskId` AS `parentId`, `t`.`status`," +
                "\n IF ((SELECT `id` FROM `TasksUserRead` AS `tr` WHERE `tr`.`taskId` = `t`.`id` AND `tr`.`userId` = '1' LIMIT 1) IS NULL, FALSE, TRUE) AS `userTaskRead` " + 
                "\n FROM `Tasks` AS `t`  " +
                where + 
                "\n ORDER BY `t`.`parentTaskId` ASC";

    tasksDb.query(query, function(err, rows) {
        if (!err) {
            var tmp = {},
                tree = [];

            for (var i in rows) {
                var el = rows[i];
                tmp[el.id] = el;

                if (el.userTaskRead == 0) {
                    globalUserTaskRead = 0;
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
                            text: 'Задачи',
                            items: tree,
                            userTaskRead: globalUserTaskRead,
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
                            text: 'Задачи',
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
router.post('/get-task-list', function(req, res, next) {
    var taskId = req.body.taskId,
        skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        q = req.body.q || null,
        where, limit;
        
    var order = '';
    
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }
    if (q) {
        where  = "\n WHERE `t`.`subject` LIKE '%" + q + "%'"; 
    } else {
        where  = "\n WHERE `t`.`parentTaskId` = '" + taskId + "'"; 
    }
    if (q) {
        limit = ";";
    } else {
        limit = "\n LIMIT " + skip + ", " + take + ";"        
    }
    var query = "\n SELECT `t`.`id`,`t`.`hasChildren`, `t`.`needTime`, `t`.`taskInspectorId`,`t`.`subject`,  `t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentTaskId` AS `parentId`,  " +
                "\n (SELECT `name` FROM `Members` WHERE `id` = `t`.`taskAuthorId`) AS `taskAuthor`" + 
                "\n FROM `Tasks` AS `t`" +
                where + 
                order +
                limit +
                "\n SELECT COUNT(*) AS `total` FROM `Tasks` AS `t` " + where;

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
router.post('/get-task-comment-list', function(req, res, next) {
    var taskId = req.body.taskId;
    var query = "\n SELECT `t`.`id`, `t`.`commentAuthorId`, `t`.`comment`, `t`.`taskId`, DATE_FORMAT(`t`.`commentDate`, '%Y-%m-%d %H:%i:%s') AS `commentDate`, `u`.`name` AS `commentAuthorName` FROM `TasksComment` AS `t`  JOIN `Members` AS `u` ON `u`.`id` = `t`.`commentAuthorId` WHERE `t`.`taskId` = '" + taskId + "' ORDER BY `commentDate`;" +
                "\n SELECT COUNT(*) AS `total` FROM `TasksComment` WHERE `taskId` = '" + taskId +"'";

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
router.post('/get-task', function(req, res, next) {
    var taskId = req.body.taskId;
    
    if (taskId == 0) {
        res.json({
            success: true,
            data: {
                id: 0,
                subject: 'Задачи',                
                complete: "0%",
                priority: "Нормальный",
                status: "Новая",                
                taskAuthorId: 1,
                taskExecutorId: '1',
                taskInspectorId: '',
                needTime: '',
                hasChildren: 0,
                workBegin: "2015-00-00 00:00:00",
                workEnd: "0000-00-00 00:00:00"                
            }
        });         
    } else {
        var query = "\n SELECT `t`.`hasChildren`, `t`.`needTime`, `t`.`id`, `t`.`taskInspectorId`, `t`.`subject`,`t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentTaskId`, `t1`.`subject` AS `parentTaskSubject`"  +
                    "\n FROM `Tasks` AS `t` " +
                    "\n LEFT JOIN `Tasks` AS `t1` ON `t1`.`id` = `t`.`parentTaskId`" +
                    "\n WHERE `t`.`id` = '" + taskId +"'";

        tasksDb.query(query, function(err, data) {
console.log(query);            
console.log(err);
            if (!err) {
                res.json({
                    success: true,
                    data: data[0]
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
router.post('/add-task', function(req, res, next) {
    var getActiveUserName = function(userId) {
        for (var i in req.session.users) {
            if (req.session.users[i].id == userId) {
                return req.session.users[i].name
            }            
        }
        return 'undefined';
    };    
    var userId = req.body.userId || cnt.robotId, //<-- если не из МЦЦ задачи, то не будет req.body.userId, Ставлю Id робота!
        userName = getActiveUserName(req.body.userId);

    var userHash = req.body.userHash || '';
        subject = req.body.subject,
        status = req.body.status,
        priority = req.body.priority,
        taskAuthorId = req.body.taskAuthorId,
        taskExecutorId = req.body.taskExecutorId,    
        taskInspectorId = req.body.taskInspectorId,
        workBegin = u.getCurrentDate(),
        workEnd = req.body.workEnd,
        needTime = req.body.needTime,
        complete = req.body.complete,
        parentTaskId = req.body.parentTaskId || 0;

    var query = "\n INSERT INTO `Tasks` (`id`, `taskInspectorId`, `subject`, `status`, `priority`, `taskAuthorId`, `taskExecutorId`, `workBegin`, `workEnd`, `complete`, `parentTaskId`, `needTime`)" +
                "\n VALUES (null, '" + taskInspectorId + "', '" + subject + "', '" + status + "', '" + priority + "', '" + taskAuthorId + "', '" + taskExecutorId + "', '" + workBegin + "', '" + workEnd + "', '" + complete + "', '" + parentTaskId + "', '" + needTime + "');" +
                "\n UPDATE `Tasks` SET `hasChildren` = 1 WHERE `id` = '" + parentTaskId + "'";

    tasksDb.query(query, function(err, result) {
        if (!err) {           
            var changeMessage = 'Пользователь ' + userName + ' создал задачу';
            
            var query = "\n INSERT INTO `TasksChangeHistory` (`id`, `taskId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                        "\n VALUES(null, '" + result.insertId + "', '" + userId + "', '" + changeMessage +", '" + workBegin + "')";
                
            tasksDb.query(query);
          
            var data = {
                id: result[0].insertId,
                subject: subject,
                status: status,
                priority: priority,
                taskAuthorId: taskAuthorId,
                taskExecutorId: taskExecutorId,
                taskInspectorId: taskInspectorId,
                needTime: needTime,
                workBegin: workBegin,
                workEnd: workEnd,
                complete: complete,
                parentTaskId: parentTaskId                
            };
            res.json({
                success: true,
                data: data
            });
            data.taskId = result[0].insertId;
            data.userHash = userHash;   
            data.changeUserId = userId,
            data.changeMessage = changeMessage;
            data.changeDate = workBegin;

            commonSocket && commonSocket.emit('add-task', data);
            setTaskRead(data.id, userId);

            if (parentTaskId != 0) {
                updateParentTask(parentTaskId, userHash);
            }
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbRead]
            });
        }
    });    
});
router.post('/add-task-comment', function(req, res, next) {
    var taskId = req.body.taskId,
        taskSubject = req.body.taskSubject,
        commentAuthorId = parseInt(req.body.commentAuthorId),
        commentAuthorName = req.body.commentAuthorName || '',
        commentDate = req.body.commentDate,
        comment = req.body.comment.replace(/'/g, "\'");
        
    var query = "\n SELECT * FROM `Tasks` WHERE `id` = '" + taskId + "'; "+
                "\n INSERT INTO `TasksComment` (`id`, `taskId`, `commentAuthorId`, `commentDate`, `comment`) " +
                "\n VALUES (null, '" + taskId + "' , '" + commentAuthorId + "', '" + commentDate + "', '" + comment + "')";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var task = result[0][0];
            
            var data = {
                id: result.insertId,
                taskId: taskId,
                taskSubject: taskSubject,
                taskExecutorId: task.taskExecutorId,
                taskAuthorId: task.taskAuthorId,
                commentAuthorId: commentAuthorId,
                commentAuthorName: commentAuthorName,
                commentDate: commentDate,
                comment: comment                
            };
            res.json({
                success: true,
                data: data
            });
            commonSocket && commonSocket.emit('add-task-comment', data);
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });         
    
});
router.post('/del-task', function(req, res, next) {   
    var userHash = req.body.userHash,
        id = req.body.id;
        
    getGroupParentIds(id, function(ids) {
        var where = '';
        
        if (!ids.length) {
            where = "WHERE `id` = '" + id + "'";
        } else {
            where = "WHERE `parentTaskId` IN (" + ids.join(',') + ") OR `id` = '" + id + "'";
        }
        var query = "\n SELECT * FROM `Tasks` WHERE `id` = '" + id+ "'; " +     
                    "\n DELETE FROM `Tasks` " + where;
  
        tasksDb.query(query, function(err, result) {
            if (!err) {
                var taskInfo = result[0][0];
                
                if (typeof taskInfo == 'undefined')  {
                    res.json({
                        success: false,
                        errors: cnt.errorDbWrite
                    });
                } else {
                    var query = "\n SELECT COUNT(*) AS `total` FROM `Tasks` WHERE `parentTaskId` = '" + taskInfo.parentTaskId + "'";

                    tasksDb.query(query, function(err, result) {
                        if (!err) {
                            if (taskInfo.parentTaskId != 0) {
                                if (result[0]['total'] == 0) {                                
                                    resetParentTaskGroupStatus(taskInfo.parentTaskId);                                
                                } else {
                                    updateParentTask(taskInfo.parentTaskId, userHash);
                                }                                
                            }
                        }
                    });
                    var data = {
                        id: id,
                        parentTaskId: taskInfo.parentTaskId
                    };
                    res.json({
                        success: true,
                        data: data
                    });
                    data.userHash = userHash;            
                    commonSocket && commonSocket.emit('del-task', data);                
                }            
            } else {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            }
        });            
    });    
});
router.post('/del-task-comment', function(req, res, next) {
    var userHash = req.param('userHash'),
        taskCommentId = req.param('taskCommentId');
        
    var query  = "\n DELETE FROM `TasksComment` WHERE `id` = '" + taskCommentId +"'";

    tasksDb.query(query, function(err, result) {
        if (!err) {
            var data = {
                taskCommentId: taskCommentId
            };
            res.json({
                success: true,
                data: data
            });
            data.userHash = userHash;            
            commonSocket && commonSocket.emit('del-task-comment', data);
        } else {
            res.json({
                success: false,
                errors: [cnt.errorDbWrite]
            });
        }
    });    
});
router.post('/update-task', function(req, res, next) {
    var archiveTaskId = '3941'; //<-- need move to constant!!
    
    var getActiveUserName = function(userId) {
        for (var i in req.session.users) {
            if (req.session.users[i].id == userId) {
                return req.session.users[i].name
            }            
        }
        return 'undefined';
    };
    var getTaskChangeHistoryMsg = function(newTaskInfo, userName, callback) {
        if (newTaskInfo.id == 0) {
            return;
        }
        var query = "\n SELECT `t`.`id`, `t`.`needTime`, `t`.`taskInspectorId`, `t`.`subject`,  `t`.`status`, `t`.`priority`, `t`.`taskAuthorId`, `t`.`taskExecutorId`, DATE_FORMAT(`t`.`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`t`.`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, `t`.`complete`, `t`.`parentTaskId`, `t1`.`subject` AS `parentTaskSubject`"  +
                    "\n FROM `Tasks` AS `t` " +
                    "\n LEFT JOIN `Tasks` AS `t1` ON `t1`.`id` = `t`.`parentTaskId`" +
                    "\n WHERE `t`.`id` = '" + newTaskInfo.id +"'";

        tasksDb.query(query, function(err, result) {
            var oldTaskInfo = result[0],
                message = [];

            if (!err) {
                if (newTaskInfo.needTime != oldTaskInfo.needTime) {
                    message.push('Пользователь ' + userName + ' изменил предполагаемое время работы на ' + u.getFormatedTimeStr(newTaskInfo.needTime));
                }
                if (newTaskInfo.subject != oldTaskInfo.subject) {
                    message.push('Пользователь ' + userName + ' изменил тему задачи ');
                }
                if (newTaskInfo.status != oldTaskInfo.status) {
                    message.push('Пользователь ' + userName + ' изменил статус задачи на ' + newTaskInfo.status);                    
                }
                if (newTaskInfo.priority != oldTaskInfo.priority) {
                    message.push('Пользователь ' + userName + ' изменил приоритет задачи на ' + newTaskInfo.priority);
                }
                if (newTaskInfo.complete != oldTaskInfo.complete) {
                    message.push('Пользователь ' + userName + ' сменил выполнено на ' + newTaskInfo.complete);
                }
                if (newTaskInfo.taskAuthorId != oldTaskInfo.taskAuthorId) {
                    message.push('Пользователь ' + userName + ' сменил автора задачи');
                }
                if (newTaskInfo.taskExecutorId != oldTaskInfo.taskExecutorId) {
                    message.push('Пользователь ' + userName + ' назначил ответственного на задачу');
                }                
                if (newTaskInfo.taskInspectorId != oldTaskInfo.taskInspectorId) {
                    message.push('Пользователь ' + userName + ' назначил наблюдателя на задачу');
                }          
                if (newTaskInfo.parentTaskId != oldTaskInfo.parentTaskId) {
                    message.push('Пользователь ' + userName + ' сменил родительскую задачу');
                }                   
                if (message.length == 0) {
                    message.push('Пользователь ' + userName + ' сменил свойства задачи');
                }
                callback && callback(message.join('<br>'));
            }
        });
    };
    var userHash = req.body.userHash || '',
        userId = req.body.userId,
        sourceTaskId = req.body.sourceTaskId,
        sourceParentTaskId = req.body.sourceParentTaskId,
        userName = getActiveUserName(req.body.userId),
        query;
  
    var obj = {
        id: req.body.id || req.body.userId,
        archive: req.body.archive || 0,
        subject: req.body.subject,
        taskAuthorId: req.body.taskAuthorId,
        taskExecutorId: req.body.taskExecutorId,
        taskInspectorId: req.body.taskInspectorId || '',
        workBegin: req.body.workBegin,
        workEnd: req.body.workEnd,
        complete: req.body.complete,
        needTime: req.body.needTime,
        parentTaskId: req.body.parentTaskId || req.body.parentId || req.body.targetTaskId || 0
    };
    // BB
    // в случае, если задачу переносят в Архив, мышкой,
    // то ей добавляю флаг archive = 1
    // И она не будет показываться в дереве
    //
    if (obj.parentTaskId == archiveTaskId) {
        obj.archive = 1;
    }        
    if (obj.id == 0) {
        return res.json({
            success: true,
            errors: [cnt.errorDbWrite]
        });
    }
    if (typeof req.body.status != 'undefined') {
        obj.status = req.body.status.value || req.body.status;
    }
    if (typeof req.body.priority != 'undefined') {
        obj.priority = req.body.priority.value || req.body.priority;
    }
    if (obj.status == 'Решена') {        
        obj.complete = '100%';
    } else if (obj.status == 'Закрыта') {
        obj.complete = '100%';
   
        if (typeof obj.workEnd == 'undefined' || obj.workEnd == '') {
            obj.workEnd = u.getCurrentDate();
        }
    } else {
        if (obj.status == 'Новая' && obj.complete != '0%') {
            obj.status = 'В работе';
        } else if (obj.complete != '0%' && obj.status == 'В работе') {
           // 
        } else {
            obj.complete = '0%';
            obj.workEnd = '';
        }
    }
    var set = [];
    
    for (var key in obj) {
        var value = obj[key];

        if (typeof value != 'undefined') {
            if (typeof value == 'object') {
                set.push("`" + key + "` = '" + value.join(',') + "'" );
            } else {
                set.push("`" + key + "` = '" + value + "'" );
            }            
        }
    };
    getTaskChangeHistoryMsg(obj, userName, function(changeMessage) {
        var changeDate = u.getCurrentDate(),
            query = "\n INSERT INTO `TasksChangeHistory` (`id`, `taskId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                    "\n VALUES(null, '" + obj.id + "', '" + userId + "', '" + changeMessage + "', '" + changeDate + "')";

        tasksDb.query(query, function(err) {
            if (!err && commonSocket) {
                commonSocket.emit('update-task-change-history', {
                    taskId: obj.id,
                    changeUserId: userId,
                    changeMessage: changeMessage,
                    changeDate: changeDate,
                    taskAuthorId: obj.taskAuthorId,
                    taskExecutorId: obj.taskExecutorId,
                    taskInspectorId: obj.taskInspectorId == 'undefined' ? [] : obj.taskInspectorId
                });
            }
        });    
    });   
    query = "\n UPDATE `Tasks` SET " + set.join(', ') + " WHERE `id` = '" + obj.id + "'; "; 

    tasksDb.query(query, function(err) {
        if (!err) {
            if (typeof sourceTaskId != 'undefined') {
               updateParentTask(sourceParentTaskId, userHash);
            }
            if (typeof obj.taskAuthorId != 'undefined') {
                query = "\n SELECT *, DATE_FORMAT(`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd`, " +
                        "\n (SELECT `name` FROM `Members` WHERE `id` = '" + obj.taskAuthorId + "') AS `taskAuthor` " +
                        "\n FROM `Tasks`" +
                        "\n WHERE `id` = '" + obj.id + "'";                
            } else {
                query = "\n SELECT *, DATE_FORMAT(`workBegin`, '%Y-%m-%d %H:%i:%s') AS `workBegin`, DATE_FORMAT(`workEnd`, '%Y-%m-%d %H:%i:%s') AS `workEnd` " +
                        "\n FROM `Tasks`" +
                        "\n WHERE `id` = '" + obj.id + "'";                     
            }
            tasksDb.query(query, function(err, result) {
                if (!err) {
                    var data = result[0];
                    
                    data.userHash = userHash;
                    data.userName = userName;
                    data.taskSubject = obj.subject;
                    data.originParentTaskId = sourceParentTaskId || null;
                    
                    res.json({
                        success: true,
                        data: data
                    });
                    if (commonSocket) {
                        commonSocket.emit('update-task', data);
                        commonSocket.emit('set-task-unread', {
                            taskId: data.id,
                            userHash: userHash
                        });
                    }
                    if (data.parentTaskId != 0) {
                        updateParentTask(data.parentTaskId, userHash);
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
router.post('/set-task-read', function(req, res, next) {
    var taskId = req.body.taskId,
        userId = req.body.userId,
        forceMode = req.body.forceMode;
    
    setTaskRead(taskId, userId, forceMode, function(result) {
        res.send(result);
    });
});
router.post('/set-task-unread', function(req, res, next) {
    var taskId = req.body.taskId,
        userId = req.body.userId,
        forceMode = req.body.forceMode || false,
        queryArr = [];

    if (taskId) {
        query = "\n SELECT * FROM `Tasks` WHERE `id` = '" + taskId + "'";

        tasksDb.query(query, function(err, taskDetail) {
            if (!err) {
                if (forceMode == 'true') {
                    queryArr.push("\n DELETE FROM `TasksUserRead` WHERE `parentTaskId` = '" + taskId + "' AND `userId` = '" + userId + "'");
                    queryArr.push("\n DELETE FROM `TasksUserRead` WHERE `id` = '" + taskId + "' AND `userId` = '" + userId + "'");
                } else {
                    queryArr.push("\n DELETE FROM `TasksUserRead` WHERE `taskId` = '" + taskId + "' AND `userId` = '" + userId + "'");
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
router.post('/is-task-read', function(req, res, next) {
    var taskId = req.body.taskId,
        userId = req.body.userId,
        query;

    if (!taskId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else if (taskId == '0') {    
        res.json({
            success: false
        });
    } else {
        query = "\n SELECT * FROM `Tasks` WHERE `id` = '" + taskId + "'";

        tasksDb.query(query, function(err, taskDetail) {        
            if (!err) {
                if (!taskDetail[0].hasChildren) {
                    query = "\n SELECT COUNT(*) AS `taskReadTotal` FROM `TasksUserRead` WHERE `userId` = '" + userId + "' AND `id` = '" + taskDetail[0].id + "'";

                    tasksDb.query(query, function(err, result) {
                        if (!err) {
                            if (result[0].taskReadTotal > 0) {
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
                    query = "\n SELECT COUNT(*) AS `taskTotal` FROM `Tasks` WHERE `parentTaskId` = '" + taskDetail[0].id + "'; " +
                            "\n SELECT COUNT(DISTINCT(`taskId`)) AS `taskReadTotal` FROM `TasksUserRead` WHERE `userId` = '" + userId + "' AND `parentTaskId` = '" + taskDetail[0].id + "'";

                    tasksDb.query(query, function(err, result) {
                        if (!err) {
                            var a = result[0][0],
                                b = result[1][0];

                            if (a.taskTotal == b.taskReadTotal) {
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
router.post('/add-task-notify', function(req, res, next) {
    var msg = req.body.msg,
        date = req.body.date || u.getCurrentDate(),
        notifyAuthorId = req.body.notifyAuthorId || req.body.userId, //<-- if not set notifyAuthorId get userId from userHash
        notifyTargetUserId = req.body.notifyTargetUserId;
   
    var query = "\n INSERT INTO `TasksNotify` (`id`, `msg`, `notifyAuthorId`, `notifyTargetUserId`, `date`)" +
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
});
router.post('/del-task-notify', function(req, res, next) {
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
        query = "\n DELETE FROM `TasksNotify` " + where;
        
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
router.post('/get-task-notify', function(req, res, next) {
    var notifyId = req.body.notifyId,
        query = "\n SELECT * FROM `TasksNotify` WHERE `id` = '" + notifyId + "'";    
    
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
router.post('/get-task-notify-list', function(req, res, next) {
    var userTargetId = req.body.userTargetId,
        skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || null,
        limit;
    
    if (!userTargetId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        if (take != null) {
            limit = "\n LIMIT " + skip + ", " + take + ";"
        } else {
            limit = ";";
        }
        
        var query = "\n SELECT `id`, `msg`, `notifyAuthorId`, `notifyTargetUserId`, DATE_FORMAT(`date`, '%Y-%m-%d %H:%i:%s') AS `date` FROM `TasksNotify` WHERE FIND_IN_SET(`notifyTargetUserId`, '" + userTargetId + "')>0" +
                    "\n ORDER BY `date` DESC"+
                    limit +                    
                    "\n SELECT COUNT(*) AS `total` FROM `TasksNotify` WHERE FIND_IN_SET(`notifyTargetUserId`, '" + userTargetId + "')>0";
            
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
    }
});
router.post('/add-task-history', function(req, res, next) {
    var taskId = req.body.taskId,
        changeMessage = req.body.changeMessge,
        changeDate = req.body.changeDate || u.getCurrentDate(),        
        changeMessage = req.body.changeMessge,
        changeUserId = req.body.changeUserId;        
        
    var query = "\n INSERT INTO `TasksChangeHistory` (`id`, `taskId`, `changeUserId`, `changeMessage`, `changeDate`)"+
                "\n VALUES(null, '" + taskId + "', '" + changeUserId + "', '" + changeMessage + "', '" + changeDate + "')";
       
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
router.post('/get-task-history-list', function(req, res, next) {
    var taskId = req.body.taskId,    
        query = "\n SELECT `id`, `taskId`, `changeUserId`, `changeMessage`, DATE_FORMAT(`changeDate`, '%Y-%m-%d %H:%i:%s') AS `changeDate` FROM `TasksChangeHistory` WHERE `taskId` = '" + taskId + "' ORDER BY `changeDate`";

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
    tasksDb = mysql.createPool(settings.tasksDb);
    
    //tasksDb = db = mysql.createConnection(settings.tasksDb);
    //voiceipDb = mysql.createConnection(settings.voiceipDb);    
    //wwwDb = mysql.createConnection(settings.wwwDb);
    //sbcDb = mysql.createConnection(settings.sbcDb);    
    //u.handleDisconnect(tasksDb);
    //u.handleDisconnect(voiceipDb);
    //u.handleDisconnect(wwwDb);
    //u.handleDisconnect(sbcDb);
    
    io.on('connection', function(socket) {
        socket.emit('task-socket-ready');
        localSocket = socket;
    });   
    return router;
};
