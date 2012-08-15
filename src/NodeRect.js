if (!self.NR) self.NR = {};

if (!NR.index) NR.index = 0;

NR.resetIndex = function () {
  NR.index = 0;
}; // resetIndex


/* --- NR.Rect - Rectangle area --- */

/* Constructors */

NR.Rect = function (t, r, b, l, w, h) {
  if (t != null) {
    this.top = t;
    this.bottom = b != null ? b : t + h;
    this.height = h != null ? h : b - t;
  } else {
    this.bottom = b;
    this.top = b - h;
    this.height = h;
  }
  if (l != null) {
    this.left = l;
    this.right = r != null ? r : l + w;
    this.width = w != null ? w : r - l;
  } else {
    this.right = r;
    this.left = r - w;
    this.width = w;
  }
  this.index = NR.index++;
  this.label = null;
  this.invalid = isNaN (this.top + this.right + this.bottom + this.left + 0);
}; // Rect

NR.Rect.wh = function (w, h) {
  return new NR.Rect (0, null, null, 0, w, h);
}; // wh

NR.Rect.whCSS = function (el, w, h) {
  var px = NR.Element.getPixelWH (el, w, h);
  return NR.Rect.wh (px.width, px.height);
}; // whCSS

NR.Rect.trbl = function (t, r, b, l) {
  return new NR.Rect (t, r, b, l);
}; // trbl

NR.Rect.trblCSS = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return NR.Rect.trbl (lt.height, rb.width, rb.height, lt.width);
}; // trblCSS

NR.Rect.tlwh = function (t, l, w, h) {
  return new NR.Rect (t, null, null, l, w, h);
}; // tlwh

/* Box properties */

NR.Rect.prototype.isZeroRect = function () {
  return this.width == 0 && this.height == 0;
}; // isZeroRect

/* Box rendering properties */

NR.Rect.prototype.getRenderedLeft = function () {
  return this.left;
}; // getRenderedLeft

NR.Rect.prototype.getRenderedTop = function () {
  return this.top;
}; // getRenderedTop

NR.Rect.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Rect.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Rect.prototype.add = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top + arg.y, null, null, this.left + arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
    r = new this.constructor
        (this.top - Math.abs (arg.top),
         this.right + Math.abs (arg.right),
         this.bottom + Math.abs (arg.bottom),
         this.left - Math.abs (arg.left));
    r.prevOp = 'out-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // add

NR.Rect.prototype.subtract = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top - arg.y, null, null, this.left - arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
      r = new this.constructor
          (this.top + Math.abs (arg.top),
           this.right - Math.abs (arg.right),
           this.bottom - Math.abs (arg.bottom),
           this.left + Math.abs (arg.left));
      r.prevOp = 'in-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // subtract

NR.Rect.prototype.getTopLeft = function () {
  var o = new NR.Vector (this.left, this.top);
  o.prevOp = 'topleft';
  o.prev1 = this;
  o.invalid = this.invalid;
  o.label = this.label + ', top-left corner';
  return o;
}; // getTopLeft

/* Stringifications */

NR.Rect.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Rect.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r += "Invalid \n";
  }
  r += 'Top: ' + this.top + " \n";
  r += 'Right: ' + this.right + " \n";
  r += 'Bottom: ' + this.bottom + " \n";
  r += 'Left: ' + this.left + " \n";
  r += 'Width: ' + this.width + " \n";
  r += 'Height: ' + this.height + " \n";
  return r;
}; // toString

/* Invalid */

NR.Rect.invalid = new NR.Rect (0, 0, 0, 0);
NR.Rect.invalid.label = 'Invalid';
NR.Rect.invalid.invalid = true;


/* --- NR.Vector - Vector --- */

/* Constructor */

NR.Vector = function (x /* width */, y /* height */) {
  this.x = x;
  this.y = y;
  this.width = Math.abs (x);
  this.height = Math.abs (y);
  this.invalid = isNaN (x + y + 0);
  this.index = NR.index++;
  this.label = null;
}; // Vector

/* Box rendering properties */

NR.Vector.prototype.getRenderedLeft = function () {
  return this.x < 0 ? -this.width : 0;
}; // getRenderedLeft

NR.Vector.prototype.getRenderedTop = function () {
  return this.y < 0 ? -this.height : 0;
}; // getRenderedTop

NR.Vector.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Vector.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Vector.prototype.negate = function () {
  var r = new this.constructor (-this.x, -this.y);
  r.invalid = this.invalid;
  r.prevOp = 'negate';
  r.prev1 = this;
  r.label = this.label + ', negated';
  return r;
}; // negate

NR.Vector.prototype.add = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x + arg.x, this.y + arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'add-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Vector.prototype.subtract = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x - arg.x, this.y - arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'sub-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // subtract

/* Stringifications */

NR.Vector.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp === 'topleft' || this.prevOp === 'negate') {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ') ' +
        this.label;
  } else if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Vector.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += '(horizontal, vertical) = (x, y) = (';
  r += this.x + ', ';
  r += this.y + ') \n';
  return r;
}; // toString

/* Invalid */

NR.Vector.invalid = new NR.Vector (0, 0);
NR.Vector.invalid.label = 'Invalid';
NR.Vector.invalid.invalid = true;


/* --- NR.Band - Rectangle area with rectangle hole --- */

/* Constructors */

NR.Band = function (t, r, b, l) {
  this.top = t;
  this.right = r;
  this.bottom = b;
  this.left = l;
  this.invalid = isNaN (t + r + b + l + 0);
  this.index = NR.index++;
  this.label = null;
}; // Band

NR.Band.css = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return new NR.Band (lt.height, rb.width, rb.height, lt.width);
}; // css

/* Box rendering properties */

NR.Band.prototype.getRenderedLeft = function () {
  return -this.left;
}; // getRenderedLeft

NR.Band.prototype.getRenderedTop = function () {
  return -this.top;
}; // getRenderedTop

NR.Band.prototype.getRenderedWidth = function () {
  return this.left + this.right;
}; // getRenderedWidth

NR.Band.prototype.getRenderedHeight = function () {
  return this.top + this.bottom;
}; // getRenderedHeight

/* Operations */

NR.Band.prototype.getTopLeft = function () {
  var r = new NR.Vector (-this.left, -this.top);
  r.invalid = this.invalid;
  r.prevOp = 'topleft';
  r.prev1 = this;
  r.label = this.label + ', outside edge top-left corner, from inside edge';
  return r;
}; // getTopLeft

NR.Band.prototype.add = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (this.top + arg.top, this.right + arg.right,
       this.bottom + arg.bottom, this.left + arg.left);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'out-edge';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Band.prototype.and = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (arg.top != 0 ? this.top : 0, arg.right != 0 ? this.right : 0,
       arg.bottom != 0 ? this.bottom : 0, arg.left != 0 ? this.left : 0);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'and';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // and

/* Stringifications */

NR.Band.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Band.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += 'Top: ' + this.top + ' \n';
  r += 'Right: ' + this.right + ' \n';
  r += 'Bottom: ' + this.bottom + ' \n';
  r += 'Left: ' + this.left + ' \n';
  return r;
}; // toString

/* Invalid */

NR.Band.invalid = new NR.Band (0, 0, 0, 0);
NR.Band.invalid.label = 'Invalid';
NR.Band.invalid.invalid = true;


/* --- NR.Element --- */

if (!NR.Element) NR.Element = {};

NR.Element.getPixelWH = function (el, w, h) {
  var testEl = el.ownerDocument.createElement ('div');
  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.margin = 0;
  testEl.style.borderWidth = 0;
  testEl.style.padding = 0;
  var ws = 1;
  w = (w + '').replace (/^-/, function () { ws = -1; return '' });
  if (w == 'auto') w = 0;
  var hs = 1;
  h = (h + '').replace (/^-/, function () { hs = -1; return '' });
  if (h == 'auto') h = 0;
  try {
    // TODO: border-width: medium and so on
    testEl.style.left = w;
    testEl.style.top = h;
  } catch (e) {
  }

  var parentEl = el;
  while (parentEl) {
    try {
      parentEl.appendChild (testEl);
      break;
    } catch (e) { // if |el| is e.g. |img|
      parentEl = parentEl.parentNode || parentEl.ownerDocument.body;
    }
  }
  var px = {width: testEl.style.pixelLeft, height: testEl.style.pixelTop};
  px.width *= ws;
  px.height *= hs;

  var iw = testEl.offsetWidth;
  var ih = testEl.offsetHeight;
  if (w == 'thin' || w == 'medium' || w == 'thick') {
    testEl.style.borderLeft = 'solid black ' + w;
    px.width += testEl.offsetWidth - iw;
  }
  if (h == 'thin' || h == 'medium' || h == 'thick') {
    testEl.style.borderTop = h + ' solid black';
    px.height += testEl.offsetHeight - ih;
  }

  if (testEl.parentNode) testEl.parentNode.removeChild (testEl);
  return px;
}; // getPixelWH

NR.Element.getCumulativeOffsetRect = function (oel, view) {
  var el = oel;

  var en = new NR.Band (0, 0, 0, 0);
  en.label = 'Zero-width band';

  if (/WebKit/.test (navigator.userAgent)) {
    var docEl = el.ownerDocument.documentElement;
    var bodyEl = el.ownerDocument.body;

    /* This correction does not always work when margin collapse
       occurs - to take that effect into account, all children in the layout
       structure have to be checked. */

    if (docEl) {
      var rects = NR.Element.getBoxAreas (docEl, view);

      if (docEl == oel) {
        /* BUG: If viewport is not the root element, this should not be added. */
        en = rects.padding;
      } else if (bodyEl == oel) {
        en = rects.border.add (rects.margin);
        en.label = docEl.nodeName + ' margin + border';
        en = en.add (rects.padding);
        en.label = docEl.nodeName + ' margin + border + padding';
      } else {
        en = rects.padding.add (rects.border);
        en.label = docEl.nodeName + ' border + padding';
        en = en.and (rects.border);
        en.label = docEl.nodeName + ' border ? border + padding : 0';
      }
    }

    if (bodyEl) {
      var rects = NR.Element.getBoxAreas (bodyEl, view);
      
      if (bodyEl == oel) {
        en = en.add (rects.margin);
        en.label += ', with ' + bodyEl.nodeName + ' margin';
      } else {
        en = en.add (rects.border);
        en.label += ', with ' + bodyEl.nodeName + ' border';
      }
    }

    /* td:first-child's offsetTop might not be correct - no idea when this
       occurs and how to fix this. */
  }

  var origin = en.getTopLeft ().negate ();

  var offsetChain = [];
  while (el) {
    offsetChain.unshift (el);
    el = el.offsetParent;
  }

  while (offsetChain.length) {
    var el = offsetChain.shift ();

    var offset = new NR.Vector (el.offsetLeft, el.offsetTop);
    offset.label = el.nodeName + '.offset';

    origin = origin.add (offset);
    origin.label = el.nodeName + ' cumulative offset';
    
    el = el.offsetParent;
  }

  if (view.opera && /* Opera 9.52 */
      oel == oel.ownerDocument.body) {
    var cssRects = NR.Element.getBoxAreas (oel, view);
    origin = origin.add (cssRects.margin.getTopLeft ());
    origin.label = oel.nodeName + ' adjusted offset';
  }

  var offsetBox = NR.Rect.wh (oel.offsetWidth, oel.offsetHeight);
  offsetBox.label = oel.nodeName + ' offset box (width/height)';

  var rect = offsetBox.add (origin);
  rect.label = oel.nodeName + ' cumulative offset box';

  return rect;
}; // getCumulativeOffsetRect

NR.Element.getBoxAreas = function (el, view) {
  var rects = {};
  if (view.getComputedStyle) {
    var cs = view.getComputedStyle (el, null);
    rects.margin = new NR.Band (
      parseFloat (cs.marginTop.slice (0, -2)),
      parseFloat (cs.marginRight.slice (0, -2)),
      parseFloat (cs.marginBottom.slice (0, -2)),
      parseFloat (cs.marginLeft.slice (0, -2))
    );
    rects.border = new NR.Band (
      parseFloat (cs.borderTopWidth.slice (0, -2)),
      parseFloat (cs.borderRightWidth.slice (0, -2)),
      parseFloat (cs.borderBottomWidth.slice (0, -2)),
      parseFloat (cs.borderLeftWidth.slice (0, -2))
    );
    rects.padding = new NR.Band (
      parseFloat (cs.paddingTop.slice (0, -2)),
      parseFloat (cs.paddingRight.slice (0, -2)),
      parseFloat (cs.paddingBottom.slice (0, -2)),
      parseFloat (cs.paddingLeft.slice (0, -2))
    );
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else if (el.currentStyle) {
    var cs = el.currentStyle;
    rects.margin = NR.Band.css
        (el, cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft);
    var bs = [cs.borderTopStyle, cs.borderRightStyle,
              cs.borderBottomStyle, cs.borderLeftStyle];
    rects.border = NR.Band.css
        (el,
         bs[0] == 'none' ? 0 : cs.borderTopWidth,
         bs[1] == 'none' ? 0 : cs.borderRightWidth,
         bs[2] == 'none' ? 0 : cs.borderBottomWidth,
         bs[3] == 'none' ? 0 : cs.borderLeftWidth);
    rects.padding = NR.Band.css
        (el, cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft);
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else {
    rects.margin = NR.Band.invalid;
    rects.border = NR.Band.invalid;
    rects.padding = NR.Band.invalid;
  }
  return rects;
}; // getBoxAreas

NR.Element.getAttrRects = function (el) {
  var rects = {};

  /* See <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/offset%2A> for
     compatibility problems. */

  rects.offset = NR.Rect.tlwh
      (el.offsetTop, el.offsetLeft, el.offsetWidth, el.offsetHeight);
  rects.offset.label = el.nodeName + '.offset';

  rects.client = NR.Rect.tlwh
      (el.clientTop, el.clientLeft, el.clientWidth, el.clientHeight);
  rects.client.label = el.nodeName + '.client';

  rects.scrollableArea = NR.Rect.wh (el.scrollWidth, el.scrollHeight);
  rects.scrollableArea.label = el.nodeName + '.scroll (width, height)';

  rects.scrollState = new NR.Vector (el.scrollLeft, el.scrollTop);
  rects.scrollState.label = el.nodeName + '.scroll (left, top)';

  return rects;
}; // getAttrRects

NR.Element.getRects = function (el, view) {
  var rects = {};

  if (el.getBoundingClientRect) {
    var origin = NR.View.getViewportRects (view).boundingClientOrigin;

    var bb = el.getBoundingClientRect ();
    rects.boundingClient
        = NR.Rect.trbl (bb.top, bb.right, bb.bottom, bb.left);
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = rects.boundingClient.add (origin);
    rects.borderBox.label = el.nodeName + ' border edge';
  } else {
    rects.boundingClient = NR.Rect.invalid;
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = NR.Element.getCumulativeOffsetRect (el, view);
  }

  var elRects = NR.Element.getAttrRects (el);
  rects.offset = elRects.offset;
  rects.client = elRects.client;
  rects.scrollableArea = elRects.scrollableArea;
  rects.scrollState = elRects.scrollState;
  
  var cssRects = NR.Element.getBoxAreas (el, view);
  rects.margin = cssRects.margin;
  rects.border = cssRects.border;
  rects.padding = cssRects.padding;

  /* Wrong if |el| has multiple line boxes. */
  rects.marginBox = rects.borderBox.add (rects.margin);
  rects.marginBox.label = el.nodeName + ' margin edge';

  rects.clientAbs = rects.client.add (rects.borderBox.getTopLeft ());
  rects.clientAbs.label = el.nodeName + '.client (canvas origin)';

  if (rects.client.isZeroRect () ||
      (view.opera && (rects.client.width <= 0 || rects.client.height <= 0))) {
    // maybe inline or non-rendered element
    rects.paddingBox = rects.borderBox.subtract (rects.border);
    rects.paddingBox.label = el.nodeName + ' border edge - border';
  } else {
    rects.paddingBox = rects.clientAbs;
  }

  rects.contentBox = rects.paddingBox.subtract (rects.padding);
  rects.contentBox.label = el.nodeName + ' content box';

  return rects;
}; // getRects

NR.Element.getRectsExtra = function (el, view) {
  var rects = {};

  /* Gecko-only, deprecated */
  if (el.ownerDocument.getBoxObjectFor) {
    var bo = el.ownerDocument.getBoxObjectFor (el);
    rects.boxObject = NR.Rect.tlwh (bo.y, bo.x, bo.width, bo.height);
    rects.boxObjectScreen = new NR.Vector (bo.screenX, bo.screenY);
    rects.boxObject.label = el.nodeName + ' boxObject';
    rects.boxObjectScreen.label = el.nodeName + ' boxObject.screen';
  } else {
    rects.boxObject = NR.Rect.invalid;
    rects.boxObjectScreen = NR.Vector.invalid;
  }

  /* WinIE only */
  if (el.createTextRange) {
    var trs = NR.Range.getRectsExtra (el.createTextRange (), view);
    rects.textRangeBounding = trs.bounding;
    rects.textRangeBoundingClient = trs.boundingClient;
    rects.textRangeOffset = trs.offset;
  } else {
    rects.textRangeBounding = NR.Rect.invalid;
    rects.textRangeBoundingClient = NR.Rect.invalid;
    rects.textRangeOffset = NR.Rect.invalid;
  }

  /* Not supported by Gecko */
  if (el.style) {
    var css = el.style;

    rects.pos = new NR.Rect (css.posTop, css.posRight, css.posBottom, css.posLeft,
                             css.posWidth, css.posHeight); // Unit is not pixel.
    rects.pos.label = el.nodeName + '.style.pos';

    rects.px = new NR.Rect (css.pixelTop, css.pixelRight,
                            css.pixelBottom, css.pixelLeft,
                            css.pixelWidth, css.pixelHeight);
    rects.px.label = el.nodeName + '.style.pixel';
  } else {
    rects.pos = NR.Rect.invalid;
    rects.pixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko, WebKit, and WinIE */
  if (el.currentStyle) {
    var css = el.currentStyle;

    rects.currentPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.currentPos.label = el.nodeName + '.currentStyle.pos';

    rects.currentPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                   css.pixelBottom, css.pixelLeft,
                                   css.pixelWidth, css.pixelHeight);
    rects.currentPx.label = el.nodeName + '.currentStyle.pixel';
  } else {
    rects.currentPos = NR.Rect.invalid;
    rects.currentPixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko and WinIE */
  if (view.getComputedStyle) {
    var css = view.getComputedStyle (el, null);

    rects.computedPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.computedPos.label = el.nodeName + ' computedStyle.pos';

    rects.computedPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                    css.pixelBottom, css.pixelLeft,
                                    css.pixelWidth, css.pixelHeight);
    rects.computedPx.label = el.nodeName + ' computedStyle.pixel';
  } else {
    rects.computedPos = NR.Rect.invalid;
    rects.computedPixel = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra

// Don't use - these stuffs are not interoperable at all
NR.Element.getLineRects = function (el, view) {
  var rects = {};

  /* Not supportedby WebKit */
  rects.clients = [];
  if (el.getClientRects) {
    var crs = el.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  var doc = el.ownerDocument;

  var range;
  if (doc.createRange) {
    /* Gecko, WebKit, Opera */
    range = doc.createRange ();
    range.selectNodeContents (el);
  } else if (doc.body && doc.body.createTextRange) {
    /* WinIE only */
    range = doc.body.createTextRange ();
    range.moveToElementText (el);
  }
  var rr = NR.Range.getRectsExtra (range, view);
  rects.rangeClients = rr.clients;

  return rects;
}; // getLineRects



/* --- NR.Range --- */

if (!NR.Range) NR.Range = {};

// Don't use - these stuffs are not interoperable at all
NR.Range.getRectsExtra = function (range, view) {
  var rects = {};

  /* WinIE only */
  rects.bounding = NR.Rect.tlwh
      (range.boundingTop, range.boundingLeft,
       range.boundingWidth, range.boundingHeight);
  rects.bounding.label = 'Range.bounding';

  /* WinIE only */
  rects.offset = new NR.Vector (range.offsetLeft, range.offsetTop);
  rects.offset.label = 'Range.offset';

  /* WinIE only */
  rects.clients = [];
  if (range.getClientRects) {
    var crs = range.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  /* WinIE only */
  if (range.getBoundingClientRect) {
    var bc = range.getBoundingClientRect ();
    rects.boundingClient = NR.Rect.trbl (bc.top, bc.right, bc.bottom, bc.left);
    rects.boundingClient.label = 'Range.getBoundingClientRect';
  } else {
    rects.boundingClient = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra



/* --- NR.View --- */

if (!NR.View) NR.View = {};

NR.View.getBoundingClientRectOrigin = function (view, doc) {
  var parentEl = doc.body || doc.documentElement;
  var testEl = doc.createElement ('non-styled-element');

  if (!testEl.getBoundingClientRect) return NR.Vector.invalid;

  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.top = 0;
  testEl.style.left = 0;
  testEl.margin = 0;
  testEl.borderWidth = 0;
  testEl.padding = 0;
  parentEl.appendChild (testEl);

  var bc = testEl.getBoundingClientRect ();
  var origin = new NR.Vector (-bc.left, -bc.top);
  origin.label = 'Origin of getBoundingClientRect';

  parentEl.removeChild (testEl);

  return origin;
}; // getBoundingClientRectOrigin

NR.View.getViewportRects = function (view) {
  var doc = view.document;
  var docEl = doc.documentElement;
  var bodyEl = doc.body;

  var quirks = doc.compatMode != 'CSS1Compat';
  
  var rects = {};

  /* Not supported by WinIE */
  rects.windowPageOffset = new NR.Vector (view.pageXOffset, view.pageYOffset);
  rects.windowPageOffset.label = 'window.pageOffset';

  if (docEl) {
    var deRects = NR.Element.getAttrRects (docEl);
    rects.deOffset = deRects.offset;
    rects.deClient = deRects.client;
    rects.deScrollableArea = deRects.scrollableArea;
    rects.deScrollState = deRects.scrollState;
  } else {
    rects.deOffset = NR.Rect.invalid;
    rects.deClient = NR.Rect.invalid;
    rects.deScrollableArea = NR.Rect.invalid;
    rects.deScrollState = NR.Vector.invalid;
  }

  if (bodyEl) {
    var dbRects = NR.Element.getAttrRects (bodyEl);
    rects.bodyOffset = dbRects.offset;
    rects.bodyClient = dbRects.client;
    rects.bodyScrollableArea = dbRects.scrollableArea;
    rects.bodyScrollState = dbRects.scrollState;
  } else {
    rects.bodyOffset = NR.Rect.invalid;
    rects.bodyClient = NR.Rect.invalid;
    rects.bodyScrollState = NR.Rect.invalid;
    rects.bodyScrollableArea = NR.Vector.invalid;
  }

  if (document.all && !window.opera) {
    if (quirks) {
      rects.scrollState = rects.bodyScrollState;
    } else {
      rects.scrollState = rects.deScrollState;
    }
  } else {
    rects.scrollState = rects.windowPageOffset;
  }

  if (quirks) {
    rects.icb = rects.bodyClient;
    rects.icb = rects.icb.subtract (rects.icb.getTopLeft ()); // Safari
    /* This is not ICB in Firefox if the document is in the quirks mode
       and both |html| and |body| has scrollbars.  In such cases there
       is no way to obtain ICB (content edge), AFAICT. */

    if (document.all && !window.opera) {
      /*
          This returns wrong value if the author does not specify the border
          of the |body| element - default viewport border width is 2px, but
          |document.body.currentStyle.borderWidth|'s default is |medium|, which
          is interpreted as |4px| when it was specified by author.
      
      var docElRects = NR.Element.getBoxAreas (bodyEl, view);
      rects.boundingClientOrigin = docElRects.border.getTopLeft ();
      rects.boundingClientOrigin.label = 'Viewport border offset';
      */

      rects.boundingClientOrigin
          = NR.View.getBoundingClientRectOrigin (view, doc);
    }
  } else {
    if (document.all && !window.opera) {
      rects.icb = rects.deOffset;

      rects.boundingClientOrigin = rects.icb.subtract (rects.deClient.getTopLeft ());
      rects.boundingClientOrigin.label
          = rects.icb.label + ' - documentElement.client';

      rects.boundingClientOrigin = rects.boundingClientOrigin.getTopLeft ();
    } else {
      rects.icb = rects.deClient;
    }
  }

  /* Firefox's initial containing block is the padding box.  There is 
     no reliable way to detect the offset from the tl of canvas in Fx
     while returning zero in any other browsers AFAICT, sniffing Gecko by
     UA string. */
  if (navigator.userAgent.indexOf("Gecko/") >= 0) {
    var deBorder = rects.deOffset.getTopLeft ();
    deBorder.label = 'padding edge -> border edge of root element box';

    var debc = docEl.getBoundingClientRect ();
    debc = NR.Rect.trbl (debc.top, debc.right, debc.bottom, debc.left);
    debc.label = docEl.nodeName + ' boundingClientRect';

    var debcAbs = debc.add (rects.scrollState);
    debcAbs.label = debc.label + ', canvas origin';

    var deMargin = debcAbs.getTopLeft ();
    deMargin.label = 'margin edge -> border edge of root element box';

    rects.canvasOrigin = deBorder.add (deMargin.negate ());
    rects.canvasOrigin.label = 'Canvas origin';

    rects.icb = rects.icb.subtract (rects.canvasOrigin);
    rects.icb.label = 'ICB (origin: margin edge of root element box)';
  } else {
    rects.canvasOrigin = new NR.Vector (0, 0);
    rects.canvasOrigin.label = 'Canvas origin';
  }

  rects.contentBox = rects.icb.add (rects.scrollState);
  rects.contentBox.label = 'Viewport content box';

  if (rects.boundingClientOrigin) {
    if (document.all && !window.opera && quirks) {
      //
    } else {
      rects.boundingClientOrigin
          = rects.boundingClientOrigin.add (rects.scrollState);
      rects.boundingClientOrigin.label = 'Bounding client rect origin';
    }
  } else {
    rects.boundingClientOrigin = rects.scrollState;
  }

  rects.boundingClientOrigin
      = rects.boundingClientOrigin.add (rects.canvasOrigin);
  rects.boundingClientOrigin.label = 'Bounding client rect origin (canvas origin)';

  return rects;
}; // getViewportRects

NR.View.getViewportRectsExtra = function (view) {
  var rects = {};

  var doc = view.document;

  /* Fx, WebKit, Opera: entire viewport (including scrollbars),
     Not supported by WinIE */
  rects.windowInner = NR.Rect.wh (view.innerWidth, view.innerHeight);
  rects.windowInner.label = 'window.inner';

  /* Fx3, WebKit: Same as page offset; Not supported by Opera, WinIE */
  rects.windowScrollXY = new NR.Vector (view.scrollX, view.scrollY);
  rects.windowScrollXY.label = 'window.scroll (x, y)';

  /* Not supported by WebKit, Opera, WinIE */
  rects.windowScrollMax = new NR.Vector (view.scrollMaxX, view.scrollMaxY);
  rects.windowScrollMax.label = 'window.scrollMax';

  /* Not supported by Opera, WinIE */
  rects.document = NR.Rect.wh (doc.width, doc.height);
  rects.document.label = 'Document';

  return rects;
}; // getViewportRectsExtra

NR.View.getWindowRects = function (view) {
  var rects = {};

  /* Not supported by WinIE */
  rects.outer = NR.Rect.wh (view.outerWidth, view.outerHeight);
  rects.outer.label = 'window.outer';

  /* Opera: Wrong; Not supported by WinIE */
  rects.screenXY = new NR.Vector (view.screenX, view.screenY);
  rects.screenXY.label = 'window.screen (x, y)';

  /* Not supported by Fx3 */
  rects.screenTL = new NR.Vector (view.screenLeft, view.screenTop);
  rects.screenTL.label = 'window.screen (top, left)';

  return rects;
}; // getWindowRects

NR.View.getScreenRects = function (view) {
  var s = view.screen;

  var rects = {};
 
  /* top & left not supported by Opera, WinIE, WebKit */
  rects.device = NR.Rect.tlwh (s.top || 0, s.left || 0, s.width, s.height);
  rects.device.label = 'screen device';

  /* top & left not supported by Opera, WinIE */
  rects.avail = NR.Rect.tlwh
      (s.availTop || 0, s.availLeft || 0, s.availWidth, s.availHeight);
  rects.avail.label = 'screen.avail';

  return rects;
}; // getScreenRects

/* --- NR.Event --- */

if (!NR.Event) NR.Event = {};

NR.Event.getRects = function (ev, view, vpRects /* optional */) {
  var rects = {};

  rects.client = new NR.Vector (ev.clientX, ev.clientY);
  rects.client.label = 'event.client';

  /* Not supported by Gecko */
  rects.offset = new NR.Vector (ev.offsetX, ev.offsetY);
  rects.offset.label = 'event.offset';

  var vp = vpRects || NR.View.getViewportRects (view);

  rects.viewport = rects.client.add (vp.canvasOrigin);
  rects.viewport.label = 'event (viewport origin)';

  //rects.canvas = rects.page.add (vp.canvasOrigin);
  rects.canvas = rects.viewport.add (vp.scrollState);
  rects.canvas.label = 'event (canvas origin)';

  return rects;
}; // getRects

NR.Event.getRectsExtra = function (ev) {
  var rects = {};

  rects.screen = new NR.Vector (ev.screenX, ev.screenY);
  rects.screen.label = 'event.screen';

  /* Not supported by Gecko, WebKit, Opera, WinIE (was supported by NC4) */
  rects.wh = new NR.Vector (ev.width, ev.height);
  rects.wh.label = 'event.width, event.height';

  /* Not supported by WinIE */
  rects.page = new NR.Vector (ev.pageX, ev.pageY);
  rects.page.label = 'event.page';

  /* Not supported by Opera, WinIE */
  rects.layer = new NR.Vector (ev.layerX, ev.layerY);
  rects.layer.label = 'event.layer';

  /* Not supported by Gecko */
  rects.xy = new NR.Vector (ev.x, ev.y);
  rects.xy.label = 'event.x, event.y';

  return rects;
}; // getRectsExtra



if (self.NROnLoad) {
  NROnLoad ();
}

/* 

NR.js - Cross-browser wrapper for CSSOM View attributes

Documentation: <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/NodeRect%2Ejs>.

Author: Wakaba <w@suika.fam.cx>.

*/

/* ***** BEGIN LICENSE BLOCK *****
 * Copyright 2008-2009 Wakaba <w@suika.fam.cx>.  All rights reserved.
 *
 * This program is free software; you can redistribute it and/or 
 * modify it under the same terms as Perl itself.
 *
 * Alternatively, the contents of this file may be used 
 * under the following terms (the "MPL/GPL/LGPL"), 
 * in which case the provisions of the MPL/GPL/LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of the MPL/GPL/LGPL, and not to allow others to
 * use your version of this file under the terms of the Perl, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the MPL/GPL/LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the Perl or the MPL/GPL/LGPL.
 *
 * "MPL/GPL/LGPL":
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * <http://www.mozilla.org/MPL/>
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is NodeRect code.
 *
 * The Initial Developer of the Original Code is Wakaba.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Wakaba <w@suika.fam.cx>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
