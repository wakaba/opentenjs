Ten.AsyncLoader.PageFragmentLoader.TextData = new Ten.Class({
  initialize: function (s) {
    this._text = s;
  }
}, {
  getText: function (key) {
    if (key == 'body') {
      return this._text;
    } else {
      return null;
    }
  },

  isError: function () {
    return false; // XXX
  }
});
