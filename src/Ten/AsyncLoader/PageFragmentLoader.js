Ten.AsyncLoader.PageFragmentLoader = new Ten.Class({
  initialize: function (urlOrForm, additionalParams) {
    var nodeName = urlOrForm.nodeName;
    if (nodeName) {
      nodeName = nodeName.toLowerCase();
      if (nodeName == 'form') {
        this._initWithForm(urlOrForm, additionalParams);
      } else if (nodeName == 'noscript') {
        this._initWithURL(urlOrForm.getAttribute('data-src'));
      } else {
        this._initWithURL(urlOrForm);
      }
    } else {
      this._initWithURL(urlOrForm);
    }
    this.elements = {};
    this._loadStart = [];
    this._loadEnd = [];
  }
}, {
  _initWithURL: function (url) {
    this._onErrorURL = url;
    if (/\?/.test(url)) {
      url = url.replace(/\bonly=body\b/g, '').replace(/&&+/g, '&'); // XXX
      this._onErrorURL = url;
      url += '&only=body';
    } else {
      url += '?only=body';
    }
    if (Hatena.Locale) {
      if (!/local.hatena/.test(location.hostname)) { // XXX server.pl encoding workaround
        url = Hatena.Locale.urlWithLangAndRegion(url);
      }
    }
    this.url = url;
  },
  _initWithForm: function (form, additionalParams) {
    this._form = form;
    this._additionalParams = additionalParams || {};
    this._onErrorURL = location.href;
  },

  method: 'get',
  indicatorKey: 'global',
  //openURLOnError
  //noIndicator

  addElements: function (map) {
    var newElements = Ten.DOM.getElementSetByClassNames(map);
    for (var n in newElements) {
      this.elements[n] = newElements[n];
    }
    return this;
  },

  setLoadStartEnd: function (loadStart, loadEnd) {
    if (loadStart) this._loadStart.push(loadStart);
    if (loadEnd) this._loadEnd.push(loadEnd);
    return this;
  },

  start: function (code) {
    var self = this;
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.start(this.indicatorKey);
    for (var c in this._loadStart) {
      this._loadStart[c].apply(this, []);
    }

    var url;
    var method;
    var postCT;
    var postData;
    if (this._form) {
      url = this._form.action;
      method = this._form.method.toLowerCase();

      var params = Ten.Form.createDataSetArray(this._form);

      params.push('locale.lang');
      params.push(Hatena.Locale.getTextLang());

      params.push('locale.region');
      params.push(Hatena.Locale.getRegionCode());

      params.push('only');
      params.push('body');

      for (var n in this._additionalParams) {
        params.push(n);
        params.push(this._additionalParams[n]);
      }

      postCT = 'application/x-www-form-urlencoded';
      postData = Ten.Form.arrayToPostData(params);
    } else {
      url = self.url;
      method = this.method;
    }

    var xhr = new Ten.Extras.XHR(url, function () {
      self._onload(this, code);
    }, function () {
      self._onload(this, code);
    });
    if (method == 'post') {
      xhr.post(postCT, postData);
    } else {
      xhr.get();
    }
  },
  _onload: function (xhr, code) {
    var imt = xhr.getMediaTypeNoParam();
    var data;
    if (imt == 'application/json') {
      data = new Ten.AsyncLoader.PageFragmentLoader.JSONData(Ten.JSON.parse(xhr.getText()));
    } else {
      var text = xhr.getText();
      if (text == '' && !xhr.succeeded()) {
        data = new Ten.AsyncLoader.PageFragmentLoader.HTTPData(xhr);
      } else {
        data = new Ten.AsyncLoader.PageFragmentLoader.TextData(text);
      }
    }
    this.data = data;

    var dataIsError = data.isError();
    if (this.openURLOnError && dataIsError) {
      location.href = this._onErrorURL;
      return;
    }

    for (var n in this.elements) {
      if (n == 'root' || n == 'target') continue;
      var value = data.getText(n);
      if (value == null && n != 'errors') continue;
      var els = this.elements[n];
      if (!els) continue;
      if (n == 'errors') {
        if (dataIsError) {
          if (value instanceof Array) {
            var container = document.createElement('div');
            container.className = 'error-message';
            for (var i = 0; i < value.length; i++) {
              var msg = document.createElement('p');
              msg.innerHTML = 'aaa';
              msg.firstChild.data = value[i];
              container.appendChild(msg);
            }
            value = container;
          }
        } else {
          if (!value && Hatena.Locale) {
            var msgid = els[0] ? els[0].getAttribute('data-ok-msgid') : '';
            if (msgid && msgid.length) {
              var msg = document.createElement('div');
              msg.className = 'ok-message';
              msg.innerHTML = 'aaa';
              msg.firstChild.data = Hatena.Locale.text(msgid);
              value = msg;
            }
          }
        }
      }
      for (var i in els) {
        var el = els[i];
        var op = el.getAttribute('data-ten-async-operation');
        if (op == 'insertBefore' || op == 'replaceChild') {
          var parent = el.parentNode;
          if (value.nodeType) {
            parent.insertBefore(value, el);
            Ten.AsyncLoader._OnFragmentLoaded(value);
          } else {
            var div = document.createElement('div');
            div.innerHTML = value;
            var selectors = el.getAttribute('data-ten-async-selectors');
            if (selectors) {
              var nodes = Ten.querySelectorAll(selectors, div);
              for (var i = 0; i < nodes.length; i++) {
                parent.insertBefore(nodes[i], el);
                Ten.AsyncLoader._OnFragmentLoaded(nodes[i]);
              }
            } else {
              while (div.firstChild) {
                var node = div.firstChild;
                parent.insertBefore(node, el);
                if (node.nodeType == 1 /* ELEMENT_NODE */) {
                  Ten.AsyncLoader._OnFragmentLoaded(node);
                }
              }
            }
          }
          if (op == 'replaceChild') parent.removeChild(el);
        } else {
          if (value.nodeType) {
            el.innerHTML = '';
            el.appendChild(value);
          } else {
            el.innerHTML = value;
          }
          Ten.AsyncLoader._OnFragmentLoaded(el);
        }
      }
    }

    if (code) code.apply(this, []);
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.stop(this.indicatorKey);
    for (var c in this._loadEnd) {
      this._loadEnd[c].apply(this, []);
    }
  }
});
