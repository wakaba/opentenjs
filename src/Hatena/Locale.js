// Work as standalone. do not depent on Ten
if (!self.Hatena) var Hatena = {};

if (!Hatena.Locale) {
  document.createElement('time'); // IE

Hatena.Locale = {
    /* --- Languages --- */

    getAvailLangs: function () {
        if (this._availLangs) return this._availLangs;
        var de = document.documentElement;
        var langs = de ? de.getAttribute('data-avail-langs') : '';
        if (langs) {
            langs = langs.split(/\s+/);
        } else {
            langs = [];
        }
        this._availLangs = langs;
        return langs;
    },

    setAcceptLang: function (newLang) {
        var cookie = new this.Cookie();
        cookie.set('Accept-Language', newLang, {domain: this.cookieDomain, expires: '+1y', path: '/'});
        cookie.set('_hatena_set_lang', 1, {domain: this.cookieDomain, expires: '+1d', path: '/'});
    },

    getTextLang: function () {
        var docEl = document.documentElement;
        if (!docEl) return 'ja';
        var lang = docEl.getAttribute('lang');
        return lang || 'ja';
    },

    loadTextData: function () {
        var key = 'textDataLoaded' + this.textDataDirName + this.textDataFileNameStemSuffix;
        if (this[key]) return;
        this[key] = true;

        var self = this;
        var host = this.dataHost;
        var lang = this.getTextLang();
        var date = new Date;
        var url = (this.textDataScheme) + '://' + host + '/js/' + this.textDataDirName + 'texts-' + lang + this.textDataFileNameStemSuffix + '.js?' + date.getFullYear() + date.getMonth() + date.getDate();

        if (typeof Ten != "undefined" && Ten.AsyncLoader) {
            Ten.AsyncLoader.loadScripts([url], function () {
                var key = 'Hatena.Locale,' + self.project + ',Text';
                Ten.AsyncLoader.registerObject(key, self);
            });
        } else {
            var script = document.createElement('script');
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    },

    text: function (msgid) {
        var allArgs = arguments;
        var lang = this.getTextLang();
        var entry;
        try {
            entry = Hatena[this.project].Locale.Data.Text[lang][msgid];
        } catch (e) {}
        if (entry) {
            var v = entry.value;
            var args = entry.args;
            if (args) {
                var i = 0;
                return v.replace(/%s/g, function () {
                    return allArgs[parseInt(args[i++])];
                });
            } else {
                return v;
            }
        } else {
            return msgid;
        }
    },

    textN: function (msgid, n) {
        var allArgs = arguments;
        var lang = this.getTextLang();
        n = n || 0;
        var entry;
        try {
            entry = Hatena[this.project].Locale.Data.Text[lang][msgid];
        } catch (e) { }
        if (entry) {
            var qt = entry.quanttype || 'o';
            var v = entry.value;
            var args = entry.args;
            if (qt == '1_o') {
                if (n == 1) {
                    v = entry.value_1;
                    args = entry.args_1;
                }
            } else if (qt == '01_o') {
                if (n == 0 || n == 1) {
                    v = entry.value_1;
                    args = entry.args_1;
                }
            }

            if (args) {
                var i = 0;
                return v.replace(/%s/g, function () {
                    return allArgs[1 + parseInt(args[i++])];
                });
            } else {
                return v;
            }
        } else {
            return msgid;
        }
    },

    textFwN: function (msgid, n) {
        var lang = this.getTextLang();
        if (/^ja(?:-|$)$/.test(lang)) {
            //
        } else {
            n *= 2;
        }

        var args = [msgid, n, this.number(n)];
        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return this.textN.apply(this, args);
    },

    // IE
    _period00: new RegExp('\\' + Number(0).toLocaleString().replace(/0/g, '') + '0+$'),

    number: function (n) {
        return (n + 0).toLocaleString().replace(this._period00, '');
    },

    /* --- Regions --- */

    getAvailRegions: function () {
        if (this._availRegions) return this._availRegions;
        var de = document.documentElement;
        var regions = de ? de.getAttribute('data-avail-regions') : '';
        if (regions) {
            regions = regions.split(/\s+/);
        } else {
            regions = [];
        }
        this._availRegions = regions;
        return regions;
    },

    getRegionCode: function () {
        var docEl = document.documentElement;
        if (!docEl) return 0;
        var region = docEl.getAttribute('data-region');
        return parseInt(region || 0);
    },

    setRegionCode: function (newRegionCode) {
        var cookie = new this.Cookie();
        cookie.set('_hatena_region', newRegionCode, {domain: this.cookieDomain, expires: '+1y', path: '/'});
    },

    /* --- Date and Time --- */

    datetimeHTML: function (dt) {
        var y = '000' + dt.getUTCFullYear(); y = y.substring(y.length - 4);
        var M = '0' + (dt.getUTCMonth() + 1); M = M.substring(M.length - 2);
        var d = '0' + dt.getUTCDate(); d = d.substring(d.length - 2);
        var h = '0' + dt.getUTCHours(); h = h.substring(h.length - 2);
        var m = '0' + dt.getUTCMinutes(); m = m.substring(m.length - 2);
        var s = '0' + dt.getUTCSeconds(); s = s.substring(s.length - 2);
        var ms = '00' + dt.getUTCMilliseconds(); ms = ms.substring(ms.length - 3);
        return '<time datetime="'+y+'-'+M+'-'+d+'T'+h+':'+m+':'+s+'.'+ms+'Z">' + dt.toLocaleString() + '</time>';
    },

    /* You have to add service name tags to msgids such as "minutes_n"
       in Hatena::Translator such that messages are included in
       data-??.js. */
    deltaDatetime: function (dt) {
        function datetime_to_delta (date) {
            var diff   = (new Date().getTime() - date.getTime()) / 1000;
            var future = diff < 0;
            if (future) diff = -diff;
            diff = Math.floor(diff / 60);
            if (diff < 60) {
                return { num : diff, unit : 'minutes_n', future : future };
            }
            diff = Math.floor(diff / 60);
            if (diff < 24) {
                return { num : diff, unit : 'hours_n', future : future };
            }
            diff = Math.floor(diff / 24);
            if (diff < 365) {
                return { num : diff, unit : 'days_n', future : future };
            }
            diff = Math.floor(diff / 365);
            return { num : diff, unit : 'years_n', future : future };
        }

        var delta = datetime_to_delta(dt);

        if (typeof delta.num != "undefined") {
            var text = Hatena.Locale.textN(delta.unit, delta.num, delta.num);
            if (delta.future) {
                return Hatena.Locale.text('datetime.later', text);
            } else {
                return Hatena.Locale.text('datetime.ago', text);
            }
        } else {
            return dt.toLocaleString();
        }
    },

    updateTimestamps: function (root) {
        root = root || document;
        var targets = root.getElementsByTagName('time'); // XXX class=""
        for (var i = 0, len = targets.length; i < len; i++) {
            var time = targets[i];
            var dt = time._date;
            if (!dt) {
                var dtf = targets[i].getAttribute('datetime').match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z/);
                time._date = dt = new Date(Date.UTC(+dtf[1], +dtf[2] - 1, +dtf[3], +dtf[4], +dtf[5], +dtf[6]));
            }
            time.innerHTML = Hatena.Locale.deltaDatetime(dt);
        }
    },

    setupTimestampUpdater : function () {
        if (Hatena.Locale._timestampUpdaterEnabled) return;
        Hatena.Locale._timestampUpdaterEnabled = true;

        Hatena.Locale.updateTimestamps();
        setInterval(function () {
            Hatena.Locale.updateTimestamps();
        }, 60 * 1000);
    },

    /* --- URLs and Navigation --- */

    reload: function (args) {
        var query = location.search;
        if (query) {
            args = args || {};
            var preserve = args.preserve || {};

            query = query.replace(/^\?/, '').split(/[&;]/);
            var changed = false;
            var newQuery = [];
            for (var i = 0; i < query.length; i++) {
                var qp = query[i];
                var m;
                if ((m = qp.match(/^(locale.[^=]+)/))) {
                    if (preserve[m[1]]) {
                        newQuery.push(qp);
                    } else {
                        changed = true;
                    }
                } else {
                    newQuery.push(qp);
                }
            }

            if (changed) {
                location.search = '?' + newQuery.join('&');
                return;
            }
        } 

        location.reload(true);
    },

    reloadIfWrongLocale: function () {
        var cookie = new this.Cookie();

        if (/\blocale\.(?:lang|region|country)\b/.test(location.search)) {
            return;
        }

        if (cookie.get('_hatena_locale_reload')) {
            cookie.set('_hatena_locale_reload', '', {domain: this.cookieDomain, expires: '-1y', path: '/'});
            return;
        } else {
            var cookieLang = (cookie.get('Accept-Language') || '').split(/,/)[0].split(/;/)[0].replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
            var cookieRegion = cookie.get('_hatena_region');
            if (!cookieLang || cookieRegion == null || cookieRegion == '') return;
            cookieRegion = parseInt(cookieRegion);

            var currentLang = Hatena.Locale.getTextLang();
            var currentRegion = Hatena.Locale.getRegionCode();
            if (currentLang == cookieLang && currentRegion == cookieRegion) return;

            var availLangs = Hatena.Locale.getAvailLangs();
            var availRegions = Hatena.Locale.getAvailRegions();
            if (availLangs.join(",").indexOf(cookieLang) == -1) return;
            if (availRegions.join(",").indexOf(cookieRegion) == -1) return;

            cookie.set('_hatena_locale_reload', 1, {domain: this.cookieDomain, path: '/'});
            location.reload(true);
            return;
        }
    },

    urlWithLangAndRegion: function (url) {
        var q = [];
        if (/\?/.test(url)) {
            var u = url.split(/\?/, 2);
            var qp = u[1].split(/[&;]/);
            for (var i = 0; i < qp.length; i++) {
                if (!/^locale\.(lang|region)=/.test(qp[i])) {
                    q.push(qp[i]);
                }
            }
            url = u[0];
        }
        q.push('locale.lang=' + encodeURIComponent(this.getTextLang()));
        q.push('locale.region=' + encodeURIComponent(this.getRegionCode()));
        return url + '?' + q.join('&');
    },

    /* --- Cookie and remote data configuration --- */

    project: 'Default',
    textDataScheme: 'http',
    textDataFileNameStemSuffix: '',
    textDataDirName: '',
    dataHost: location.host,
    cookieDomain: '.hatena.ne.jp'
};
Hatena.Locale.Cookie = function () { this.init.apply(this, arguments) };
Hatena.Locale.Cookie.prototype = {
    init : function (string) {
        this.cookies = this.parse(string);
    },

    parse: function(string) {
        var cookies = { };

        var segments = (string || document.cookie).split(/;\s*/);
        while (segments.length) {
            try {
                var segment = segments.shift().replace(/^\s*|\s*$/g, '');
                if (!segment.match(/^([^=]*)=(.*)$/))
                    continue;
                var key = RegExp.$1, value = RegExp.$2;
                if (value.indexOf('&') != -1) {
                    value = value.split(/&/);
                    for (var i = 0; i < value.length; i++)
                        value[i] = decodeURIComponent(value[i]);
                } else {
                    value = decodeURIComponent(value);
                }
                key = decodeURIComponent(key);

                cookies[key] = value;
            } catch (e) {
            }
        }

        return cookies;
    },

    set: function(key, value, option) {
        this.cookies[key] = value;

        if (value instanceof Array) {
            for (var i = 0; i < value.length; i++)
                value[i] = encodeURIComponent(value[i]);
            value = value.join('&');
        } else {
            value = encodeURIComponent(value);
        }
        var cookie = encodeURIComponent(key) + '=' + value;

        option = option || { };
        if (typeof option == 'string' || option instanceof Date) {
            // deprecated
            option = {
                expires: option
            };
        }

        if (!option.expires) {
            option.expires = this.defaultExpires;
        }
        if (/^\+?(\d+)([ymdh])$/.exec(option.expires)) {
            var count = parseInt(RegExp.$1);
            var field = ({ y: 'FullYear', m: 'Month', d: 'Date', h: 'Hours' })[RegExp.$2];

            var date = new Date;
            date['set' + field](date['get' + field]() + count);
            option.expires = date;
        }

        if (option.expires) {
            if (option.expires.toUTCString)
                option.expires = option.expires.toUTCString();
            cookie += '; expires=' + option.expires;
        }
        if (option.domain) {
            cookie += '; domain=' + option.domain;
        }
        if (option.path) {
            cookie += '; path=' + option.path;
        } else {
            cookie += '; path=/';
        }

        return document.cookie = cookie;
    },
    get: function(key) {
        return this.cookies[key];
    },
    has: function(key) {
        return (key in this.cookies) && !(key in Object.prototype);
    },
    clear: function(key) {
        this.set(key, '', new Date(0));
        delete this.cookies[key];
    }
};

if (/\.hatena\.com$/i.test(location.hostname)) {
    Hatena.Locale.cookieDomain = '.hatena.com';
}

} // if (!Hatena.Locale)

/*

Hatena.Locale

Copyright 2009-2011 Hatena <http://www.hatena.com/>.

This library is free software; you may redistribute it and/or modify
it under the same terms as the Perl programming language.

*/
