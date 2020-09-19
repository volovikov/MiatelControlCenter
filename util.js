module.exports = {
    getCurrentDate: function() {
        var now = new Date();
        var year = "" + now.getFullYear();
        var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    },
    getUserIdFromHash: function(userHash, session) {
        if (session && typeof session[userHash] != 'undefined') {
            return session[userHash].id;
        } else {
            return false;
        }
    },
    getActiveUserName: function(userId, users) {
        for (var i in users) {
            if (users[i].id == userId) {
                return users[i].name;
            }            
        }
        return 'undefined';
    },     
    getEscapeString: function(str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
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
    },
    getQuoteToHtmlStr: function(str) {
        if (!str) {
            return;
        }
        var replace = {
            '\'': '&quot;',
            '\"': '&quot;',
            '<' : '&lt;',
            '>' : '&gt;'
        };
        for (var n in replace) {
            str = str.split(n).join(replace[n]);
        }
        return str;
    },
    getHtmlToQuoteStr: function(str) {
        if (!str) {
            return;
        }        
        var replace = {
            '&quot;': '\"',
            '&lt;': '<',
            '&gt;': '>'
        };
        for (var n in replace) {
            str = str.split(n).join(replace[n]);
        }
        return str;            
    },
    handleDisconnect: function(connection) {
        var that = this;
        
        connection.on('error', function(err) {
            if (!err.fatal) {
                return;
            } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log('Re-connecting lost connection ');
                connection = mysql.createConnection(connection.config);
                that.handleDisconnect(connection);
                connection.connect();
            } else {
                throw err;
            }        
        });    
    },
    getFormatedTimeStr: function(min) {
        if (min == null) {
            return '';
        } else if (min < 60) {
            return min + 'm';
        } else if (min < 480) {
            return (min/60) + 'h';
        } else {
            var d = Math.floor(min/60/8),
                h = Math.floor((min - (d * 480))/60);

            if (h == 0) {
                return d + 'd';
            } else {
                return d + 'd ' + h + 'h';
            }                
        } 
    },
};