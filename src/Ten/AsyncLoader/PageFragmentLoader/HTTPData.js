Ten.AsyncLoader.PageFragmentLoader.HTTPData = new Ten.Class({
  initialize: function (xhr) {
    this._text = xhr.getSimpleErrorInfo();
    this._isError = xhr.succeeded();
  }
}, {
  getText: function (key) {
    if (key == 'body') {
      var div = document.createElement('div');
      div.innerHTML = '<span class=ten-asyncloader-error>a</span>';
      div.firstChild.firstChild.data = this._text;
      return div.innerHTML;
    } else {
      return null;
    }
  },
  isError: function () {
    return this._isError;
  }
});
