
Ten.AsyncLoader.PageFragmentLoader.JSONData = new Ten.Class({
  initialize: function (json) {
    this.jsonObject = json;
  }
}, {
  getText: function (key) {
    if (key == 'body' && this.jsonObject[key] == null) {
      if (this.jsonObject.isError) {
        var div = document.createElement('div');
        div.innerHTML = 'xxx';
        div.firstChild.data = this.jsonObject.errorMessage;
        this.jsonObject[key] = '<div class=error-message>' + div.innerHTML + '</div>';
      }
    }
    return this.jsonObject[key];
  },

  isError: function () {
    return this.jsonObject.isError;
  }
});
