Ten.Array.find = function (arr, cond) {
  var code = (cond instanceof Function) ? cond : function (v) {
    return v == cond;
  };
  var arrL = arr.length;
  for (var i = 0; i < arrL; i++) {
    if (code(arr[i])) {
      return arr[i];
    }
  }
  return undefined; // not null
};

Ten.Array.forEach = function (arraylike, code) {
  var length = arraylike.length;
  for (var i = 0; i < length; i++) {
    var r = code(arraylike[i]);
    if (r && r.stop) return r.returnValue;
  }
  return null;
};
