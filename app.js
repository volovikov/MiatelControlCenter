var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    busboy = require('connect-busboy'), //<-- need for image upload. see index.js
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressSession = require('express-session'),
    store = require('express-mysql-session');
    logger = require('morgan'),
    memwatch = require('memwatch');

var clearLeaks = function() {
    clearTimeout(leak);
    memwatch.gc();
    leak = setTimeout(clearLeaks, 1000);
};
var leak = setTimeout(clearLeaks, 1000);

memwatch.on('leak', function(info) {
    console.log('Memmory leaks: ', info);    
});
var app = express(),
    server = require('http').Server(app),
    io = require("socket.io").listen(server);
    
server.listen(8080);

var settings = require('./settings'),    
    index = require('./routes/index'),    
    api = require('./routes/api')(io, settings),
    member = require('./routes/member')(io, settings),
    task = require('./routes/task')(io, settings),
    userSession = require('./routes/session')(io, settings),
    chat = require('./routes/chat')(io, settings),
    client = require('./routes/client')(io, settings),
    report = require('./routes/report')(io, settings),
    site = require('./routes/site')(io, settings),
    phone = require('./routes/phone')(io, settings),
    session = require('./routes/session')(io, settings),
    mail = require('./routes/mail')(io, settings);

app.use(busboy());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    key: 'session_cookie_name',
    secret: 'miatel', 
    resave: true,
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,   
    store: new store({
        host: 'localhost',
        user: 'root',
        password: 'BasBodEurp1_',
        database: 'nodejs_session',        
    })    
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/api', api);
app.use('/api/client', client);
app.use('/api/task', task);
app.use('/api/member', member);
app.use('/api/mail', mail);
app.use('/api/report', report);
app.use('/api/session', session);
app.use('/api/site/', site);
app.use('/api/phone/', phone);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});
module.exports = app;