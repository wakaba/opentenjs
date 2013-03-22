
/* Ten.IFrameMessenger */
      if (typeof Ten.IFrameMessenger == 'undefined') {
        Ten.IFrameMessenger = {};
        Ten.IFrameMessenger.Base = new Ten.Class({
          initialize: function(interval) {
            Ten.EventDispatcher.implementEventDispatcher(this);
            this.queue = [];
            this.timer = new Ten.Timer(interval || 60);
            var self = this;
            this.timer.addEventListener('timer', function(repeat) {
              self.timerHandler(repeat);
            });
          }
        }, {
          sendMessage: function(eventName, args/* args shoud be null or string or hash */) {
            if (this.canSendMessage()) {
              this._implSendMessage(eventName, args);
            } else {
              this.queue.push([eventName, args]);
            }
          },
          _implSendMessage: function(eventName, args) {
          },
          timerHandler: function(repeatCount) {
            this.sendEvent();
          },
          sendEvent: function() {
            var rawMessage = this.getMessage();
            if (rawMessage) {
              var obj = this.unseriarize(rawMessage);
              this.dispatchEvent(obj.eventName, obj.args);
            }
          },
          unseriarize: function(raw) {
            var tmp = raw.split('?', 2);
            var res = {};
            res.eventName = tmp[0];
            if (tmp[1]) {
              if (tmp[1].indexOf('=') == -1) {
                res.args = decodeURIComponent(tmp[1]);
              } else {
                var ary = tmp[1].split('&');
                args = {};
                for (var i = 0;  i < ary.length; i++) {
                  var query = ary[i].split('=', 2);
                  if (query.length == 2)
                    args[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
                }
                res.args = args;
              }
            }
            return res;
          },
          seriarize: function(args) {
            if (!args) return '';

            if (typeof args == 'string') {
              return encodeURIComponent(args);
            } else {
              var res = [];
              for (var prop in args) {
                if (!args.hasOwnProperty(prop)) continue;
                res.push( encodeURIComponent(prop) + '=' + encodeURIComponent(args[prop]) );
              }
              return res.join('&');
            }
          },
          setScroll: function(pos) {
            var de = document.documentElement;
            var b = document.body;
            de.scrollLeft = b.scrollLeft = pos.x;
            de.scrollTop  = b.scrollTop  = pos.y;
          },
          canSendMessage: function() {
        /* return bool */
            return true;
          }
        });

        Ten.IFrameMessenger.Manager = new Ten.Class({
          base: [Ten.IFrameMessenger.Base],
          initialize: function(url, interval) {
            this.constructor.SUPER.call(this, interval);
            this.url = url;
            this.iframeId = '__iframe_messenger';
          },
          onLoad: function() {
            Ten.IFrameMessenger.Manager.dispatchEvent('onload');
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) {
            // XXX
              var pos = Ten._stash.lastPos;
              if (pos) {
                setTimeout(function() {
                  Ten.Geometry.setScroll(pos);
                }, 100);
              }
            }
          }
        }, {
          _implSendMessage: function(eventName, args) {
            this.replaceURL(this.url + '#' + eventName + '?' + this.seriarize(args));
          },
          getMessage: function() {
            var tmp = location.href.split('#');
            var hash, otherHash;
            if (tmp.length >= 3) {
              hash = tmp.pop();
              tmp.shift();
              otherHash = tmp;
            } else {
              hash = tmp.pop();
            }
            var re = /^Message-/;
            if (hash && hash.length && re.test(hash)) {
              hash = hash.replace(re, '');
              var pos = Ten.Geometry.getScroll();
              if (otherHash) {
                location.replace(location.href.split("#")[0] + "#" + otherHash.join('#'));
              } else {
                location.replace(location.href.split("#")[0] + "#");
              }
              return hash;
            }
          },
          getIFrame: function() {
            return document.getElementById(this.iframeId);
          },
          replaceURL: function(url) {
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) var pos = Ten.Geometry.getScroll();
            this.iframe.contentWindow.location.replace(url);
            if (Ten.Browser.isWebKit || Ten.Browser.isIE) {
              Ten._stash.lastPos = pos;
              Ten.Geometry.setScroll(pos);
            }
          },
          observe: function(parentContainer) {
            if (!this.iframe) {
              var div = document.createElement('div');
              div.innerHTML = "<iframe onload='Ten.IFrameMessenger.Manager.onLoad();' frameborder='0' id='" + this.iframeId + "' style=''></iframe>";
              (parentContainer || document.body).appendChild(div);
              this.iframe = document.getElementById(this.iframeId);
              this.replaceURL(this.url + '#');
            }
            this.timer.start();
          }
        });
        Ten.EventDispatcher.implementEventDispatcher(Ten.IFrameMessenger.Manager);

        Ten.IFrameMessenger.Client = new Ten.Class({
          base: [Ten.IFrameMessenger.Base],
          initialize: function(interval) {
            this.constructor.SUPER.call(this, interval);
            var self = this;
            this.href = location.href;
          }
        }, {
          _implSendMessage: function(eventName, args) {
        // hmm...
        //location.replace = this.href + '#' + (new Date).getTime();
        //window.name = 'hoge';//[eventName, args.toSource()].join("\n");
          },
          getMessage: function() {
            var hash = location.href.split('#')[1];
            if (hash && hash.length) {
              location.replace(location.href.split("#")[0] + "#");
              return hash;
            }
          },
          observe: function() {
            this.timer.start();
          }
        });

// This object is irrelevant to iframe.
// The name "Ten.IFrameMessenger.FragmentDispatcher" is misleading.
        Ten.IFrameMessenger.FragmentDispatcher = new Ten.Class({
          base: [Ten.IFrameMessenger.Base],
          initialize: function(command, interval) {
            this.constructor.SUPER.call(this, interval);
            this.command = command;
          }
        }, {
          getMessage: function() {
            var hash = location.href.split('#')[1];
            if (hash && (hash === this.command ||
                         hash.indexOf(this.command + '?') === 0)) {
              location.replace(location.href.split("#")[0] + "#");
              return hash;
            }
          },
          observe: function() {
            this.timer.dispatchEvent('timer');
          }
        });
/* end IFrameMessenger */
