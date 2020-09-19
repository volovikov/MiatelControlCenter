var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql'),
    cnt = require('../constant'),
    commonSocket,
    localSocket = null;
    
var email = require("mail-listener2"),    
    mailBox = new email({
        username: 'support@miatel.ru',
        password: 'fvcD5pmy37',        
        host: '10.10.20.25',
        port: 993,
        tls: true,
        mailbox: 'INBOX' ,
        debug: console.log, 
        connTimeout: 10000,
        authTimeout: 300000,
        searchFilter: ["UNSEEN", "FLAGGED"],
        markSeen: true,
        fetchUnreadOnStart: true,    
        tlsOptions: { 
            rejectUnauthorized: false
        }
    });    
    
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
/*
router.all('*', function(req, res, next) {
    var userHash = req.body.userHash;

    if (userHash && userHash != '') {    
        req.body.userId = getUserIdFromHash(userHash, req.session.users);
        next();
    } else {
         res.json({
            success: false,
            errors: [cnt.errorParamsGet]
        });
    }
});
*/
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
        socket.emit('mail-socket-ready');
        localSocket = socket;
return;
        mailBox.start();
        
        mailBox.on('server:connected', function(){
            socket.emit('mail-inbox-connected');
        });        
        mailBox.on('server:disconnected', function() {
            socket.emit('mail-inbox-disconnected');
        });
        mailBox.on('error', function(data) {
console.log(data);           
            socket.emit('mail-inbox-error', data);
        });
        mailBox.on('mail', function(mail, seqno, attributes) {
console.log(mail);            
            socket.emit('mail-inbox-recived', mail);
        });        
    });       
    return router;
};
    