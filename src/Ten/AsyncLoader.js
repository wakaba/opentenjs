Ten.AsyncLoader = new Ten.Class({

  /* ------ Asynchronous communication ------ */

  loadScripts: function (urls, onload) {
    var number = urls.length;
    var counter = 0;
    var check = function () {
      if (counter == number && onload) {
        onload();
      }
    };
    Ten.Array.forEach(urls, function (url) {
      /* XXX
      if (/\.css(?:\?|$)/.test(url)) {
        SAMI.Style.loadStyle(url, function () {
          counter++;
          check();
        });
        return;
      }
      */

      var script = document.createElement('script');
      script.src = url;
      script.charset = 'utf-8';
      script.onload = function () {
        counter++;
        check();
        script.onload = null;
        script.onreadystatechange = null;
      };
      if (Ten.Browser.isIE) {
        script.onreadystatechange = function () {
          if (!event.srcElement) return;
          if (script.readyState != 'complete' && script.readyState != 'loaded') {
            return;
          }
          counter++;
          check();
          script.onload = null;
          script.onreadystatechange = null;
        };
        Ten.AsyncLoader.insert(script);
      } else {
        (document.body || document.documentElement).appendChild(script);
      }
    });
  },

  _callbackCode: {},
  callJSONP: function (url, code, paramName) {
    paramName = paramName || 'callback';

    var key = 'k' + (Math.random() + '').replace(/\./, '');

    this._callbackCode[key] = function (result) {
      code(result);
      delete Ten.AsyncLoader._callbackCode[key];
    };

    if (/\?/.test(url)) {
      url += '&' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    } else {
      url += '?' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    }
    Ten.AsyncLoader.loadScripts([url], function () { });
  },

  /* ------ Asynchronous Fragment Loading Protocol ------ */

  pageFragmentLoader: function (urlOrForm, additionalParams) {
    return new Ten.AsyncLoader.PageFragmentLoader(urlOrForm, additionalParams);
  },
  asyncizeLinks: function (linkClassName, containers, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var links = Ten.DOM.getElementsByClassName(linkClassName, root);
      for (var i = 0; i < links.length; i++) (function (link) {
        var url = link.href;
        var useHash = !link.getAttribute('ten-async-no-fragment');
        new Ten.Observer(link, 'onclick', function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(url);
          pf.openURLOnError = true;
          if (useHash) {
            pf.setLoadStartEnd(null, function () {
              // XXX
              var query = this.url.replace(/\#.*/, '').split(/\?/, 2)[1] || '';
              query = query.replace(/^\?/, '').split(/[&;]/);
              var newQuery = ['async=' + linkClassName];
              for (var i = 0; i < query.length; i++) {
                var q = query[i];
                if (!/^(?:locale\..*|only)=/.test(q)) newQuery.push(q);
              }
              newQuery = newQuery.join('&');
              // XXX use location.hash = xxx when onhashchange is available
              location.replace('#' + newQuery);
            });
          }
          pf.addElements(containers).start();
          if (code) {
            code.apply(pf, []);
          }
          ev.stop();
        });
      })(links[i])
    });

    this.setFragmentQueryParamHandler(linkClassName, function (params) {
      var url = location.pathname + '?' + params.join('&');
      var pf = this.pageFragmentLoader(url).addElements(containers);
      pf.openURLOnError = true;
      pf.start();
    });
  },
  asyncize: function (map, additionalParams, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var subtrees = Ten.DOM.getElementSetByClassNames({
        root: map.root || map.target
      }, root).root;
      for (var i = 0; i < subtrees.length; i++) (function (subtree) {
        var origRoot = map.root;
        var origTarget = map.target;
        var sRoot;
        if (origRoot) {
          map.root = [subtree];
          sRoot = subtree;
        } else {
          map.target = [subtree];
          sRoot = null; // Intentionally ignores /root/ here
        }
        var elements = Ten.DOM.getElementSetByClassNames(map, sRoot);
        map.root = origRoot;
        map.target = origTarget;

        var targetEl = elements.target[0];
        var targetType = targetEl.nodeName.toLowerCase();
        var eventType = 'onclick';
        if (targetType == 'form') {
          eventType = 'onsubmit';
        } else if (targetType == 'noscript') {
          eventType = 'now';
        }
        var onEvent = function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(targetEl, additionalParams);
          pf.elements = elements;
          pf.openURLOnError = !map.errors;
          if (eventType == 'now') pf.noIndicator = true;
          if (code) {
            code.apply(pf, []);
          }
          pf.start();
          if (ev) ev.stop();
        };
        if (eventType == 'now') {
          onEvent();
        } else {
          new Ten.Observer(targetEl, eventType, onEvent);
        }
      })(subtrees[i])
    });
  },

  /* ------ Asynchronous DOM manipulations ------ */

  insert: function (el) {
    if (Ten.Browser.isIE && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
      });
    } else {
      (document.body || document.documentElement.lastChild || document.documentElement || document).appendChild(el);
    }
  },
  insertToBody: function (el, onload) {
    if (Ten.Browser.isIE6 && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
        if (onload) {
          onload();
        }
      });
    } else if (document.body) {
      document.body.appendChild(el);
      if (onload) {
        onload();
      }
    } else {
      Ten.AsyncLoader.tryToExecute(function () {
        if (!document.body) return false;

        document.body.appendChild(el);
        if (onload) {
          onload();
        }
        return true;
      });
    }
  },

  /* ------ Asynchronous executions ------ */

  tryToExecute: function (code) {
    if (!code()) {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },
  tryToExecuteReformatting: function (code) {
    if (code()) {
      new Ten.Observer(window, 'onresize', code);
    } else {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },

  _registeredObjects: {},
  _pendingCodes: {},
  registerObject: function (key, value) {
    this._registeredObjects[key] = value;
    Ten.Array.forEach(this._pendingCodes[key] || [], function (code) {
      code(value);
    });
  },
  executeWithObject: function (key, code) {
    var obj = this._registeredObjects[key];
    if (obj) {
      code(obj);
    } else {
      if (!this._pendingCodes[key]) this._pendingCodes[key] = [];
      this._pendingCodes[key].push(code);
    }
  },

  /* ------ On-load processings ------ */

  _OnFragmentLoadedCodes: [],
  _OnFragmentLoaded: function (fragmentRoot) {
    var fr = fragmentRoot.getAttribute('data-ten-fragment-root');
    if (fr) {
      fragmentRoot = Ten.DOM.getAncestorByClassName(fr, fragmentRoot) || fragmentRoot;
    }

    var codes = this._OnFragmentLoadedCodes;
    for (var i = 0; i < codes.length; i++) {
      codes[i](fragmentRoot);
    }
  },
  executeWhenFragmentLoaded: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    this.executeAfterDOMContentLoaded(function () {
      code(document.body);
    });
  },
  executeWhenFragmentLoadedOrNow: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    if (Ten.Browser.isIE || !document.body) {
      this.executeAfterDOMContentLoaded(function () {
        code(document.body);
      });
    } else {
      code(document.body);
    }
  },

  _OnDOMContentLoadedCodes: [],
  _OnDOMContentLoaded: function () {
    while (this._OnDOMContentLoadedCodes.length) {
      var code = this._OnDOMContentLoadedCodes.shift();
      code();
    }
  },

  _OnLoadCodes: [],
  _OnLoad: function () {
    this._OnDOMContentLoaded();
    while (this._OnLoadCodes.length) {
      var code = this._OnLoadCodes.shift();
      code();
    }
  },

  _OnPageshowCodes: [],
  _OnPageshow: function () {
    this._OnLoad();
    while (this._OnPageshowCodes.length) {
      var code = this._OnPageshowCodes.shift();
      code();
    }
  },

  executeAfterDOMContentLoaded: function (code) {
    if (this.isDOMContentLoadedFired) {
      code();
    } else {
      this._OnDOMContentLoadedCodes.push(code);
    }
  },
  executeAfterLoad: function (code) {
    if (this.isLoadFired) {
      code();
    } else {
      this._OnLoadCodes.push(code);
    }
  },

  /* ------ Onhashchange processings ------ */

  _fragmentQueryParamHandler: {},
  //_onLoadFragmentProcessAdded: false,
  setFragmentQueryParamHandler: function (key, code) {
    this._fragmentQueryParamHandler[key] = code;

    if (this._onLoadFragmentProcessAdded) return;
    var self = this;
    // XXX もっとはやいタイミングで実行するべき?
    this.executeAfterDOMContentLoaded(function () {
      self._processFragment();
    });
    this._onLoadFragmentProcessAdded = true;
  },

  // XXX onhashchange support

  _processFragment: function () {
    var key;
    var newParams = [];
    var params = (location.hash || '').replace(/^\#/, '').split(/[&;]/);
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (/^async=/.test(param)) {
        key = decodeURIComponent(param.substring(6));
      } else {
        newParams.push(param);
      }
    }
    if (!key) return;
    var qph = this._fragmentQueryParamHandler[key];
    if (qph) qph.apply(this, [newParams]);
  }
});

new Ten.Observer(Ten.DOM, 'DOMContentLoaded', function () {
  Ten.AsyncLoader.isDOMContentLoadedFired = true;
  Ten.AsyncLoader._OnDOMContentLoaded();
});
new Ten.Observer(window, 'onload', function () {
  Ten.AsyncLoader.isLoadFired = true;
  Ten.AsyncLoader._OnLoad();
});
new Ten.Observer(window, 'onpageshow', function () {
  Ten.AsyncLoader.isPageshowFired = true;
  Ten.AsyncLoader._OnPageshow();
});
