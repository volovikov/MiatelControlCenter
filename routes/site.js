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
var getEscapeString = function(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            //case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}
var handleDisconnect = function(connection) {
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
router.post('/get-site-settings', function(req, res, next) {
    res.json({
        success: true,
        data: {
            siteName: 'Miatel',
            generalContentHead: '<link rel="canonical" href="http://miatel.net/"> <meta charset="utf-8"><title><?php echo $sectionName; ?></title><meta name="description" content="Описание">',
            generalContentBody: '<div class="wrap"><div class="header-main__placeholder js-header-height"></div><header class="header-main">'
        }
    });
});
router.post('/get-site-language-list', function(req, res, next) {
    var query = "\n SELECT *, `id` AS `languageId` FROM `mvatc_siteLanguage`";

    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data:{
                    list: data,
                    total: data.length
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
router.post('/get-site-template', function(req, res, next) {
    var templateId = req.body.templateId;
    
    if (typeof templateId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamGet]
        });        
    } else {
        var query = "\n SELECT `t`.`templateLanguageId`, `t`.`templateName`, `t`.`templateContentHead`,`t`.`templateContentBody`, DATE_FORMAT(`t`.`templateCreateDate`, '%Y-%m-%d %H:%i:%s') AS `templateCreateDate`, `t`.`id` AS `templateId`" +
                    "\n FROM `mvatc_siteTemplate` AS `t`" +
                    "\n JOIN `mvatc_siteLanguage` AS `l` ON `l`.`id` = `t`.`templateLanguageId`" +
                    "\n WHERE `t`.`id` = '" + templateId +"'";
            
        wwwDb.query(query, function(err, data) {
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
router.post('/get-site-template-list', function(req, res, next) {
    var query = "\n SELECT `t`.`templateLanguageId`, `t`.`templateName`, `t`.`templateContentHead`,`t`.`templateContentBody`, DATE_FORMAT(`t`.`templateCreateDate`, '%Y-%m-%d %H:%i:%s') AS `templateCreateDate`, `t`.`id` AS `templateId`, `l`.`languageName` AS `templateLanguageName` " +             
                "\n FROM `mvatc_siteTemplate` AS `t`" +
                "\n JOIN `mvatc_siteLanguage` AS `l` ON `l`.`id` = `t`.`templateLanguageId`";

    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data:{
                    list: data,
                    total: data.length
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
router.post('/del-site-template', function(req, res, next) {
    var templateId = req.body.templateId; 
    
    if (typeof templateId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamGet]
        });         
    } else {
        var query = "\n DELETE FROM `mvatc_siteTemplate` WHERE `id` = '" + templateId + "'";
        
        wwwDb.query(query, function(err, data) {
            if (!err) {
                res.json({
                    success: true
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
router.post('/add-site-template', function(req, res, next) {
    var query = "\n INSERT INTO `mvatc_siteTemplate`" +
                "\n (`id`, `templateLanguageId`, `templateName`, `templateContentHead`, `templateContentBody`, `templateCreateDate`)" +
                "\n VALUES(null, '1', '', '', '', NOW())";
        
    wwwDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    id: result.insertId
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
router.post('/update-site-template', function(req, res, next) {
    var templateName = req.body.templateName,
        templateCreateDate = req.body.templateCreateDate,
        templateId = req.body.templateId || req.body.id,
        templateContentBody = getEscapeString(req.body.templateContentBody),
        templateContentHead = getEscapeString(req.body.templateContentHead),
        templateLanguageId = req.body.templateLanguageId;

    if (typeof templateId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n UPDATE `mvatc_siteTemplate` " +
                    "\n SET `templateName` = '" + templateName + "', `templateCreateDate` = '" + templateCreateDate + "', `templateContentBody` = '" + templateContentBody + "', `templateContentHead` = '" + templateContentHead+ "', `templateLanguageId` = '" + templateLanguageId + "'"  +
                    "\n WHERE `id` = '" + templateId +  "'";
            
        wwwDb.query(query, function(err) {
            if (err) {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            } else {
                res.json({
                    success: true
                });
            }
        }); 
    }   
});
router.post('/get-site-menu-tree', function(req, res, next) {
    var query = "\n SELECT `menuName` AS `text`, `menuParentId` AS `parentId`, `id` " +
                "\n FROM `mvatc_siteMenu` WHERE `menuParentId` > 0 ORDER BY `menuParentId` ASC";
    
    wwwDb.query(query, function(err, rows) {
        if (!err) {
            var tmp = {},
                tree = [];

            for (var i in rows) {
                var el = rows[i];
                tmp[el.id] = el;
            }
            for (var j in tmp) {
                var el = tmp[j];

                if (el.parentId == 1) {
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
            var items = [{
                id: 'language',
                text: 'Языки',
                parentId: 1
            },{
                id: 'template',
                text: 'Шаблоны',
                parentId: 0
            },{
                id: 'menu',
                text: 'Меню',
                items: tree,
                parentId: 0
            },{
                id: 'news',
                text: 'Новости',   
                parentId: 0
            },{
                id: 'content',
                text: 'Содержание',
                parentId: 0        
            }];
            res.json({
                success: true,
                data: {
                    tree: {
                        id: 0,
                        text: 'Сайт',
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
router.post('/get-site-menu', function(req, res, next) {
    var menuId = req.body.menuId || 1; //<-- rootMenuId = 1
    
    if (typeof menuId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamGet]
        });
    } else {
        var query = "\n SELECT `t`.`menuGroup`, `t`.`id` AS `menuId`, `t`.*, `c`.`contentName` AS `menuContentName`, `a`.`menuName` AS `menuParentName` " +
                    "\n FROM `mvatc_siteMenu` AS `t` " +
                    "\n LEFT JOIN `mvatc_siteContent` AS `c` ON `c`.`id` = `t`.`menuContentId`" + 
                    "\n LEFT JOIN `mvatc_siteMenu` AS `a` ON `a`.`id` = `t`.`menuParentId`" + 
                    "\n WHERE `t`.`id` = '" + menuId + "'";

        wwwDb.query(query, function(err, data) {
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
router.post('/get-site-menu-list', function(req, res, next) {   
    var menuParentId = req.body.menuParentId,
        where = '';

    if (typeof menuParentId != 'undefined') {
        where = "\n WHERE `t`.`menuParentId` = '" + menuParentId + "'";
    }    
    var query = "\n SELECT `t`.`id` AS `menuId`, `t`.*, `l`.`contentName` AS `menuContentName` " +             
                "\n FROM `mvatc_siteMenu` AS `t`" +
                "\n LEFT JOIN `mvatc_siteContent` AS `l` ON `l`.`id` = `t`.`menuContentId`" + 
                where;

    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data:{
                    list: data,
                    total: data.length
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
router.post('/update-site-menu', function(req, res, next) {
    var menuId = req.body.menuId,
        menuName = req.body.menuName,
        menuGroup = req.body.menuGroup,
        menuContentId = req.body.menuContentId,
        menuOrderPosition = req.body.menuOrderPosition,
        menuTemplateId = req.body.menuTemplateId,
        menuParentId = req.body.menuParentId;

    if (typeof menuId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n UPDATE `mvatc_siteMenu` " +
                    "\n SET `menuTemplateId` = '" + menuTemplateId + "', `menuGroup` = '" + menuGroup + "', `menuName` = '" + menuName + "', `menuContentId` = '" + menuContentId + "', `menuOrderPosition` = '" + menuOrderPosition + "', `menuParentId` = '" + menuParentId + "'"  +
                    "\n WHERE `id` = '" + menuId +  "'";
       
        wwwDb.query(query, function(err) {
            if (err) {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            } else {
                res.json({
                    success: true,
                    data: {
                        menuId: menuId,
                        menuName: menuName,
                        menuContentId: menuContentId,
                        menuOrderPosition: menuOrderPosition,
                        menuParentId: menuParentId
                    }
                });
            }
        }); 
    }   
});
router.post('/add-site-menu', function(req, res, next) {
    var menuParentId = req.body.menuParentId || 1;
    
    var query = "\n INSERT INTO `mvatc_siteMenu`" +
                "\n (`id`, `menuName`, `menuContentId`, `menuOrderPosition`, `menuParentId`, `menuGroup`)" +
                "\n VALUES(null, '', '0', '1', '" + menuParentId +"', '')";
        
    wwwDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    id: result.insertId,
                    menuId: result.insertId,
                    menuParentId: menuParentId,
                    menuOrderPosition: 1,
                    menuName: '',
                    menuContentId: null,
                    menuContentName: ''
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
router.post('/del-site-menu', function(req, res, next) {
    var menuId = req.body.menuId; 
    
    if (typeof menuId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });         
    } else {
        var query = "\n DELETE FROM `mvatc_siteMenu` WHERE `id` = '" + menuId + "'";
        
        wwwDb.query(query, function(err, data) {
            if (!err) {
                res.json({
                    success: true
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
router.post('/get-site-content-list', function(req, res, next) {
    var skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        q = req.body.q || null;

    var order = '',
        where = '';

    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }
    if (q) {
        where  = "\n WHERE `t`.`contentName` LIKE '%" + q + "%'"; 
    }
    if (q) {
        limit = ";";
    } else if (take == '-1') {
        limit = ";";        
    } else {
        limit = "\n LIMIT " + skip + ", " + take + ";";        
    }  
    var query = "\n SELECT `t`.`contentUrl`,`t`.`contentAuthorId`, `t`.`id`, `t`.`contentName`, DATE_FORMAT(`t`.`contentCreateDate`, '%Y-%m-%d %H:%i:%s') AS `contentCreateDate`, `t`.`id` AS `contentId` " +             
                "\n FROM `mvatc_siteContent` AS `t`"  +
                where + 
                order +
                limit +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_siteContent` AS `t` " + where;                

    wwwDb.query(query, function(err, result) {
        if (!err) {
            var total = result[1][0]['total'],
                list = result[0];
                
            res.json({
                success: true,
                data:{
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
router.post('/get-site-content', function(req, res, next) {
    var contentId = req.body.contentId; 
    
    if (typeof contentId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    } else {    
        var query = "\n SELECT `t`.`contentUrl`, `t`.`contentBody`, `t`.`contentHead`, `t`.`contentAuthorId`, `t`.`id`, `t`.`contentName`, DATE_FORMAT(`t`.`contentCreateDate`, '%Y-%m-%d %H:%i:%s') AS `contentCreateDate`, `t`.`id` AS `contentId` " +             
                    "\n FROM `mvatc_siteContent` AS `t`"  + 
                    "\n WHERE `id` = '" + contentId + "'";
            
        wwwDb.query(query, function(err, data) {
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
router.post('/add-site-content', function(req, res, next) {
    var robotId = cnt.robotId || 1;
    
    var query = "\n INSERT INTO `mvatc_siteContent`" +
                "\n (`id`, `contentName`, `contentHead`, `contentBody`, `contentCreateDate`, `contentAuthorId`, `contentUrl`)" +
                "\n VALUES(null, '', '', '', NOW(), '" + robotId + "', '')";
         
    wwwDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    contentId: result.insertId
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
router.post('/del-site-content', function(req, res, next) {
    var contentId = req.body.contentId; 
    
    if (typeof contentId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });         
    } else {
        var query = "\n DELETE FROM `mvatc_siteContent` WHERE `id` = '" + contentId + "'";
        
        wwwDb.query(query, function(err, data) {
            if (!err) {
                res.json({
                    success: true
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
router.post('/update-site-content', function(req, res, next) {
    var contentName = req.body.contentName,
        contentCreateDate = req.body.contentCreateDate,
        contentUrl = req.body.contentUrl,
        contentId = req.body.contentId,
        contentAuthorId = req.body.contentAuthorId,
        contentHead = getEscapeString(req.body.contentHead),        
        contentBody = getEscapeString(req.body.contentBody);

    if (typeof contentId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n UPDATE `mvatc_siteContent` " +
                    "\n SET `contentUrl` = '" + contentUrl +"', `contentAuthorId` = '" + contentAuthorId + "', `contentName` = '" + contentName + "', `contentCreateDate` = '" + contentCreateDate + "', `contentHead` = '" + contentHead + "', `contentBody` = '" + contentBody + "'"   +
                    "\n WHERE `id` = '" + contentId +  "'";
            
        wwwDb.query(query, function(err) {
            if (err) {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            } else {
                res.json({
                    success: true
                });
            }
        }); 
    }   
});
router.post('/get-site-news', function(req, res, next) {
    var newsId = req.body.newsId; 
    
    if (typeof newsId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });        
    } else {    
        var query = "\n SELECT `t`.`newsSection`, `t`.`newsContent`, `t`.`newsIntro`, `t`.`newsAuthorId`, `t`.`id`, `t`.`newsName`, DATE_FORMAT(`t`.`newsCreateDate`, '%Y-%m-%d %H:%i:%s') AS `newsCreateDate`, `t`.`id` AS `newsId` " +             
                    "\n FROM `mvatc_siteNews` AS `t`"  + 
                    "\n WHERE `id` = '" + newsId + "'";
            
        wwwDb.query(query, function(err, data) {
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
router.post('/get-site-news-list', function(req, res, next) {
    var skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        q = req.body.q || null;

    var order = '',
        where = '';
    
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }
    if (q) {
        where  = "\n WHERE `t`.`newsName` LIKE '%" + q + "%'"; 
    }
    if (q) {
        limit = ";";
    } else {
        limit = "\n LIMIT " + skip + ", " + take + ";";        
    }    
    var query = "\n SELECT `t`.`newsSection`, `t`.`newsAuthorId`, `t`.`id`, `t`.`newsName`, DATE_FORMAT(`t`.`newsCreateDate`, '%Y-%m-%d %H:%i:%s') AS `newsCreateDate`, `t`.`id` AS `newsId` " +             
                "\n FROM `mvatc_siteNews` AS `t`"  +
                where + 
                order +
                limit +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_siteNews` AS `t` " + where;                

    wwwDb.query(query, function(err, result) {
        if (!err) {
            var total = result[1][0]['total'],
                list = result[0];
                
            res.json({
                success: true,
                data:{
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
router.post('/add-site-news', function(req, res, next) {
    var robotId = cnt.robotId || 1;
    
    var query = "\n INSERT INTO `mvatc_siteNews`" +
                "\n (`id`, `newsSection`, `newsName`, `newsIntro`, `newsContent`, `newsCreateDate`, `newsAuthorId`)" +
                "\n VALUES(null, '', '', '', '', NOW(), '" + robotId + "')";

    wwwDb.query(query, function(err, result) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    newsId: result.insertId
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
router.post('/update-site-news', function(req, res, next) {
    var newsName = req.body.newsName,
        newsCreateDate = req.body.newsCreateDate,
        newsId = req.body.newsId,
        newsAuthorId = req.body.newsAuthorId,
        newsSection = req.body.newsSection,
        newsIntro = getEscapeString(req.body.newsIntro),        
        newsContent = getEscapeString(req.body.newsContent);

    if (typeof newsId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n UPDATE `mvatc_siteNews` " +
                    "\n SET `newsSection` = '" + newsSection + "', `newsAuthorId` = '" + newsAuthorId + "', `newsName` = '" + newsName + "', `newsCreateDate` = '" + newsCreateDate + "', `newsContent` = '" + newsContent + "', `newsIntro` = '" + newsIntro + "'"   +
                    "\n WHERE `id` = '" + newsId +  "'";
   
        wwwDb.query(query, function(err) {
            if (err) {
                res.json({
                    success: false,
                    errors: [cnt.errorDbWrite]
                });
            } else {
                res.json({
                    success: true
                });
            }
        }); 
    }   
});
router.post('/del-site-news', function(req, res, next) {
    var newsId = req.body.newsId; 
    
    if (typeof newsId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });         
    } else {
        var query = "\n DELETE FROM `mvatc_siteNews` WHERE `id` = '" + newsId + "'";
        
        wwwDb.query(query, function(err, data) {
            if (!err) {
                res.json({
                    success: true
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
module.exports = function(io, settings) {
    tasksDb = db = mysql.createConnection(settings.tasksDb);
    voiceipDb = mysql.createConnection(settings.voiceipDb);    
    wwwDb = mysql.createConnection(settings.wwwDb);
    sbcDb = mysql.createConnection(settings.sbcDb);    
    handleDisconnect(tasksDb);
    handleDisconnect(voiceipDb);
    handleDisconnect(wwwDb);
    handleDisconnect(sbcDb);         
    
    return router;
};
