Ten.Form = new Ten.Class({
  createDataSetArray: function (form) {
    var params = [];

    var els = form.elements;
    var elsL = els.length;
    for (var n = 0; n < elsL; n++) {
      var el = form.elements[n];
      var name = el.name;
      var type = el.type;
      if (!name || el.disabled) {
        //
      } else if (type == 'checkbox' || type == 'radio') {
        if (el.checked) {
          params.push(name);
          params.push(el.value || 'on');
        }
      } else if (type == 'hidden' && name == '_charset_') {
        params.push(name);
        params.push('utf-8');
      } else if (type == 'submit' || type == 'image' || type == 'reset' ||
                 type == 'button' || type == 'output' || type == 'add' ||
                 type == 'remove' || type == 'move-up' || type == 'move-down') {
        //
      } else {
        params.push(name);
        params.push(el.value || '');
      }
    }

    return params;
  },

  arrayToPostData: function (params) {
    var q = '';
    while (params.length) {
      q += '&' + encodeURIComponent(params.shift());
      q += '=' + encodeURIComponent(params.shift() || '');
    }
    return q.substring(1);
  }
});
