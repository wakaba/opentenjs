Ten.Storage.Local = new Ten.Class({
  initialize: function () {
    if (self.localStorage) {
      this.localStorage = self.localStorage;
    } else if (self.globalStorage) {
      this.localStorage = self.globalStorage[document.domain];
    } else {
      return new Ten.Cookie();
    }
  }
}, {
  get: function (key) {
    return this.localStorage[key];
  },
  set: function (key, value) {
    return this.localStorage[key] = value;
  }
});
