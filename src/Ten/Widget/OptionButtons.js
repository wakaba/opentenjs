Ten.Widget.OptionButtons = new Ten.Class({
  initialize: function (elements, onbeforechange, onchange, allowBlank) {
    this.elements = elements;
    this.onbeforechange = onbeforechange;
    this.onchange = onchange;
    this.allowBlank = allowBlank;

    var self = this;
    for (var i = 0; i < elements.length; i++) {
      new Ten.Observer(elements[i], 'onmousedown', (function (j) {
        return function (ev) { self._onChangeEvent(j); ev.stop() };
      })(i));
    }
  }
},{
  // selectedIndex: undefined/null/0..
  _onChangeEvent: function (index) {
    var selected = this.selectedIndex;
    if (selected === undefined) {
      selected = null;
      for (var i = 0; i < this.elements.length; i++) {
        if (this.elements[i].getAttribute('src', 2) == this.elements[i].getAttribute('data-on-src')) {
          selected = i;
          this.selectedIndex = i;
          break;
        }
      }
    }

    var self = this;
    var el = this.elements[index];
    if (selected == index) {
      if (this.allowBlank) {
        el.setAttribute('src', el.getAttribute('data-off-src'));
        this.selectedIndex = null;
        self.onbeforechange(el, false);
        self._callForDSi(function () { self.onchange(el, false) });
      }
    } else if (selected == null) {
      el.setAttribute('src', el.getAttribute('data-on-src'));
      this.selectedIndex = index;
      self.onbeforechange(el, true);
      self._callForDSi(function () { self.onchange(el, true) });
    } else {
      var oldEl = this.elements[selected];
      oldEl.setAttribute('src', oldEl.getAttribute('data-off-src'));
      el.setAttribute('src', el.getAttribute('data-on-src'));
      self.onbeforechange(el, true);
      this.selectedIndex = index;
      self._callForDSi(function () {
        self.onchange(oldEl, false);
        self.onchange(el, true);
      });
    }
  },

  _callForDSi:
    window.opera && /Nintendo DS/.test(navigator.userAgent)
      ? function (func) { var self = this; setTimeout(function () { func.call(self) }, 300) }
      : function (func) { func.call(this) },

  selectByIndex: function (i) {
    this._onChangeEvent(i);
  }
});
