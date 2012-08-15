Ten.Widget.Frame = function () { this.init() };
Ten.Widget.Frame.iframeMap = {};

Ten.Widget.Frame.prototype = {
  init: function () {
    this.m = Ten.XDMessenger.createForParent('*', /.*/);
    this.document = document;
  },
  initDimensionChangeListener: function () {
    if (!window.postMessage || !window.JSON) return;

    var iframeMap = Ten.Widget.Frame.iframeMap;
    var distributeKey = function (root) {
      var iframes = Ten.querySelectorAll('iframe', root);
      for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        if (!iframe.iframeHeightchangeKey) {
          iframe.iframeHeightchangeKey = Math.random();
          iframeMap[iframe.iframeHeightchangeKey] = iframe;
        }
        iframe.contentWindow.postMessage(JSON.stringify({
          type: 'TenXDMessengerSetKey',
          key: iframe.iframeHeightchangeKey
        }), '*');
      }
    };

    TL.compat.observe(window, 'message', function (ev) {
      try {
        var data = JSON.parse(ev.data);
        if (data.type == 'heightchange') {
          if (data.key) {
            var iframe = iframeMap[data.key];
            if (iframe) {
              if (data.value && /^(?:[0-9]+px|0)$/.test(iframe.style.height)) {
                if (parseInt(iframe.style.height) < data.value ||
                    !iframe.hasAttribute('data-keep-current-height')) {
                  iframe.style.height = data.value + 'px';
                }
              } else {
                if (data.value) {
                  iframe.style.height = data.value + 'px';
                }
              }
            }
          } else {
            distributeKey(document.documentElement);
          }
        }
      } catch (e) {
          if (window.console) console.log(e);
      }
    });

    Ten.AsyncLoader.executeWhenFragmentLoadedOrNow(function (root) {
      distributeKey(root);
    });
  },
  notifyDimensionChangeIfEnabled: function () {
    if (document.documentElement.getAttribute('data-ten-notify-dimension-change')) {
      this.notifyDimensionChange();
    }
  },
  notifyDimensionChange: function () {
    if (!window.postMessage || !window.JSON) return;

    var notifyHeightchange = function () {
      var height1 = document.body.offsetHeight;
      var height2 = document.documentElement.offsetHeight;
      var height = height1 > height2 ? height1 : height2;
      parent.postMessage(JSON.stringify({
        type: 'heightchange',
        key: Ten.Widget.Frame.iframeKey,
        value: height
      }), '*');
      //if (window.console) console.log(Ten.Widget.Frame.iframeKey + ': heightchange');
    };
    notifyHeightchange();

    TL.compat.observe(window, 'message', function (ev) {
      try {
        var data = JSON.parse(ev.data);
        if (data.type == 'TenXDMessengerSetKey') {
          if (Ten.Widget.Frame.iframeKey != data.key) {
            Ten.Widget.Frame.iframeKey = data.key;
            Ten.Widget.Frame.iframeKeyOrigin = ev.origin;
            notifyHeightchange();
          }
        } else if (data.type == 'requestheight') {
          notifyHeightchange();
        }
      } catch (e) {
        if (window.console) console.log(e);
      }
    });

    return;

    var self = this;
    self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
    Ten.AsyncLoader.executeAfterLoad(function () {
      self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
      setTimeout(function () {
        self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
        setTimeout(function () {
          self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
        }, 1000);
      }, 1000);
    });
  }
};

Ten.Widget.Frame.Listener = function (iframe) {
  this.init(iframe);
};

Ten.Widget.Frame.Listener.prototype = {
  init: function (iframe) {
    this.m = Ten.XDMessenger.createForFrame(iframe, iframe.src);
    if (!this.m) return;
    this.m.addEventListener('heightChanged', function (value) {
      iframe.style.height = value + 'px';
    });
  }
};
