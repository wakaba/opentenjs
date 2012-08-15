(function () {

var type;
var log = function (m) {
        if (window.console && console.log) {
                console.log([type, m]);
        }
};

var Messenger = function () { this.init.apply(this, arguments) };
Messenger.createForParent = function (origin /* for postMessage variant */, safeOriginPattern) {
        if (window.parent == window) return null;
        var iframe = document.createElement('iframe');
        var opts   = window.name.split('|', 2);
        var key    = opts[0];
        var url    = opts[1];
        document.body.appendChild(iframe);
        var output = iframe.contentWindow;
        output.name = key;
        iframe.width = 1;
        iframe.height = 1;
        iframe.setAttribute('style', 'height:1px;width:1px;visibility:hidden;');
        output.location.replace(url);
        return new this({
                key : key,
                url : url,
                input : window,
                output : output,
                safeOriginPattern: safeOriginPattern || /(?!)/
        });
};
Messenger.SIGNATURE = 'MZ';
Messenger.createForFrame = function (frame, url) {
        var output = frame.contentWindow;
        // 2821109907456 = 36 ** 8
        var key    = Messenger.SIGNATURE + Math.floor(Math.random() * 2821109907456 + 2821109907456).toString(36).substring(1) + '@';
        var empty  = this.findEmptyResource();
        if (!empty) return null;
        output.name  = key + '|' + empty;
        output.location.replace(url);
        return new this({
                key : key,
                url : url,
                input : function () { return frame.contentWindow[0] },
                output : output
        });
};
Messenger.findEmptyResource = function () {
        if (Messenger.emptyResourceURL) {
            return Messenger.emptyResourceURL;
        }

        var origin = location.protocol + '//' + location.host;
        var imgs = document.getElementsByTagName('img');
        for (var i = 0, it; it = imgs[i]; i++) {
                if (it.src.indexOf(origin) == 0) return it.src;
        }

/*
        var links = document.getElementsByTagName('link');
        for (var i = 0, it; it = links[i]; i++) {
                if (it.rel == 'stylesheet' || it.rel == 'alternate stylesheet' || it.rel == 'shortcut icon' || it.rel == 'icon') {
                        if (it.href.indexOf(origin) == 0) return it.href;
                }
        }
*/
        
        return null;
};
Messenger.absolute = function (url) {
        var img = new Image();
        img.src = url;
        var ret = img.src;
        img.src = '';
        delete img;
        return ret;
};
Messenger.prototype = {
        transportType: 'hash',

        init : function (opts) {
                var self = this;
                self._eventListeners     = {};
                self.key = opts.key;
                self.url = opts.url;
                self.input = typeof(opts.input) == 'function' ? opts.input : function () { return opts.input };
                self.output = typeof(opts.output) == 'function' ? opts.output : function () { return opts.output };
                /** read buffer */
                self.buffer = [];
                /** received msg sequence id */
                self.ack   = 0;
                /** write queue */
                self.queue = [];
                /** sent messages */
                self.sent  = [];
                /** sent msg sequence id */
                self.msgid = 0;
                self.regexp = new RegExp('^(' + Messenger.SIGNATURE + '[A-Za-z0-9]{8}@)([A-Za-z0-9]{4})([A-Za-z0-9]{4})([A-Za-z0-9]{2})(.+)');
                self.safeOriginPattern = opts.safeOriginPattern;
                self.hasSafeOrigin = self.safeOriginPattern
                    ? self.safeOriginPattern.test(self.url) : false;
                self.setupTimer();
        },

        stop : function () {
                //
        },

        send : function (type, obj) {
                var self = this;

                if (typeof data === 'undefined') data = null;
                var body = encodeURIComponent(Ten.JSON.stringify({
                        type : type,
                        data : obj
                }));

                /*
                 * Data Structure
                 * message : '#' + header (20bytes) + data (rest)
                 * header  : key (11bytes) + msgid (4bytes) + ack (4bytes) + msg rest (2byte)
                 * key     : 'XX' + random (8bytes) + '@'
                 */

                var dataLimit = 2083 - (this.url.length) - 22;
                var sequence  = [];
                while (body.length) {
                        sequence.push(body.substring(0, dataLimit));
                        body = body.substring(dataLimit);
                }

                var msglen = sequence.length;
                for (var i = 0, data; data = sequence[i]; i++) {
                        var msgseq = i.toString(36);
                        self.queue.push({
                                msgid   : self.msgid++,
                                msgrest : msglen - i - 1,
                                data    : data
                        });
                }

                self.exhaust();
        },

        setupTimer : function () {
                var self = this;
                if (self.timer) return;
                self.timer = setInterval(function () {
                        var data;
                        try {
                                var input  = self.input();
                                data = input.location.hash.substring(1);
                                if (!data || data == '_') return;
                                var base  = input.location.protocol + '//' + input.location.host + input.location.pathname + input.location.search;
                                input.location.replace(base + '#_');
                        } catch (e) { return }

                        var match = data.match(self.regexp);
                        if (!match) return;

                        var message = {
                                key      : match[1],
                                msgidraw : match[2],
                                msgid    : parseInt(match[2], 36),
                                ack      : parseInt(match[3], 36),
                                msgrest  : parseInt(match[4], 36),
                                data     : match[5]
                        };

                        for (var i = 0, it; it = self.sent[i]; i++) {
                                if (it.msgid < message.ack) self.sent.splice(i--, 1);
                        }

                        for (var i = 0, it; it = self.queue[i]; i++) {
                                if (it.msgid < message.ack) self.queue.splice(i--, 1);
                        }

                        log(['ack', self.ack + '=' + message.msgid, message.data == 'ACK', message.ack, self.sent]);

                        if (message.data == 'ACK') return;

                        if (self.ack != message.msgid) return;

                        self.ack = message.msgid + 1;

                        // log(['recv', message]);

                        self.buffer.push(message);

                        if (message.msgrest != 0) return;

                        var data = '';
                        for (var i = 0, it; it = self.buffer[i]; i++) {
                                data += it.data;
                        }
                        self.buffer = [];

                        var obj = Ten.JSON.parse(decodeURIComponent(data));

                        if (!self.queue.length) {
                                self.queue.push({
                                        msgid   : 0,
                                        msgrest : 0,
                                        data    : 'ACK'
                                });
                                self.exhaust();
                        }

                        self.dispatchEvent(obj.type, obj.data);
                }, 10);
        },

        exhaust : function () {
                var self = this;
                if (!self.queue.length) return;

                var now  = new Date().getTime();
                if (now < self.lastSent + 50) {
                        setTimeout(function () {
                                self.exhaust();
                        }, 50);
                        return;
                }

                var message = self.queue.shift();
                var ack     = (self.ack % 1679616 + 1679616).toString(36).substring(1);
                var msgid   = (message.msgid % 1679616 + 1679616).toString(36).substring(1);
                var msgrest = (message.msgrest % 1296 + 1296).toString(36).substring(1);

                log(['send', message]);
                var url = self.url + '#' + self.key + msgid + ack + msgrest + message.data;
                self.output().location.replace(url);
                self.lastSent = new Date().getTime();
                if (message.data != 'ACK') self.sent.push(message);

                clearTimeout(self.ackTimer);
                self.ackTimer = setTimeout(function () {
                        if (self.sent.length) {
                                self.queue = self.sent.concat(self.queue).sort(function (a, b) {
                                        return a.msgid - b.msgid;
                                });
                                log(['resend', self.queue]);
                                self.sent  = [];
                                setTimeout(function () {
                                        self.exhaust();
                                }, Math.random() * 200);
                        }
                }, 500);

                setTimeout(function () {
                        self.exhaust();
                }, 50);
        },

        hasEventListener: function (type) {
                return !!(this._eventListeners[type] instanceof Array && this._eventListeners[type].length);
        },

        addEventListener: function (type, listener) {
                if (!listener) return;
                if (!this.hasEventListener(type)) {
                        this._eventListeners[type] = [];
                }
                var listeners = this._eventListeners[type];
                for (var i = 0, it; it = listeners[i]; i++) {
                        if (listener == it) {
                                return;
                        }
                }
                listeners.push(listener);
        },

        removeEventListener: function (type, listener) {
                if (this.hasEventListener(type)) {
                        var listeners = this._eventListeners[type];
                        for (var i = 0, it; it = listeners[i]; i++) {
                                if (listener == it) {
                                        listeners.splice(i, 1);
                                        return;
                                }
                        }
                }
        },

        dispatchEvent: function (type, opt) {
                if (!this.hasEventListener(type)) return false;
                var listeners = this._eventListeners[type];
                for (var i = 0, it; it = listeners[i]; i++) {
                        it.call(this, opt);
                }
                return true; // preventDefault is not implemented
        }
};

if (window.postMessage && !window.tenNoPostMessage && window.addEventListener) {
  Messenger.createForParent = function (origin, safeOriginPattern) {
    var self = new this({
      postTo: parent,
      postToOrigin: origin || '*',
      safeOriginPattern: safeOriginPattern || /(?!)/,
      watch: window
    });
    return self;
  };
  Messenger.createForFrame = function (frame, url) {
    frame.src = url;
    var m = url.match(/^(https?:\/\/[^\/]+)/);
    var origin = m[1];
    var key = Messenger.SIGNATURE + Math.floor(Math.random() * 2821109907456 + 2821109907456).toString(36).substring(1) + '@';
    var self = new this({
      postTo: frame.contentWindow,
      postToOrigin: origin,
      watch: window
    });
    self.setKey(key);
    self.frame = frame;
    self.setKeyInterval = window.setInterval(function () {
      self.setKey(key);
    });
    self.frameonloadhandler = function () {
      self.setKey(self.key);
      clearInterval(self.setKeyInterval);
    };
    frame.addEventListener('load', self.frameonloadhandler, false);
    return self;
  };
  Messenger.prototype.channelType = 'postMessage';
  Messenger.prototype.init = function (opts) {
    var self = this;
    self._eventListeners     = {};
    this.postTo = opts.postTo;
    this.postToOrigin = opts.postToOrigin;
    this.safeOriginPattern = opts.safeOriginPattern;
    this.key = opts.key;
    var code = function (ev) {
      var data = Ten.JSON.parse(ev.data);

      // Pairing
      if (data.type == 'TenXDMessengerSetKey') {
        if (!self.key) {
          self.key = data.data;
        }
      } else if (data.type == 'TenXDMessengerRequestKey') {
        if (self.key) {
          self.send('TenXDMessengerSetKey', self.key);
        }
        return;
      }
      if (!self.key || !data.key || self.key != data.key) {
        return;
      }

      // Origin
      if (self.postToOrigin == ev.origin || self.postToOrigin == '*') {
        self.hasSafeOrigin = self.safeOriginPattern
            ? self.safeOriginPattern.test(ev.origin) : false;
        if (self.hasSafeOrigin && self.postToOrigin == '*') {
          var m = ev.origin.match(/^(https?:\/\/[^/]+)/);
          self.postToOrigin = m[1];
        }
      } else {
        return;
      }

      self.dispatchEvent(data.type, data.data);
    };
    window.addEventListener('message', code, false);
  };
  Messenger.prototype.setKey = function (key) {
    this.key = key;
    this.send('TenXDMessengerSetKey', key);
  };
  Messenger.prototype.requestKey = function () {
    if (this.key) return;
    this.send('TenXDMessengerRequestKey');
  };
  Messenger.prototype.stop = function () {
    if (this.frameonloadhandler) {
      this.frame.removeEventListener('load', this.frameonloadhandler, false);
    }
  };
  Messenger.prototype.send = function (type, obj) {
    var data = {key: this.key, type: type, data: obj};
    log([data, this.postTo, this.postToOrigin]);
    this.postTo.postMessage(Ten.JSON.stringify(data), this.postToOrigin);
  };
}

Ten.XDMessenger = Messenger;

})();