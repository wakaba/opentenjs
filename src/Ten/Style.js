Ten.Style.insertStyleRules = function (css) {
  if (Ten.Browser.isIE) {
    var ss = document.createStyleSheet('about:blank');
    ss.cssText = css;
  } else {
    var style = document.createElement('style');
    style.textContent = css;
    Ten.AsyncLoader.insert(style);
  }
};
