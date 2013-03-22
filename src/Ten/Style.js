Ten.Style.insertStyleRules = function (css) {
  if (Ten.Browser.isIE) {
    var ss = document.createStyleSheet('about:blank');
    ss.cssText = css;
  } else {
    var style = document.createElement('style');
    style.textContent = css;
    Ten.AsyncLoader.insert(style);
  }
};

Ten.Style.StyleSheet = new Ten.Class({
  initialize: function() {
    this.cssTexts = [];
    this._cache = [];
  },
  factory: function() {
    var klass;
    if (Ten.Browser.isIE) {
      klass = Ten.Style.StyleSheet.IE;
    } else if (Ten.Browser.isOpera) {
      klass = Ten.Style.StyleSheet.Opera;
    } else if (Ten.Browser.isWebKit) {
      klass = Ten.Style.StyleSheet.Safari;
    } else {
      klass = Ten.Style.StyleSheet;
    }
    return new klass;
  }
}, {
  createCSSText: function(selector, text) {
    if (typeof text == 'object') {
      var res = [];
      for (var prop in text) {
        res.push('' + prop + ':' + text[prop] + ';');
      }
      text = res.join("\n");
    }
    return selector + ' { ' + text  + " } \n";
  },
  clear: function() {
    if (this.styleSheet) {
      var ss = this.styleSheet.sheet;
      ss.disabled = true;
      while (ss.cssRules.length) {
        ss.deleteRule(0);
      }
      ss.disabled = false;
    }
    while (this.cssTexts.length) {
            // XXX...
      var css = this.cssTexts.pop();
            //css.cssText = '';
            //this._cssTexts.push(css);
    }
  },
  addRule: function(selector, text) {
    var css = this.createCSSText(selector, text);
    this._cache.push(css);
  },
  applyRules: function() {
    if (!this.styleSheet) {
      var style = new Ten.Element('style', { type: 'text/css' });
      style.appendChild(document.createTextNode('')); // for safari
      document.getElementsByTagName('head')[0].appendChild(style);
      this.styleSheet = style;
    }

    var ss = this.styleSheet.sheet;
    ss.disabled = true;
    var css;
    while (css = this._cache.shift()) {
      p(css);
      ss.insertRule(css, ss.length);
      this.cssTexts.push(css);
    }
    ss.disabled = false;
  }
});

Ten.Style.StyleSheet.Safari = new Ten.Class({
  base: [Ten.Style.StyleSheet],
  initialize: function() {
    this.constructor.SUPER.call(this);
  }
}, {
  applyRules: function() {
    if (!this.styleSheet) {
      var style = new Ten.Element('style', { type: 'text/css' });
      style.appendChild(document.createTextNode('')); // for safari
      document.getElementsByTagName('head')[0].appendChild(style);
      this.styleSheet = style;
    }

    var ss = this.styleSheet.sheet;
    var css;
    var _tmp = '';
    while (css = this._cache.shift()) {
            // very slowly
            //ss.insertRule(css, ss.length);
      _tmp += css + "\n";
      this.cssTexts.push(css);
    }
    Ten.DOM.removeAllChildren(this.styleSheet);
    this.styleSheet.appendChild(document.createTextNode(_tmp));
  }
});

Ten.Style.StyleSheet.Opera = new Ten.Class({
  base: [Ten.Style.StyleSheet],
  initialize: function() {
    this.constructor.SUPER.call(this);
  }
}, {
  clear: function() {
    while (this.cssTexts.length) {
      var css = this.cssTexts.pop();
      Ten.DOM.removeAllChildren(css);
      if (css.parentNode) {
        css.parentNode.removeChild(css);
      }
    }
  },
  addRule: function(selector, text) {
    var style = new Ten.Element('style', { type: 'text/css' });
    var css = this.createCSSText(selector, text);
    style.appendChild(document.createTextNode(css));
    this._cache.push(style);
  },
  applyRules: function() {
    var style;
    while (style = this._cache.shift()) {
      this.cssTexts.push(style);
      document.getElementsByTagName('head')[0].appendChild(style);
    }
  }
});


Ten.Style.StyleSheet.IE = new Ten.Class({
  base: [Ten.Style.StyleSheet],
  initialize: function() {
    this.constructor.SUPER.call(this);
    this._cssText =  document.createStyleSheet();
        //this._cssTexts = [];
  }
}, {
  clear: function() {
    this._cssText.cssText = '';
    while (this.cssTexts.length) {
            // XXX...
      var css = this.cssTexts.pop();
            //css.cssText = '';
            //this._cssTexts.push(css);
    }
  },
  addRule: function(selector, text) {
    var css = this.createCSSText(selector, text);
    this._cache.push(css);
  },
  applyRules: function() {
    var style;
    var text = '';
    while (css = this._cache.shift()) {
      text += css;
      this.cssTexts.push(css);
    }
    this._cssText.cssText = text;
  }
});
