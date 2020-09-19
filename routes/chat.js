var express = require('express'),
    router = express.Router(),
    mysql  = require('mysql');
    
module.exports = function(io) {
    io.on('connection', function(socket) {
        socket.emit('chat-socket-ready');
        
        socket.on('chat-user-send', function(data) {
            io.emit('chat-user-send', data);
        });
        socket.on('chat-operator-send', function(data) {
            io.emit('chat-operator-send', data);
        });
        socket.on('chat-operator-accept', function(data) {
            io.emit('chat-operator-accept', data);
        });        
    });
    return router;
};
