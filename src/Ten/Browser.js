Ten.Browser.isIE6 = navigator.userAgent.indexOf('MSIE 6.') != -1;
Ten.Browser.isIE7 = navigator.userAgent.indexOf('MSIE 7.') != -1;
Ten.Browser.leIE7 = Ten.Browser.isIE6 || Ten.Browser.isIE7;
Ten.Browser.isDSi = navigator.userAgent.indexOf('Nintendo DSi') != -1;
Ten.Browser.is3DS = navigator.userAgent.indexOf('Nintendo 3DS') != -1;

Ten.Browser.noQuirks = document.compatMode == 'CSS1Compat';
