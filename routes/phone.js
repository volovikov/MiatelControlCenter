var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    util = require('../util'),
    commonSocket,
    localSocket = null;

var defaultPhoneType = 'other',
    defaultPhoneCategory = 'city';

router.post('/get-phone-list', function(req, res, next) {
    var userHash = req.body.userHash,
        where = [];

    var countryId = req.body.countryId,
        cityId = req.body.cityId,
        category = req.body.category || defaultPhoneCategory,
        type = req.body.type;
        
    if (category == 'other') {
        if (typeof type == 'undefined') {
            type = defaultPhoneType;
        }
        if (!countryId && !cityId) {
            res.json({
                success: true,
                errors: [cnt.errorParamsGet]
            });        
        }
    }        
    var obj = {
        countryId: countryId || '',
        cityId: cityId || '',
        type: type || '',
        category: category
    };        
    var skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,      
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '';    

    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }        
    for (var i in obj) {
        var val = obj[i];
        
        if (val != '') {
            where.push("`m`.`" + i + "` = '" + obj[i] + "'");
        }
    }    
    var query = "\n USE `miatel_net`;" +
                "\n SELECT `m`.*, `c`.`cityName`, `n`.`countryName` FROM `mvatc_phoneList` AS `m`" +
                "\n LEFT JOIN `mvatc_cityList` AS `c` ON `c`.`cityId` = `m`.`cityId`" +
                "\n LEFT JOIN `mvatc_countryList` AS `n` ON `n`.`countryId` = `n`.`countryId`" +
                "\n WHERE " + where.join(' AND ') +
                order +
                "\n LIMIT " + skip + ", " + take + '; ' +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_phoneList` AS `m`" +
                "\n WHERE " + where.join(' AND ');

    wwwDb.query(query, function(err, data) {
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
router.post('/get-phone-list-tree', function(req, res, next) {
    var query = "\n USE `miatel_net`;" +
                "\n SELECT * FROM `mvatc_countryList`;"+
                "\n SELECT * FROM `mvatc_cityList` ORDER BY `countryId`;";

    wwwDb.query(query, function(err, data) {
        if (!err) {
            var countryList = data[1],
                cityList = data[2],
                tmp = {};
            
            var tree = {
                id: 0,
                text: 'Телефоны',
                items: {
                    city: {
                        id: 'city',
                        text: 'Городские',
                        items: []
                    },
                    federal: {
                        id: 'federal',
                        text: '8800'
                    },
                    mobile: {
                        id: 'mobile',
                        text: 'Мобильные'
                    }
                }
            };            
            var getCountry = function(countryId) {
                for (var i in countryList) {
                    var country = countryList[i];
                    
                    if (country.countryId == countryId) {
                        return {
                            id: country.countryId,
                            text: country.countryName
                        };
                    }
                }
            };       
            for (var i in cityList) {
                var city = cityList[i];

                if (typeof tmp[city.countryId] == 'undefined')  {
                    tmp[city.countryId] = getCountry(city.countryId);
                    tmp[city.countryId].tmp = {};
                };
                tmp[city.countryId].tmp[city.cityId] = {
                    id: city.countryId + '-' + city.cityId,
                    text: city.cityName,
                    items: [{
                        id: city.countryId + '-' + city.cityId + '-' + 'gold',
                        text: 'Золотые'
                    },{
                        id: city.countryId + '-' + city.cityId + '-' + 'silver',
                        text: 'Серебрянные'
                    },{
                        id: city.countryId + '-' + city.cityId + '-' + 'bronza',
                        text: 'Бронзовые'
                    },{
                        id: city.countryId + '-' + city.cityId + '-' + 'other',
                        text: 'Простые'
                    },{
                        id: city.countryId + '-' + city.cityId + '-' + 'offline',
                        text: 'Offline'
                    },{
                        id: city.countryId + '-' + city.cityId + '-' + 'private',
                        text: 'Private'
                    }]                        
                };
            }
            for (var i in tmp) {
                for (var j in tmp[i].tmp) {
                    if (typeof tmp[i].items == 'undefined') {
                        tmp[i].items = [];
                    }
                    tmp[i].items.push(tmp[i].tmp[j]);
                }
                delete tmp[i].tmp;
                tree.items.city.items.push(tmp[i]);
            }
            var tmp = [];
            
            for (var i in tree.items) {
                tmp.push(tree.items[i]);
            }
            tree.items = tmp;
            
            res.json({
                success: true,
                data: {
                    tree: tree
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
router.post('/get-phone-country-list', function(req, res, next) {
    var userHash = req.body.userHash;
    
    var query = "\n USE `miatel_net`;" +
                "\n SELECT *," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`countryId` = `c`.`countryId`) AS `countryPhoneHave`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`countryId` = `c`.`countryId` AND `l`.`companyOwnerId` IS NOT NULL) AS `countryPhoneUse`" +
                "\n FROM `mvatc_countryList` AS `c`;" +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_countryList`;"
        
    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    statistic: data[1],
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
router.post('/get-phone-statistic-city', function(req, res, next) {
    var userHash = req.body.userHash;   
        where = [];
        
    var skip = parseInt(req.body.skip) || 0,
        take = parseInt(req.body.take) || cnt.defaultTake,        
        sortField = req.body.sort && req.body.sort.field || null,
        sortDir = req.body.sort && req.body.sort.dir || null,
        order = '';
        
    if (sortDir && sortField)  {
        order = "\n ORDER BY `" + sortField + "` " + sortDir;
    }        
    var query = "\n USE `miatel_net`;" +
                "\n SELECT *," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = `c`.`cityId`) AS `cityPhoneHave`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = `c`.`cityId` AND `l`.`companyOwnerId` IS NOT NULL) AS `cityPhoneUse`" +
                "\n FROM `mvatc_cityList` AS `c`" +
                order +
                "\n LIMIT " + skip + ", " + take + '; ' +
                "\n SELECT COUNT(*) AS `total` FROM `mvatc_cityList` ";

    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    statistic: data[1],
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
router.post('/get-phone-statistic-city-type', function(req, res, next) {
    var userHash = req.body.userHash,
        countryId = req.body.countryId,
        cityId = req.body.cityId;
 
    var query = "\n USE `miatel_net`;" +
                "\n SELECT " +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'gold') AS `goldPhoneTypeCount`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'silver') AS `silverPhoneTypeCount`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'bronza') AS `bronzaPhoneTypeCount`," +                
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'offline') AS `offlinePhoneTypeCount`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'private') AS `privatePhoneTypeCount`," +
                "\n (SELECT COUNT(*) FROM `mvatc_phoneList` AS `l` WHERE `l`.`cityId` = '" + cityId + "' AND `type` = 'other') AS `otherPhoneTypeCount`;";
        
    wwwDb.query(query, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: {
                    statistic: data[1][0]
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
router.post('/update-phone', function(req, res, next) {
    var userHash = req.body.userHash,
        phoneId = req.body.phoneId,
        type = req.body.type,
        cost = req.body.cost,
        countryId = req.body.countryId,
        cityId = req.body.cityId,
        comment = req.body.comment,
        type = req.body.type,            
        query;
        
    if (phoneId) {
        query = "\n USE `miatel_net`;"+
                "\n UPDATE `mvatc_phoneList` SET `cost` = '" + cost +"' WHERE `phoneId` = '" + phoneId + "';";        
    } else  if (countryId && cityId && cost) {        
        query = "\n USE `miatel_net`;"+
                "\n UPDATE `mvatc_phoneList` SET `cost` = '" + cost +"' WHERE `countryId` = '" + countryId + "' AND `cityId` = '" + cityId + "' AND `type` = '" + type +"';";
    } else {
        query = "\n USE `miatel_net`;"+
                "\n UPDATE `mvatc_phoneList` SET `type` = '" + type+ "', `comment` = '" + comment + "' WHERE `phoneId` = '" + phoneId +"';";
    } 
    wwwDb.query(query, function(err, data) {
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
router.post('/get-city', function(req, res, next) {
    var cityId = req.body.cityId;

    if (typeof cityId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    } else {
        var query = "\n SELECT * FROM `mvatc_cityList` WHERE `cityId` = '" + cityId +"'"; 

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
router.post('/update-city', function(req, res, next) {
    var params = {
        cityId: req.body.cityId,
        cityName: req.body.cityName,
        countryId: req.body.countryId,
        phoneDisplayFormat: req.body.phoneDisplayFormat,
        phoneType: req.body.phoneType,
        prefix: req.body.prefix,
        range: req.body.range
    };        
    if (typeof params.cityId == 'undefined') {
        res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }  else {
        var set = [];
        
        for (var key in params) {
            if (typeof params[key] != 'undefined' && params[key] != '') {
                set.push("`" + key + "` = '" + params[key] +"'");
            }            
        }
        var query = "\n USE `miatel_net`;"+
                    "\n UPDATE `mvatc_cityList` SET " + set.join(', ') + " WHERE `cityId` = '" + params.cityId +"'";
console.log(query);            
        wwwDb.query(query, function(err, data) {
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
module.exports = function(io, settings) {
    tasksDb = db = mysql.createConnection(settings.tasksDb);
    voiceipDb = mysql.createConnection(settings.voiceipDb);    
    wwwDb = mysql.createConnection(settings.wwwDb);
    sbcDb = mysql.createConnection(settings.sbcDb);    
    util.handleDisconnect(tasksDb);
    util.handleDisconnect(voiceipDb);
    util.handleDisconnect(wwwDb);
    util.handleDisconnect(sbcDb);             
    return router;
};
