function NotificationArea (element, opts) {
  this.element = element;
  this.options = opts || {};
  var self = this;
  this.element.onclick = function () {
    self.onclick();
    return false;
  };
}

NotificationArea.prototype = {
  showElement: function () {
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';
    this.isShown = true;
    if (this.current && this.current.onshown) {
      this.current.onshown.apply(this);
    }
  },
  showElementLater: function () {
    if (this.showElementTimer) clearTimeout(this.showElementTimer);
    var self = this;
    this.showElementTimer = setTimeout(function () {
      self.showElement();
    }, 1000);
  },
  hideElement: function (opts) {
    if (this.hasNextInfo() || (opts && opts.hasNext)) {
      this.element.style.visibility = 'hidden';
    } else {
      this.element.style.display = 'none';
    }
    this.isShown = false;
    if (this.showElementTimer) clearTimeout(this.showElementTimer);
    if (this.current && this.current.onhidden) {
      this.current.onhidden.apply(this);
    }
  },

  setText: function (text, opts) {
    this.element.innerText = text;
    this.element.textContent = text;
    this.element.href = opts.href || '';
    this.current = opts;
  },
  registerText: function (text, opts) {
    this.setText(text, opts);
    if (opts.showNow) {
      this.showElement();
    } else {
      this.showElementLater();
    }
  },

  setStatus: function (text, onclick) {
    var opts = {
      isStatus: true,
      onclick: onclick,
      id: Math.random()
    };
    if (this.isShown) {
      this.hideElement({hasNext: true});
      this.registerText(text, opts);
    } else {
      opts.showNow = true;
      this.registerText(text, opts);
    }
    return opts.id;
  },
  addInfo: function (text, onclick) {
    var opts = {
      isStatus: false,
      onclick: onclick instanceof Function ? onclick : function () {
          location.href = onclick;
      },
      href: onclick instanceof Function ? null : onclick,
      id: Math.random()
    };
    this.infoData = this.infoData || [];
    this.infoData.unshift([text, opts]);
    if (this.current && this.current.isStatus) {
      //
    } else {
      this.prepareNextText();
    }
    return opts.id;
  },
  prepareNextText: function () {
    if (this.infoData && this.infoData.length) {
      var data = this.infoData[0];
      this.registerText(data[0], data[1]);
    }
  },
  deleteById: function (id) {
    if (this.current && this.current.id == id) {
      this.closeText();
      return;
    }
    
    var data = this.infoData;
    for (var i = 0; i < data.length; i++) {
      if (data[i].id == id) {
        data.splice(i, 0);
        return;
      }
    }
  },
  closeText: function () {
    this.hideElement();
    if (this.current && !this.current.isStatus && this.infoData) {
      this.infoData.shift();
    }
    delete this.current;
    this.prepareNextText();
  },
  hasNextInfo: function() {
    return this.infoData && this.infoData.length;
  },
  onclick: function () {
    if (this.current.onclick) {
      this.current.onclick.apply(this);
    }
    this.closeText();
  }
};
