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

var getGroupParentIds = function(taskId, callback) {
    var query = "\n SELECT `t1`.`id` AS `l1`, `t2`.`id` AS `l2`, `t3`.`id` AS `l3`, `t4`.`id` AS `l4`, `t5`.`id` AS `l5`, `t6`.`id` AS `l6`" +
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
router.post('/get-need-time', function(req, res, next) {
    var taskId = req.body.taskId;
    
    if (!taskId) {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        }); 
    } else {
        getGroupParentIds(taskId, function(ids) {
            if (!ids.length) {
                ids.push(taskId);
            }
            var query = "\n SELECT `t`.`id`, COUNT(*) AS `taskCompleteTotal`, SUM(`needTime`) AS `taskNeedTimeTotal`, `taskExecutorId`, " +
                        "\n (SELECT `name` FROM `Members` WHERE `id` = `t`.`taskExecutorId`) AS `taskExecutorName`" +
                        "\n FROM `Tasks` AS `t` WHERE `parentTaskId`IN (" + ids.join(',') + ") AND `taskExecutorId` != '' AND `hasChildren` = 0" +
                        "\n GROUP BY `t`.`taskExecutorId`";

            tasksDb.query(query, function(err, result) {
                if (!err) {
                    var totalTime = 0,
                        totalTask = 0;

                    for (var i in result) {
                        var rec = result[i];

                        totalTime += rec.taskNeedTimeTotal;
                        totalTask += rec.taskCompleteTotal;
                    }
                    result.push({
                        taskCompleteTotal: totalTask,
                        taskExecutorId: 0,
                        taskExecutorName: 'Итого',
                        taskNeedTimeTotal: totalTime
                    });
                    res.json({
                        success: true,
                        data: result
                    });
                } else {
                    res.json({
                        success: false,
                        errors: [cnt.errorDbRead]
                    });
                }          
            });        
        });           
    }
});
module.exports = function(io, settings, constant) {    
    tasksDb = mysql.createPool(settings.tasksDb);
    
    //tasksDb = db = mysql.createConnection(settings.tasksDb);
    //voiceipDb = mysql.createConnection(settings.voiceipDb);    
    //wwwDb = mysql.createConnection(settings.wwwDb);
    //sbcDb = mysql.createConnection(settings.sbcDb);    
    //handleDisconnect(tasksDb);
    //handleDisconnect(voiceipDb);
    //handleDisconnect(wwwDb);
    //handleDisconnect(sbcDb);               
    return router;
};