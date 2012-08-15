Ten.AsyncLoader.Indicator = new Ten.Class({
  _indicator: {},
  _count: {},

  getIndicatorElement: function (key) {
    key = key || 'global';
    if (!this._indicator[key]) {
      this._indicator[key] = document.getElementById('global-indicator');
    }
    return this._indicator[key];
  },
  setIndicatorElement: function (key, el) {
    this._indicator[key] = el;
  },

  start: function (key) {
    key = key || 'global';
    this._count[key]++;
    if (!(this._count[key] > 0)) this._count[key] = 1;
    var el = this.getIndicatorElement(key);
    el.className = el.className.replace(/\bten-hidden\b/g, '');
  },
  stop: function (key) {
    key = key || 'global';
    this._count[key]--;
    if (!(this._count[key] > 0)) {
      var el = this.getIndicatorElement(key);
      el.className += ' ten-hidden';
    }
  }
});
