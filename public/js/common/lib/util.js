/**
 * General utilites module
 * 
 * @param {type} $
 * @param {type} kendo
 * @returns {unresolved}
 */
define([
    'jquery',
    'i18n!js/common/nls/main.js'
], function($, i18n) {

    var public = {
        ajaxRequest: function() {
            var that = this,
                noError = false,
                hasError = true,
                url, callback, data = {};

            if (!arguments.length) {
                callback(hasError);
            } else if (arguments.length == 2 && typeof arguments[1] == 'function') {
                url = arguments[0];
                callback = arguments[1];
            } else if (arguments.length == 3) {
                url = arguments[0];
                data = arguments[1];
                callback = arguments[2];                
            } else {
                callback(hasError);
            }
            $.ajax({
                url: app.getServerApiUrl() + url,
                data: data,
                success: function(r) {
                    if (typeof r == 'string' && r == '') {
                        return that.showCryticalError.call(that);
                    }
                    if (r.success == true || r.success === 'true') {
                        callback(noError, r.data);
                    } else {                        
                        callback(hasError, r.errors);
                    }
                },
                error: function() {
                    that.showCryticalError.call(that);
                }
            });
        },
        getFirstCharUpCase: function(str) {
            return str.slice(0, 1).toUpperCase() + str.slice(1);
        },
        getTimeFormatStr: function(dateTime) {
            return kendo.toString(dateTime, 'yyyy-MM-dd HH:mm:ss');
        },
        getCurrentDate: function() {
            return this.getTimeFormatStr(new Date()).split(' ')[0];
        },
        getCurrentTime: function() {
            return this.getTimeFormatStr(new Date()).split(' ')[1];
        },
        getCurrentDateTime: function() {
            return this.getCurrentDate() + ' ' + this.getCurrentTime();
        },
        getQuoteToHtmlStr: function(str) {
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
        getFormValue: function(formEl, getQuoted) {  
            var tmp = formEl.serializeArray(),
                result = {};

            for (var i in tmp) {
                var el = tmp[i];

                if (typeof result[el.name] != 'undefined') {
                    if (typeof result[el.name] == 'string') {
                        var x = result[el.name];
                        result[el.name] = [x, el.value];
                    } else {
                        result[el.name].push(el.value);
                    }                    
                } else if (el.value != '') {
                    if (typeof getQuoted == 'undefined' || getQuoted == true) {
                        result[el.name] = this.getQuoteToHtmlStr(el.value);
                    } else {
                        result[el.name] = el.value; //<-- need for code editor
                    }                    
                } else {
                    /**
                     * ВВ
                     * for multiselect element only
                     * 
                     * @type @exp;formEl@call;find
                     */
                    var e = formEl.find('[name="' + el.name + '"]'),
                        widget = kendo.widgetInstance(e);
                    
                    if (widget) {
                        var arr = widget.value(),
                            some = [];

                        for (var i in arr) {
                            var tmp = arr[i],
                                rec = widget.dataSource.get(tmp);
                        
                            some.push({
                                id: rec.id,
                                name: rec.name,
                                section: rec.section //<-- with section
                            });
                        }
                        result[el.name] = some;
                    } else {
                        result[el.name] = '';
                    }
                }    
            }
            return result;
        },
        setFormValue: function(formEl, obj) {
            $.each(formEl[0], function(i, e) {
                var el = $(e);
                    name = el.attr('name');
                    
                if (typeof obj[name] != 'undefined') {
                    var widget = kendo.widgetInstance(el);
                    
                    if (widget) {
                        widget.value(obj[name]);
                    } else {
                        el.val(obj[name]);
                    }
                }
            });            
        },
        getMainPhoneFormatStr: function(str) {
            if (str && typeof str == 'string') {
                return str.substr(0, 1) + '(' + str.substr(1, 3) + ')' + str.substr(4);
            }            
        },
        getServerPhoneFormatStr: function(str) {
            if (str && typeof str == 'string') {
                return str.replace('(', '').replace(')', '');
            }            
        },
        showCryticalError: function() {
            app.showPopupMsg('bad', i18n.err.title, i18n.err.crytical);
            app.publish('err-crytial');            
        },
        getRandomNumber: function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
    };
    return public;
}); 