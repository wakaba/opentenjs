if (!Ten.TextArea) Ten.TextArea = {};

/* |ta| is either |textarea| or |input| whose |type| attribute is
   |text| or similar value. */
Ten.TextArea.insertText = function (ta, added) {
  if (document.all && !window.opera) {
    ta.focus();

    var start;
    var end;
    var range = document.selection.createRange();
    if (ta.tagName == 'TEXTAREA') {
      var clone = range.duplicate();
      clone.moveToElementText(ta);
      clone.setEndPoint('EndToEnd', range);
      start = clone.text.length - range.text.length;
      end = clone.text.length - range.text.length + range.text.length;
    } else {
      var taRange = ta.createTextRange();
      taRange.setEndPoint('EndToStart', range);
      start = taRange.text.length;

      taRange = ta.createTextRange();
      taRange.setEndPoint('EndToEnd', range);
      end = taRange.text.length;
    }

    ta.value = ta.value.substring(0, start) + added + ta.value.substring(end);
    ta.focus();
  } else if (window.opera && /Nintendo 3?DS/.test(navigator.userAgent)) {
    // DSi Browser does not preserve cursor position.
    ta.value += added;
  } else {
    var st = ta.scrollTop;
    var ss = ta.selectionStart;
    var se = (ss != ta.selectionEnd);
    ta.value = ta.value.substring (0, ta.selectionStart)
        + added + ta.value.substring (ta.selectionEnd);
    if (se) {
      ta.setSelectionRange (ss, ss + added.length);
    } else {
      ta.setSelectionRange (ss + added.length, ss + added.length);
    }
    ta.scrollTop = st;
    ta.focus ();
  }
}
