var express = require('express'),        
    router = express.Router(),
    //lwip = require('lwip'),
    fs = require('fs');

router.get('/', function(req, res, next) {
    // BB
    // this method not work
    // content load from /publi
    //
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
        res.send(text);
    });        
});
/*
router.post('/upload-image', function(req, res, next) {
    var fstream,
        path = '/var/www/mcc.miatel.ru/public/files/', //<-- may be remove to constant.js file ? 
        prefix = 'resize-',
        maxSize = 120,
        resizeHeight, resizeWidth;
    
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        fstream = fs.createWriteStream(path + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            lwip.open(path + filename, function(err, img) {
                var w = img.width(),
                    h = img.height();
                
                resizeWidth = maxSize;
                resizeHeight = parseInt((maxSize * h/w).toFixed());

                if (resizeHeight < maxSize) {
                    resizeHeight = maxSize;
                    resizeWidth = parseInt((maxSize * w/h).toFixed());
                }                
                img.resize(resizeWidth, resizeHeight, function(err, resizeImg) {
                    if (resizeWidth > maxSize) {
                        img.crop(maxSize, maxSize, function(err, resizeImg) {                            
                            resizeImg.writeFile(path + prefix + filename, function(err) {                        
                                res.json({
                                    success: true,
                                    data: {
                                        file: path + filename,
                                        resizeFile: path + prefix + filename,
                                        fname: filename,
                                        resizeFileName: prefix + filename                                
                                    }
                                });
                            });                            
                        });
                    } else if (resizeHeight > maxSize) {
                        img.crop(maxSize, maxSize, function(err, resizeImg) {                            
                            resizeImg.writeFile(path + prefix + filename, function(err) {                        
                                res.json({
                                    success: true,
                                    data: {
                                        file: path + filename,
                                        resizeFile: path + prefix + filename,
                                        fname: filename,
                                        resizeFileName: prefix + filename                                
                                    }
                                });
                            });                            
                        });                        
                    } else {
                        resizeImg.writeFile(path + prefix + filename, function(err) {                        
                            res.json({
                                success: true,
                                data: {
                                    file: path + filename,
                                    resizeFile: path + prefix + filename,
                                    fname: filename,
                                    resizeFileName: prefix + filename                                
                                }
                            });
                        });                        
                    }                    
                });
            });
        });
    });    
});
*/
module.exports = router;
