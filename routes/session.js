var express = require('express'),
    router = express.Router(),
    cnt = require('../constant'),
    mysql  = require('mysql');

router.post('/get-session-list', function(req, res, next) {
    var skip = req.body.skip || 0,
        take = req.body.take || cnt.defaultTake,    
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '', 
        limit = '';
        
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }        
    if (take != 0) {
        limit = "\n LIMIT " + skip + ", " + take + ';';
    } else {
        limit = ';';
    }
    var query = "\n USE `miatelVoice`;" +
                "\n SELECT `id`, `userGlobalId`, `userHash`, `ownerSession`, `ipAddress`, `oldUserHash`, DATE_FORMAT(`connectionDateTime`, '%Y-%m-%d %H:%i:%s') AS `connectionDateTime` FROM `mvatc_userSession`" +
                order + 
                limit + 
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_userSession`";

    voiceipDb.query(query, function(err, result) {
        if (!err) {
            var total = result[2][0]['total'],
                list = result[1];
                
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
router.post('/del-session', function(req, res, next) {
    var id = req.body.id;
    
    if (!id) {
        return res.json({
            success: false,
            errors: [errorParamsGet]
        });
    }
    var query = "\n DELETE FROM `mvatc_userSession` WHERE `id` = '" + id + "'";

    voiceipDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false,
                errors: [errorDbWrite]
            })
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
    //handleDisconnect(tasksDb);
    //handleDisconnect(voiceipDb);
    //handleDisconnect(wwwDb);
    //handleDisconnect(sbcDb);         
    
    return router;
};
