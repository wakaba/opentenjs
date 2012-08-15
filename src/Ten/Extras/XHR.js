Ten.Extras.XHR = new Ten.Class ({
  initialize: function (url, onsuccess, onerror) {
    try {
      this._xhr = new XMLHttpRequest ();
    } catch (e) {
      try {
        this._xhr = new ActiveXObject ('Msxml2.XMLHTTP');
      } catch (e) {
        try {
          this._xhr = new ActiveXObject ('Microsoft.XMLHTTP');
        } catch (e) {
          try {
            this._xhr = new ActiveXObject ('Msxml2.XMLHTTP.4.0');
          } catch (e) {
            this._xhr = null;
          }
        }
      }
    }

    this._url = url;
    this._onsuccess = onsuccess || function () { };
    this._onerror = onerror || function () { };
  }
}, {
  get: function () {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('GET', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.send (null);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  post: function (postCT, postData) {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('POST', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.setRequestHeader('Content-Type', postCT);
      this._xhr.send(postData);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  _onreadystatechange: function () {
    if (this._xhr.readyState == 4) {
      if (this.succeeded ()) {
        this._onsuccess.apply (this);
      } else {
        this._onerror.apply (this);
      }
    }
  },

  succeeded: function () {
    return (this._xhr.status >= 200 && this._xhr.status < 400);
  },

  getText: function () {
    try {
      return this._xhr.responseText;
    } catch (e) {
      return '';
    }
  },
  getDocument: function () {
    try {
      return this._xhr.responseXML;
    } catch (e) {
      return null;
    }
  },
  getJSON: function () {
    try {
      var text = this._xhr.responseText;
      return Ten.JSON.parse(text);
    } catch (e) {
      return null;
    }
  },

  getRequestURL: function () {
    var doc = this.getDocument ();
    if (doc) {
      return doc.documentURI || doc.URL;
    }
    return this._url; // might be wrong if redirected
  },

  getMediaTypeNoParam: function () {
    // XXX maybe we should apply HTML5 content sniffing algorithm, at
    // least for unspecified case

    var type = this.getHeaderFieldBody ('Content-Type') || 'text/plain';
    type = (type.split(/;/, 2)[0] || 'text/plain').replace (/\s+/g, '').toLowerCase ();
    return type;
  },

  getHeaderFieldBody: function (name) {
    return this._xhr.getResponseHeader (name);
  },

  getSimpleErrorInfo: function () {
    var r;
    try {
      r = this._xhr.status;
      r += ' ';
      r += this._xhr.statusText;
    } catch (e) { }
    return r;
  }

});
