if (typeof(self.Hatena) == 'undefined') var Hatena = {};

Hatena.Emoji = new Ten.Class({
  charToImg: function (char, vCode) {
    if (!vCode) vCode = function () { return '' };

    var code;
    if (typeof(char) == 'number') {
      code = char;
    } else {
      code = char.charCodeAt(0);
      if (0xD800 <= code && code <= 0xDBFF) {
        var code2 = char.charCodeAt(1);
        code = (((Math.pow(2, 10) - 1) & code + 64) << 10) + ((Math.pow(2, 10) - 1) & code2);
      }
    }

    if (code <= 0xFFFF) {
      return '<img src="' + vCode(code) + '/U+' + code.toString(16).toUpperCase() + '.gif" alt="[emoji:n' + code.toString(16).toUpperCase().substring(2, 4) + ']" class="emoji emoji-ds">';
    } else if (code <= 0xFAFFF) { // U+FA7E0 = \uDBA9\uDFE0
      return '<img src="' + vCode(code) + '/U+' + code.toString(16).toUpperCase() + '.gif" alt="[emoji:h' + code.toString(16).toUpperCase().substring(3, 5) + ']" class="emoji emoji-hatena">';
    } else if (code <= 0xFFFFF) { // U+FE000 = \uDBB8\uDC00
      return '<img src="' + vCode(code) + '/e-' + code.toString(16).toUpperCase().substring(2, 5) + '.gif" alt="[emoji:' + code.toString(16).toUpperCase().substring(2, 5) + ']" class="emoji emoji-google">';
    } else {
      return null;
    }
  },

  textToEscapedString: function (s, vCode) {
    return s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (_) {
      var c1 = _.charCodeAt(0)
      var c2 = _.charCodeAt(1);
      var code = (((Math.pow(2, 10) - 1) & c1 + 64) << 10) + ((Math.pow(2, 10) - 1) & c2);
      
      if (0xFA000 <= code && code <= 0xFAFFF) { // U+FA7E0 = \uDBA9\uDFE0
        return '[emoji:h' + code.toString(16).toUpperCase().substring(3, 5) + ']';
      } else if (0xFE000 <= code && code <= 0xFFFFF) { // U+FE000 = \uDBB8\uDC00
        return '[emoji:' + code.toString(16).toUpperCase().substring(2, 5) + ']';
      } else {
        return _;
      }
    }).replace(/[\uE000-\uEFFF]/g, function (_) {
        return '[emoji:n' + _.charCodeAt(0).toString(16).toUpperCase().substring(2, 4) + ']';
    });
  },

  escapedStringToHTML: function (s, vCode) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\[emoji:([0-9A-F]{3})\]/g, function (_, c) {
          return Hatena.Emoji.charToImg(parseInt(c, 16) + 0xFE000, vCode);
        })
        .replace(/\[emoji:n([0-9A-F]{2})\]/g, function (_, c) {
          return Hatena.Emoji.charToImg(parseInt(c, 16) + 0xE000, vCode);
        })
        .replace(/\[emoji:h([0-9A-F]{2})\]/g, function (_, c) {
          return Hatena.Emoji.charToImg(parseInt(c, 16) + 0xFA700, vCode);
        });
  }
}, {

});
