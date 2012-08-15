Ten.JSON = new Ten.Class({
  parse: function (value) {
    try {
      if (self.JSON && JSON.parse) {
        return JSON.parse (value); // json2.js or ES3.1
      } else {
        return eval ('(' + value + ')');
      }
    } catch (e) {
      return {isError: true, errorMessage: (Ten.Browser.isIE ? e.message : ('' + e))};
    }
  },
  stringify: function (obj) {
    if (self.JSON && JSON.stringify) {
      return JSON.stringify(obj); // json2.js or ES3.1
    } else {
      return 'no JSON.stringify';
    }
  }
});
