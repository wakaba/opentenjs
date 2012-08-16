/* Requires Ten.js */

Ten.Browser.isWii = (window.opera && opera.wiiremote);

Ten.Wii = new Ten.Class({
  wiiremote: (window.opera ? window.opera.wiiremote : null),

  pollInterval: 100,
  start: function () {
    if (!this.wiiremote) return;
    if (this.pollTimer) return;

    var self = this;
    this.pollTimer = setInterval(function () {
      self.updateState();
    }, this.pollInterval);

    if (this.windowKeydownObserver) {
      this.windowKeydownObserver.start();
    } else {
      this.windowKeydownObserver = new Ten.Observer(window, 'onkeydown', function (ev) {
        var activeController = self.activeController;
        if (activeController == null) return;
        var state = self._buttonState[activeController][ev.event.keyCode];
        if (!state) return;
        if (state.pressed) return;
        state.pressed = true;
        var e = new Ten.Wii.ButtonEvent(activeController, ev.event.keyCode, ev.event.cancelable);
        self.dispatchEvent('buttondown', e);
        if (e.isDefaultPrevented()) {
          ev.stop();
        }
      });
    }
    if (this.windowKeyupObserver) {
      this.windowKeyupObserver.start();
    } else {
      this.windowKeyupObserver = new Ten.Observer(window, 'onkeyup', function (ev) {
        var activeController = self.activeController;
        if (activeController == null) return;
        var state = self._buttonState[activeController][ev.event.keyCode];
        if (!state) return;
        if (!state.pressed) return;
        state.pressed = false;
        var e = new Ten.Wii.ButtonEvent(activeController, ev.event.keyCode, ev.event.cancelable);
        self.dispatchEvent('buttonup', e);
        if (e.isDefaultPrevented()) {
          ev.stop();
        }
      });
    }
    if (this.windowMousedownObserver) {
      this.windowMousedownObserver.start();
    } else {
      this.windowMousedownObserver = new Ten.Observer(window, 'onmousedown', function (ev) {
        if (ev.event.button != 0) return;
        var activeController = self.activeController;
        if (activeController == null) return;
        var keyCode = self.A_BUTTON;
        var state = self._buttonState[activeController][keyCode];
        if (!state) return;
        if (state.pressed) return;
        state.pressed = true;
        var e = new Ten.Wii.ButtonEvent(activeController, keyCode, ev.event.cancelable);
        self.dispatchEvent('buttondown', e);
        if (e.isDefaultPrevented()) {
          ev.stop();
        }
      });
    }
    if (this.windowClickObserver) {
      this.windowClickObserver.start();
    } else {
      this.windowClickObserver = new Ten.Observer(window, 'onclick', function (ev) {
        if (ev.event.button != 0) return;
        var activeController = self.activeController;
        if (activeController == null) return;
        var keyCode = self.A_BUTTON;
        var state = self._buttonState[activeController][keyCode];
        if (!state) return;
        if (!state.pressed) {
          state.pressed = true;
          var e = new Ten.Wii.ButtonEvent(activeController, keyCode, ev.event.cancelable);
          self.dispatchEvent('buttondown', e);
          /*if (e.isDefaultPrevented()) {
            ev.stop();
          }*/
        }
        state.pressed = false;
        var e = new Ten.Wii.ButtonEvent(activeController, keyCode, ev.event.cancelable);
        self.dispatchEvent('buttonup', e);
        if (e.isDefaultPrevented()) {
          ev.stop();
        }
      });
    }
  },
  stop: function () {
    if (!this.pollTimer) return;
    clearInterval(this.pollTimer);
    this.pollTimer = 0;
    this.windowKeydownObserver.stop();
    this.windowKeyupObserver.stop();
    this.windowMousedownObserver.stop();
    this.windowClickObserver.stop();
  },

  updateState: function () {
    if (!this.wiiremote) return;
    var activeController = null;
    for (var i = 0; i < 4; i++) {
      var pad = this.wiiremote.update(i);
      if (pad.isEnabled && pad.isDataValid) {
        if (pad.isBrowsing) activeController = i;

        var hold = pad.hold;
        for (var j = 0; j < 13; j++) {
          n = Math.pow(2, j);
          if (pad.isBrowsing && (this.HOLD_TO_KEY[n] == this.A_BUTTON)) {
            // Will be taken from onclick event.
            continue;
          }
          this._updateButtonState(i, this.HOLD_TO_KEY[n], !!(hold & n));
        }

        if (!pad.isBrowsing) {
          var newX = this._fixX(pad.dpdX);
          var newY = this._fixY(pad.dpdY);
          if (this._position[i].x != newX || this._position[i].y != newY) {
            this._position[i].x = newX;
            this._position[i].y = newY;
            this._updatePointingTarget(i);
          }
        }
      }
    }
    this.activeController = activeController;
  },
  _updateButtonState: function (remoteId, keyCode, pressed) {
    var state = this._buttonState[remoteId][keyCode];
    if (pressed == !!state.pressed) return;
    state.pressed = pressed;
    if (pressed) {
      this.dispatchEvent('buttondown', new Ten.Wii.ButtonEvent(remoteId, keyCode, false));
    } else {
      this.dispatchEvent('buttonup', new Ten.Wii.ButtonEvent(remoteId, keyCode, false));
    }
  },

  activeController: 0,
  _buttonState: {
    "0": {
      13: {}, 170: {}, 171: {}, 172: {}, 173: {}, 174: {}, 175: {},
      176: {}, 177: {}, 178: {}, 0: {}
    },
    "1": {
      13: {}, 170: {}, 171: {}, 172: {}, 173: {}, 174: {}, 175: {},
      176: {}, 177: {}, 178: {}, 0: {}
    },
    "2": {
      13: {}, 170: {}, 171: {}, 172: {}, 173: {}, 174: {}, 175: {},
      176: {}, 177: {}, 178: {}, 0: {}
    },
    "3": {
      13: {}, 170: {}, 171: {}, 172: {}, 173: {}, 174: {}, 175: {},
      176: {}, 177: {}, 178: {}, 0: {}
    }
  },

  getPointingPosition: function (i) {
    var pos = this._position[i];
    if (!pos) return {x: 0, y: 0};
    return {x: pos.x, y: pos.y};
  },
  _position: {
    0: {x: 0, y: 0, target: document.body || document},
    1: {x: 0, y: 0, target: document.body || document},
    2: {x: 0, y: 0, target: document.body || document},
    3: {x: 0, y: 0, target: document.body || document}
  },
  _innerWidth: window.innerWidth,
  _innerHeight: window.innerHeight,
  _cX: 1,
  _cY: 1,
  _fixX: function (x) {
    return ((x + 1) * this._innerWidth * this._cX / 2);
  },
  _fixY: function (y) {
    return ((y + 1) * this._innerHeight * this._cY / 2);
  },

  getPointingTarget: function (i) {
    return this._position[i].target;
  },
  _updatePointingTarget: function (i) {
    var pos = this.getPointingPosition(i);
    var newTarget = document.elementFromPoint(pos.x, pos.y) || document.body || document;
    while (newTarget.parentNode) {
      if (newTarget.nodeType == 1 /* newTarget.ELEMENT_NODE */ ||
          newTarget.nodeType == 9 /* newTarget.DOCUMENT_NODE */) {
        break;
      } else {
        newTarget = newTarget.parentNode;
      }
    }

    var currentTarget = this._position[i].target;
    if (currentTarget != newTarget) {
      this.dispatchEvent('mouseout', new Ten.Wii.MouseoveroutEvent(i, currentTarget, newTarget));
      this._position[i].target = newTarget;
      this.dispatchEvent('mouseover', new Ten.Wii.MouseoveroutEvent(i, currentTarget, newTarget));
    } else {
      this.dispatchEvent('mousemove', new Ten.Wii.MousemoveEvent(i));
    }
  },

  _onbuttondown: function (ev) {
    if (ev.event.keyCode == this.A_BUTTON) {
      var at = this._position[ev.event.remoteId].activeTarget;
      if (at) {
        this._removeClassName(at, 'ten-wiiremoteactive', ev.event.remoteId);
      }
      this._addClassName(ev.event.target, 'ten-wiiremoteactive', ev.event.remoteId);
      this._position[ev.event.remoteId].activeTarget = ev.event.target;
    }
    ev.event.dispatchRealEvent('ten-wiiremotebuttondown');
  },
  _onbuttonup: function (ev) {
    if (ev.event.keyCode == this.A_BUTTON) {
      var at = this._position[ev.event.remoteId].activeTarget;
      if (at) {
        this._removeClassName(at, 'ten-wiiremoteactive', ev.event.remoteId);
        this._position[ev.event.remoteId].activeTarget = null;
      }
    }
    var notCanceled = ev.event.dispatchRealEvent('ten-wiiremotebuttonup');
    if (notCanceled && (ev.event.keyCode == this.A_BUTTON)) {
      ev.event.dispatchRealEvent('ten-wiiremoteclick');
    }
  },
  _onmouseover: function (ev) {
    this._addClassName(ev.event.toTarget, 'ten-wiiremotehover', ev.event.remoteId);
    ev.event.dispatchRealEvent('ten-wiiremoteover');
  },
  _onmousemove: function (ev) {
    ev.event.dispatchRealEvent('ten-wiiremotemove');
  },
  _onmouseout: function (ev) {
    this._removeClassName(ev.event.fromTarget, 'ten-wiiremotehover', ev.event.remoteId);
    ev.event.dispatchRealEvent('ten-wiiremoteout');
  },

  makeLinkClickableByAnyRemote: function (el) {
    if (el.tenIsClickableByAnyRemote) return;
    
    new Ten.Observer(el, 'onten-wiiremoteclick', function (ev) {
      var a = document.createElement('a');
      a.href = el.href;
      a.click();
      ev.stop();
    });
    
    el.tenIsClickablebyAnyRemote = true;
  },
  makeLinksClickableByAnyRemote: function (selectors) {
    var els = Ten.Selector.getElementsBySelector(selectors);
    var elsL = els.length;
    for (var i = 0; i < elsL; i++) {
      this.makeLinkClickableByAnyRemote(els[i]);
    }
  },

  _addClassName: function (element, className, remoteId) {
    var classNames = (element.className || '').split(/[\x09\x0A\x0C\x0D\x20]/);
    var newClassNames = [];
    for (var i = 0; i < classNames.length; i++) {
      var c = classNames[i];
      if (c == className + '-' + remoteId) {
        //
      } else if (c == className + '-0' ||
                 c == className + '-1' ||
                 c == className + '-2' ||
                 c == className + '-3') {
        newClassNames.push(c);
      } else if (c == className) {
        //
      } else {
        newClassNames.push(c);
      }
    }
    newClassNames.push(className + '-' + remoteId);
    newClassNames.push(className);
    element.className = newClassNames.join(' ');
  },
  _removeClassName: function (element, className, remoteId) {
    var classNames = (element.className || '').split(/[\x09\x0A\x0C\x0D\x20]/);
    var newClassNames = [];
    var hasClass;
    for (var i = 0; i < classNames.length; i++) {
      var c = classNames[i];
      if (c == className + '-' + remoteId) {
        //
      } else if (c == className + '-0' ||
                 c == className + '-1' ||
                 c == className + '-2' ||
                 c == className + '-3') {
        newClassNames.push(c);
        hasClass = true;
      } else if (c == className) {
        //
      } else {
        newClassNames.push(c);
      }
    }
    if (hasClass) {
      newClassNames.push(className);
    }
    element.className = newClassNames.join(' ');
  },

  HOLD_TO_KEY: {
    8: 175,
    4: 176,
    1: 178,
    2: 177,
    2048: 13,
    1024: 171,
    4096: 170,
    16: 174,
    512: 172,
    256: 173,

    // Unused
    32: 0,
    64: 0,
    128: 0
  },

  NORTH_BUTTON: 175,
  SOUTH_BUTTON: 176,
  LEFT_BUTTON: 178,
  RIGHT_BUTTON: 177,
  A_BUTTON: 13,
  B_BUTTON: 171,
  MINUS_BUTTON: 170,
  PLUS_BUTTON: 174,
  ONE_BUTTON: 172,
  TWO_BUTTON: 173
});
Ten.EventDispatcher.implementEventDispatcher(Ten.Wii);

new Ten.Observer(Ten.Wii, 'onbuttondown', Ten.Wii, '_onbuttondown');
new Ten.Observer(Ten.Wii, 'onbuttonup', Ten.Wii, '_onbuttonup');
new Ten.Observer(Ten.Wii, 'onmouseover', Ten.Wii, '_onmouseover');
new Ten.Observer(Ten.Wii, 'onmousemove', Ten.Wii, '_onmousemove');
new Ten.Observer(Ten.Wii, 'onmouseout', Ten.Wii, '_onmouseout');

(function () {
  if (Ten.Wii.wiiremote) {
    var mm = function (ev) {
      for (var i = 0; i < 4; i++) {
        var pad = Ten.Wii.wiiremote.update(i);
        if (pad.isEnabled && pad.isDataValid && pad.isBrowsing) {
          if (!Ten.Wii._cX) {
            Ten.Wii._cX = ev.pageX / (((pad.dpdX + 1) * Ten.Wii._innerWidth / 2) || 1);
            Ten.Wii._cY = ev.pageY / (((pad.dpdY + 1) * Ten.Wii._innerHeight / 2) || 1);
          }
          
          Ten.Wii._position[i].x = ev.pageX;
          Ten.Wii._position[i].y = ev.pageY;
          Ten.Wii._updatePointingTarget(i);
          break;
        }
      }
    };
    window.addEventListener('mousemove', mm, false);
  }
})();

Ten.Wii.Event = new Ten.Class({

}, {
  cancelable: false,

  _isDefaultPrevented: false,
  isDefaultPrevented: function () {
    return this._isDefaultPrevented;
  },
  preventDefault: function () {
    this._isDefaultPrevented = true;
  },
  stopPropagation: function () {
    // This method is necessary to enable preventDefault() in Ten.Event.
  },

  dispatchRealEvent: function (eventType) {
    var ev = this.createRealEvent(eventType);
    var notCanceled = this.target.dispatchEvent(ev);
    if (!notCanceled) {
      this.preventDefault();
    }
    return notCanceled;
  }
});

Ten.Wii.MouseoveroutEvent = new Ten.Class({
  initialize: function (remoteId, fromTarget, toTarget) {
    this.remoteId = remoteId;
    this.fromTarget = fromTarget;
    this.toTarget = toTarget;
  },
  base: [Ten.Wii.Event]
}, {
  remoteId: 0,
  fromTarget: window,
  toTarget: window,

  createRealEvent: function (eventType) {
    var ev = document.createEvent('Event');
    ev.initEvent(eventType, true, this.cancelable);
    ev.tenRemoteId = this.remoteId;
    ev.tenFromTarget = this.fromTarget;
    ev.tenToTarget = this.toTarget;
    var pos = Ten.Wii.getPointingPosition(this.remoteId);
    ev.pageX = pos.x;
    ev.pageY = pos.y;
    return ev;
  },
  dispatchRealEvent: function (eventType) {
    var ev = this.createRealEvent(eventType);
    var target = Ten.Wii.getPointingTarget(this.remoteId);
    var notCanceled = target.dispatchEvent(ev);
    if (!notCanceled) {
      this.preventDefault();
    }
    return notCanceled;
  }
});

Ten.Wii.MousemoveEvent = new Ten.Class({
  initialize: function (remoteId) {
    this.remoteId = remoteId;
    this.target = Ten.Wii.getPointingTarget(this.remoteId);
  },
  base: [Ten.Wii.Event]
}, {
  remoteId: 0,
  target: window,

  createRealEvent: function (eventType) {
    var ev = document.createEvent('Event');
    ev.initEvent(eventType, true, this.cancelable);
    ev.tenRemoteId = this.remoteId;
    var pos = Ten.Wii.getPointingPosition(this.remoteId);
    ev.pageX = pos.x;
    ev.pageY = pos.y;
    return ev;
  }
});

Ten.Wii.ButtonEvent = new Ten.Class({
  initialize: function (remoteId, keyCode, cancelable) {
    this.remoteId = remoteId;
    this.keyCode = keyCode;
    this.cancelable = cancelable;
    this.target = Ten.Wii.getPointingTarget(this.remoteId);
  },
  base: [Ten.Wii.Event]
}, {
  remoteId: 0,
  keyCode: 0,

  createRealEvent: function (eventType) {
    var ev = document.createEvent('Event');
    ev.initEvent(eventType, true, this.cancelable);
    ev.tenRemoteId = this.remoteId;
    ev.keyCode = this.keyCode;
    var pos = Ten.Wii.getPointingPosition(this.remoteId);
    ev.pageX = pos.x;
    ev.pageY = pos.y;
    return ev;
  }
});