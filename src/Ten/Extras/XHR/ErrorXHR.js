Ten.Extras.XHR.ErrorXHR = new Ten.Class ({
  initialize: function (e) {
    this.status = 400;
    this.statusText = e + '';
  }
}, {
  responseText: '',
  responseXML: null,

  getResponseHeader: function () {
    return null;
  }
});
