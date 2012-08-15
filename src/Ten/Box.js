Ten.Box = new Ten.Class({
  placePopupBottom: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);

    var l = eb.borderBox.left;
    var t = eb.borderBox.bottom;

    var vp = NR.View.getViewportRects(window).contentBox;
    if (vp.right < l + el.offsetWidth) {
      l = vp.right - el.offsetWidth;
    }
    if (l < 0) l = 0;

    el.style.left = l + 'px';
    el.style.top  = t + 'px';
  },

  _copiedProps: [
      'fontFamily', 'fontSize', 'lineHeight',
      'borderTopStyle', 'borderTopColor', 'borderTopWidth',
      'borderRightStyle', 'borderRightColor', 'borderRightWidth',
      'borderBottomStyle', 'borderBottomColor', 'borderBottomWidth',
      'borderLeftStyle', 'borderLeftColor', 'borderLeftWidth', 'paddingTop',
      'paddingRight', 'paddingBottom', 'paddingLeft', 'backgroundImage',
      'backgroundColor', 'backgroundRepeat', 'backgroundAttachment',
      'backgroundPosition', 'backgroundPositionX', 'backgroundPositionY',
      'color', 'verticalAlign'
  ],
  placePopupOverlayWithStyles: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);
    var box = Ten.Browser.leIE7 ? eb.contentBox : eb.borderBox;

    el.style.left = eb.borderBox.left + 'px';
    el.style.top = eb.borderBox.top + 'px';
    el.style.width = box.width + 'px';
    el.style.height = box.height + 'px';

    var props = this._copiedProps;
    for (var i in props) {
      var p = props[i];
      try {
        el.style[p] = Ten.Style.getElementStyle(refEl, p);
      } catch (e) { }
    }
  },

  /*
    Depending on the browser in use and at which phase in the process
    of the element creation, insertion, and rendering, coordinate values
    could be zero, negative, or NaN.  You might want to invoke this
    method in Ten.AsyncLoader.tryToExecute wrapper, that is why this
    method returns a boolean value.
  */
  placePopupBottomRight: function (el, refEl) {
    var l = 0;
    var t = 0;

    var eb = NR.Element.getRects(el, window);
    if (eb.contentBox.width <= 0) {
      return false;
    }

    var vp = NR.View.getViewportRects(window).contentBox;
    if (refEl) {
      var reb = NR.Element.getRects(refEl, window);
      l = reb.marginBox.right - eb.marginBox.width;
      t = reb.borderBox.top - eb.marginBox.height;
    } else {
      l = vp.right - eb.marginBox.width;
      t = vp.bottom - eb.marginBox.height;
    }

    if (isNaN(l) || isNaN(t)) {
      return false;
    }

    if (l < 0) l = 0;
    if (t < 0) t = 0;

    this.setPositionFixed(el, l, t);

    return true;
  },

  setPositionFixed: function (el, l, t) {
    // Don't use CSS's 'position: fixed' because Ten.Dragger does
    // not support it.
    //if (Ten.Browser.CSS.noFixed) {
      var vp = NR.View.getViewportRects(window);
      el.tenOriginalLeft = l - vp.scrollState.x;
      el.tenOriginalTop = t - vp.scrollState.y;
      el.style.position = 'absolute';
      var code = function () {
        var vp = NR.View.getViewportRects(window);
        el.style.left = (el.tenOriginalLeft + vp.scrollState.x) + 'px';
        el.style.top = (el.tenOriginalTop + vp.scrollState.y) + 'px';
      };
      code();
      new Ten.Observer(window, 'onscroll', code);
      el.ontenenddrag = function (el) {
        var ep = NR.Element.getRects(el, window);
        var t = ep.marginBox.top;
        var l = ep.marginBox.left;
        var vp = NR.View.getViewportRects(window);
        el.tenOriginalLeft = l - vp.scrollState.x;
        el.tenOriginalTop = t - vp.scrollState.y;
      };
    /*} else {
      el.style.position = 'fixed';
      el.style.left = l + 'px';
      el.style.top = t + 'px';
    }*/
  }
});
