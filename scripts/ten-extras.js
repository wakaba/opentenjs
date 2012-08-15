/* Not the original file!  Don't edit! */

Ten.Browser.isIE6 = navigator.userAgent.indexOf('MSIE 6.') != -1;
Ten.Browser.isIE7 = navigator.userAgent.indexOf('MSIE 7.') != -1;
Ten.Browser.leIE7 = Ten.Browser.isIE6 || Ten.Browser.isIE7;
Ten.Browser.isDSi = navigator.userAgent.indexOf('Nintendo DSi') != -1;
Ten.Browser.is3DS = navigator.userAgent.indexOf('Nintendo 3DS') != -1;

Ten.Browser.noQuirks = document.compatMode == 'CSS1Compat';
if (!Ten.Browser.CSS) Ten.Browser.CSS = {};
Ten.Browser.CSS.noFixed = Ten.Browser.isIE6 || (Ten.Browser.isIE && !Ten.Browser.noQuirks);
Ten.DOM.firstElementChild = function (node) {
  var el = node.firstElementChild || node.firstChild;
  while (el && el.nodeType != 1) {
    el = el.nextSibling;
  }
  return el;
};

/*
  structure = [
    {key: 'root', className: 'container', descendants: [
      {key: 'title', id: 'title'},
      {class: 'section', descendants: [
        {arrayKey: 'items', className: 'item-type1'},
        {arrayKey: 'items', className: 'item-type2'}
      ]}
    ]}
  ];

  return = {
    root: containerElement || undefined,
    title: titleElement || undefined,
    items: [
      itemType1Element1,
      itemType1Element2,
      itemTypr2Element1
    ] || undefined,
  };
*/
Ten.DOM.getElementsByStructure = function (root, structure) {
  var result = {};

  var currentNode = root;
  var nextOfRoot = root.nextSibling;

  var cands = [structure];
  var depth = 0;
  while (currentNode != null && currentNode != nextOfRoot) {
    var currentCands = cands[depth];

    var match = null;
    for (var i = 0; i < currentCands.length; i++) {
      match = currentCands[i];
      /* 注意! className ちゃんとみてないよ */
      if ((match.className != null && currentNode.className &&
              (currentNode.className.indexOf(match.className) > -1)) ||
          (match.id != null && match.id == currentNode.id)) {
        if (match.key) {
          result[match.key] = currentNode;
        } else if (match.arrayKey) {
          if (!result[match.arrayKey]) result[match.arrayKey] = [];
          result[match.arrayKey].push(currentNode);
        }
        break;
      }
      match = null;
    }
    
    if (currentNode.firstChild) {
      currentNode = currentNode.firstChild;
      depth++;
      cands[depth] = (match ? match.descendants : null) || cands[depth - 1];
    } else if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
    } else {
      currentNode = currentNode.parentNode;
      depth--;
      while (currentNode != null && currentNode != root) {
        if (currentNode.nextSibling) {
          currentNode = currentNode.nextSibling;
          break;
        } else {
          currentNode = currentNode.parentNode;
          depth--;
        }
      }
      if (depth < 0) break; // In IE and the source document is not a tree
      if (currentNode == root) break;
    }
  }

  return result;
};

Ten.DOM.getElementSetByClassNames = function (map, container) {
  var elements = {root: []};

  if (map.root) {
    if (map.root instanceof Array) {
      elements.root = map.root;
    } else {
      if (Ten.DOM.hasClassName(container, map.root)) {
        elements.root = [container];
      } else {
        elements.root = Ten.DOM.getElementsByClassName(map.root, container);
      }
    }
    delete map.root;
  }

  var root = elements.root[0] || container || document.body || document.documentElement || document;
  for (var n in map) {
    if (map[n] instanceof Array) {
      elements[n] = map[n];
    } else if (map[n]) {
      elements[n] = Ten.DOM.getElementsByClassName(map[n], root);
    }
  }

  return elements;
};

Ten.DOM.getAncestorByClassName = function (className, node) {
  while (node != null) {
    node = node.parentNode;
    if (Ten.DOM.hasClassName(node, className)) {
      return node;
    }
  }
  return null;
};
/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
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
if (!Ten.Extras) Ten.Extras = {};
Ten.Extras.XHR = new Ten.Class ({
  initialize: function (url, onsuccess, onerror) {
    try {
      this._xhr = new XMLHttpRequest ();
    } catch (e) {
      try {
        this._xhr = new ActiveXObject ('Msxml2.XMLHTTP');
      } catch (e) {
        try {
          this._xhr = new ActiveXObject ('Microsoft.XMLHTTP');
        } catch (e) {
          try {
            this._xhr = new ActiveXObject ('Msxml2.XMLHTTP.4.0');
          } catch (e) {
            this._xhr = null;
          }
        }
      }
    }

    this._url = url;
    this._onsuccess = onsuccess || function () { };
    this._onerror = onerror || function () { };
  }
}, {
  get: function () {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('GET', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.send (null);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  post: function (postCT, postData) {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('POST', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.setRequestHeader('Content-Type', postCT);
      this._xhr.send(postData);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  _onreadystatechange: function () {
    if (this._xhr.readyState == 4) {
      if (this.succeeded ()) {
        this._onsuccess.apply (this);
      } else {
        this._onerror.apply (this);
      }
    }
  },

  succeeded: function () {
    return (this._xhr.status >= 200 && this._xhr.status < 400);
  },

  getText: function () {
    try {
      return this._xhr.responseText;
    } catch (e) {
      return '';
    }
  },
  getDocument: function () {
    try {
      return this._xhr.responseXML;
    } catch (e) {
      return null;
    }
  },
  getJSON: function () {
    try {
      var text = this._xhr.responseText;
      return Ten.JSON.parse(text);
    } catch (e) {
      return null;
    }
  },

  getRequestURL: function () {
    var doc = this.getDocument ();
    if (doc) {
      return doc.documentURI || doc.URL;
    }
    return this._url; // might be wrong if redirected
  },

  getMediaTypeNoParam: function () {
    // XXX maybe we should apply HTML5 content sniffing algorithm, at
    // least for unspecified case

    var type = this.getHeaderFieldBody ('Content-Type') || 'text/plain';
    type = (type.split(/;/, 2)[0] || 'text/plain').replace (/\s+/g, '').toLowerCase ();
    return type;
  },

  getHeaderFieldBody: function (name) {
    return this._xhr.getResponseHeader (name);
  },

  getSimpleErrorInfo: function () {
    var r;
    try {
      r = this._xhr.status;
      r += ' ';
      r += this._xhr.statusText;
    } catch (e) { }
    return r;
  }

});
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
if (!Ten.Draggable) Ten.Draggable = {};
if (!Ten.Draggable.prototype) Ten.Draggable.prototype = {};

Ten.Draggable.prototype.startDrag = function (e) {
  if (e.targetIsFormElements()) return;

  var ep = NR.Element.getRects(this.element, window);
  var pos = {x: ep.marginBox.left, y: ep.marginBox.top};

  this.element.style.position = 'absolute';

  this.delta = Ten.Position.subtract(
    e.mousePosition(),
    // Ten.Geometry.getElementPosition(this.element)
    pos
  );
  this.handlers = [
    new Ten.Observer(document, 'onmousemove', this, 'drag'),
    new Ten.Observer(document, 'onmouseup', this, 'endDrag'),
    new Ten.Observer(this.element, 'onlosecapture', this, 'endDrag')
  ];
  e.stop();
};

(function () {
  var origEndDrag = Ten.Draggable.prototype.endDrag;
  Ten.Draggable.prototype.endDrag = function (ev) {
    origEndDrag.apply(this, arguments);

    // Used to emulate 'position: fixed'
    var el = this.element;
    if (el.ontenenddrag) {
      el.ontenenddrag.apply(this, [el]);
    }
  };
})();
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
Ten.Form.Placeholder = new Ten.Class({
    initialize: function (el) {
        if (Ten.Browser.isDSi || Ten.Browser.isWii) return;

        var self = this;
        this.element = el;

        // If @placeholder is natively supported:
        var tester = document.createElement(el.nodeName);
        if (typeof(tester.placeholder) != 'undefined') return;

        this.used = true;

        new Ten.Observer(el, 'onchange', this, 'disable');    
        new Ten.Observer(el, 'onfocus', this, 'hide');
        this.blurObserver = new Ten.Observer(el, 'onblur', this, 'show');

        // Prevent placeholder values from being cached
        if (Ten.Form.Placeholder.hasBfcache) {
            self._SetPageEvents();
        } else {
            self._OnBeforeunload = new Ten.Observer(window, 'onbeforeunload', this, 'hide');
            self._OnLoad = new Ten.Observer(window, 'onload', function () {
                self.show();
            });
            self._OnPageshow = new Ten.Observer(window, 'onpageshow', self, '_StopPageshow');
        }

        if (el.form) {
            new Ten.Observer(el.form, 'onsubmit', this, 'hide');
        }

        this.show();
    },

    isShowingPlaceholder: function (el) {
        return Ten.DOM.hasClassName(el, 'ten-placeholder');
    }
}, {
    _SetPageEvents: function () {
        new Ten.Observer(window, 'onpagehide', this, 'hide');
        new Ten.Observer(window, 'onpageshow', this, 'show');
    },
    _StopPageshow: function () {
      this._OnBeforeunload.stop();
      this._OnLoad.stop();
      this._SetPageEvents();
      this._OnPageshow.stop();
    },

    disable: function () {
        if (!this.used) return;
        if (this.element.value == '') {
            this.blurObserver.start();
        } else {
            this.blurObserver.stop();
        }
        Ten.DOM.removeClassName(this.element, 'ten-placeholder');
    },
    show: function () {
        if (this.shown()) return;

        if (this.element.value != '') return;
        if (document.activeElement == this.element) return;

        var ph = this.element.getAttribute('placeholder');
        if (ph == null) return;

        this.element.value = ph;
        Ten.DOM.addClassName(this.element, 'ten-placeholder');
    },
    hide: function () {
        if (!this.shown()) return;

        this.element.value = '';
        Ten.DOM.removeClassName(this.element, 'ten-placeholder');
    },
    shown: function () {
        return Ten.DOM.hasClassName(this.element, 'ten-placeholder');
    }
});

new Ten.Observer(window, 'onpageshow', function () {
    Ten.Form.Placeholder.hasBfcache = true;
});
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
if (!self.NR) self.NR = {};

if (!NR.index) NR.index = 0;

NR.resetIndex = function () {
  NR.index = 0;
}; // resetIndex


/* --- NR.Rect - Rectangle area --- */

/* Constructors */

NR.Rect = function (t, r, b, l, w, h) {
  if (t != null) {
    this.top = t;
    this.bottom = b != null ? b : t + h;
    this.height = h != null ? h : b - t;
  } else {
    this.bottom = b;
    this.top = b - h;
    this.height = h;
  }
  if (l != null) {
    this.left = l;
    this.right = r != null ? r : l + w;
    this.width = w != null ? w : r - l;
  } else {
    this.right = r;
    this.left = r - w;
    this.width = w;
  }
  this.index = NR.index++;
  this.label = null;
  this.invalid = isNaN (this.top + this.right + this.bottom + this.left + 0);
}; // Rect

NR.Rect.wh = function (w, h) {
  return new NR.Rect (0, null, null, 0, w, h);
}; // wh

NR.Rect.whCSS = function (el, w, h) {
  var px = NR.Element.getPixelWH (el, w, h);
  return NR.Rect.wh (px.width, px.height);
}; // whCSS

NR.Rect.trbl = function (t, r, b, l) {
  return new NR.Rect (t, r, b, l);
}; // trbl

NR.Rect.trblCSS = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return NR.Rect.trbl (lt.height, rb.width, rb.height, lt.width);
}; // trblCSS

NR.Rect.tlwh = function (t, l, w, h) {
  return new NR.Rect (t, null, null, l, w, h);
}; // tlwh

/* Box properties */

NR.Rect.prototype.isZeroRect = function () {
  return this.width == 0 && this.height == 0;
}; // isZeroRect

/* Box rendering properties */

NR.Rect.prototype.getRenderedLeft = function () {
  return this.left;
}; // getRenderedLeft

NR.Rect.prototype.getRenderedTop = function () {
  return this.top;
}; // getRenderedTop

NR.Rect.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Rect.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Rect.prototype.add = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top + arg.y, null, null, this.left + arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
    r = new this.constructor
        (this.top - Math.abs (arg.top),
         this.right + Math.abs (arg.right),
         this.bottom + Math.abs (arg.bottom),
         this.left - Math.abs (arg.left));
    r.prevOp = 'out-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // add

NR.Rect.prototype.subtract = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top - arg.y, null, null, this.left - arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
      r = new this.constructor
          (this.top + Math.abs (arg.top),
           this.right - Math.abs (arg.right),
           this.bottom - Math.abs (arg.bottom),
           this.left + Math.abs (arg.left));
      r.prevOp = 'in-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // subtract

NR.Rect.prototype.getTopLeft = function () {
  var o = new NR.Vector (this.left, this.top);
  o.prevOp = 'topleft';
  o.prev1 = this;
  o.invalid = this.invalid;
  o.label = this.label + ', top-left corner';
  return o;
}; // getTopLeft

/* Stringifications */

NR.Rect.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Rect.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r += "Invalid \n";
  }
  r += 'Top: ' + this.top + " \n";
  r += 'Right: ' + this.right + " \n";
  r += 'Bottom: ' + this.bottom + " \n";
  r += 'Left: ' + this.left + " \n";
  r += 'Width: ' + this.width + " \n";
  r += 'Height: ' + this.height + " \n";
  return r;
}; // toString

/* Invalid */

NR.Rect.invalid = new NR.Rect (0, 0, 0, 0);
NR.Rect.invalid.label = 'Invalid';
NR.Rect.invalid.invalid = true;


/* --- NR.Vector - Vector --- */

/* Constructor */

NR.Vector = function (x /* width */, y /* height */) {
  this.x = x;
  this.y = y;
  this.width = Math.abs (x);
  this.height = Math.abs (y);
  this.invalid = isNaN (x + y + 0);
  this.index = NR.index++;
  this.label = null;
}; // Vector

/* Box rendering properties */

NR.Vector.prototype.getRenderedLeft = function () {
  return this.x < 0 ? -this.width : 0;
}; // getRenderedLeft

NR.Vector.prototype.getRenderedTop = function () {
  return this.y < 0 ? -this.height : 0;
}; // getRenderedTop

NR.Vector.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Vector.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Vector.prototype.negate = function () {
  var r = new this.constructor (-this.x, -this.y);
  r.invalid = this.invalid;
  r.prevOp = 'negate';
  r.prev1 = this;
  r.label = this.label + ', negated';
  return r;
}; // negate

NR.Vector.prototype.add = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x + arg.x, this.y + arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'add-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Vector.prototype.subtract = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x - arg.x, this.y - arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'sub-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // subtract

/* Stringifications */

NR.Vector.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp === 'topleft' || this.prevOp === 'negate') {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ') ' +
        this.label;
  } else if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Vector.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += '(horizontal, vertical) = (x, y) = (';
  r += this.x + ', ';
  r += this.y + ') \n';
  return r;
}; // toString

/* Invalid */

NR.Vector.invalid = new NR.Vector (0, 0);
NR.Vector.invalid.label = 'Invalid';
NR.Vector.invalid.invalid = true;


/* --- NR.Band - Rectangle area with rectangle hole --- */

/* Constructors */

NR.Band = function (t, r, b, l) {
  this.top = t;
  this.right = r;
  this.bottom = b;
  this.left = l;
  this.invalid = isNaN (t + r + b + l + 0);
  this.index = NR.index++;
  this.label = null;
}; // Band

NR.Band.css = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return new NR.Band (lt.height, rb.width, rb.height, lt.width);
}; // css

/* Box rendering properties */

NR.Band.prototype.getRenderedLeft = function () {
  return -this.left;
}; // getRenderedLeft

NR.Band.prototype.getRenderedTop = function () {
  return -this.top;
}; // getRenderedTop

NR.Band.prototype.getRenderedWidth = function () {
  return this.left + this.right;
}; // getRenderedWidth

NR.Band.prototype.getRenderedHeight = function () {
  return this.top + this.bottom;
}; // getRenderedHeight

/* Operations */

NR.Band.prototype.getTopLeft = function () {
  var r = new NR.Vector (-this.left, -this.top);
  r.invalid = this.invalid;
  r.prevOp = 'topleft';
  r.prev1 = this;
  r.label = this.label + ', outside edge top-left corner, from inside edge';
  return r;
}; // getTopLeft

NR.Band.prototype.add = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (this.top + arg.top, this.right + arg.right,
       this.bottom + arg.bottom, this.left + arg.left);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'out-edge';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Band.prototype.and = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (arg.top != 0 ? this.top : 0, arg.right != 0 ? this.right : 0,
       arg.bottom != 0 ? this.bottom : 0, arg.left != 0 ? this.left : 0);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'and';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // and

/* Stringifications */

NR.Band.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Band.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += 'Top: ' + this.top + ' \n';
  r += 'Right: ' + this.right + ' \n';
  r += 'Bottom: ' + this.bottom + ' \n';
  r += 'Left: ' + this.left + ' \n';
  return r;
}; // toString

/* Invalid */

NR.Band.invalid = new NR.Band (0, 0, 0, 0);
NR.Band.invalid.label = 'Invalid';
NR.Band.invalid.invalid = true;


/* --- NR.Element --- */

if (!NR.Element) NR.Element = {};

NR.Element.getPixelWH = function (el, w, h) {
  var testEl = el.ownerDocument.createElement ('div');
  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.margin = 0;
  testEl.style.borderWidth = 0;
  testEl.style.padding = 0;
  var ws = 1;
  w = (w + '').replace (/^-/, function () { ws = -1; return '' });
  if (w == 'auto') w = 0;
  var hs = 1;
  h = (h + '').replace (/^-/, function () { hs = -1; return '' });
  if (h == 'auto') h = 0;
  try {
    // TODO: border-width: medium and so on
    testEl.style.left = w;
    testEl.style.top = h;
  } catch (e) {
  }

  var parentEl = el;
  while (parentEl) {
    try {
      parentEl.appendChild (testEl);
      break;
    } catch (e) { // if |el| is e.g. |img|
      parentEl = parentEl.parentNode || parentEl.ownerDocument.body;
    }
  }
  var px = {width: testEl.style.pixelLeft, height: testEl.style.pixelTop};
  px.width *= ws;
  px.height *= hs;

  var iw = testEl.offsetWidth;
  var ih = testEl.offsetHeight;
  if (w == 'thin' || w == 'medium' || w == 'thick') {
    testEl.style.borderLeft = 'solid black ' + w;
    px.width += testEl.offsetWidth - iw;
  }
  if (h == 'thin' || h == 'medium' || h == 'thick') {
    testEl.style.borderTop = h + ' solid black';
    px.height += testEl.offsetHeight - ih;
  }

  if (testEl.parentNode) testEl.parentNode.removeChild (testEl);
  return px;
}; // getPixelWH

NR.Element.getCumulativeOffsetRect = function (oel, view) {
  var el = oel;

  var en = new NR.Band (0, 0, 0, 0);
  en.label = 'Zero-width band';

  if (/WebKit/.test (navigator.userAgent)) {
    var docEl = el.ownerDocument.documentElement;
    var bodyEl = el.ownerDocument.body;

    /* This correction does not always work when margin collapse
       occurs - to take that effect into account, all children in the layout
       structure have to be checked. */

    if (docEl) {
      var rects = NR.Element.getBoxAreas (docEl, view);

      if (docEl == oel) {
        /* BUG: If viewport is not the root element, this should not be added. */
        en = rects.padding;
      } else if (bodyEl == oel) {
        en = rects.border.add (rects.margin);
        en.label = docEl.nodeName + ' margin + border';
        en = en.add (rects.padding);
        en.label = docEl.nodeName + ' margin + border + padding';
      } else {
        en = rects.padding.add (rects.border);
        en.label = docEl.nodeName + ' border + padding';
        en = en.and (rects.border);
        en.label = docEl.nodeName + ' border ? border + padding : 0';
      }
    }

    if (bodyEl) {
      var rects = NR.Element.getBoxAreas (bodyEl, view);
      
      if (bodyEl == oel) {
        en = en.add (rects.margin);
        en.label += ', with ' + bodyEl.nodeName + ' margin';
      } else {
        en = en.add (rects.border);
        en.label += ', with ' + bodyEl.nodeName + ' border';
      }
    }

    /* td:first-child's offsetTop might not be correct - no idea when this
       occurs and how to fix this. */
  }

  var origin = en.getTopLeft ().negate ();

  var offsetChain = [];
  while (el) {
    offsetChain.unshift (el);
    el = el.offsetParent;
  }

  while (offsetChain.length) {
    var el = offsetChain.shift ();

    var offset = new NR.Vector (el.offsetLeft, el.offsetTop);
    offset.label = el.nodeName + '.offset';

    origin = origin.add (offset);
    origin.label = el.nodeName + ' cumulative offset';
    
    el = el.offsetParent;
  }

  if (view.opera && /* Opera 9.52 */
      oel == oel.ownerDocument.body) {
    var cssRects = NR.Element.getBoxAreas (oel, view);
    origin = origin.add (cssRects.margin.getTopLeft ());
    origin.label = oel.nodeName + ' adjusted offset';
  }

  var offsetBox = NR.Rect.wh (oel.offsetWidth, oel.offsetHeight);
  offsetBox.label = oel.nodeName + ' offset box (width/height)';

  var rect = offsetBox.add (origin);
  rect.label = oel.nodeName + ' cumulative offset box';

  return rect;
}; // getCumulativeOffsetRect

NR.Element.getBoxAreas = function (el, view) {
  var rects = {};
  if (view.getComputedStyle) {
    var cs = view.getComputedStyle (el, null);
    rects.margin = new NR.Band (
      parseFloat (cs.marginTop.slice (0, -2)),
      parseFloat (cs.marginRight.slice (0, -2)),
      parseFloat (cs.marginBottom.slice (0, -2)),
      parseFloat (cs.marginLeft.slice (0, -2))
    );
    rects.border = new NR.Band (
      parseFloat (cs.borderTopWidth.slice (0, -2)),
      parseFloat (cs.borderRightWidth.slice (0, -2)),
      parseFloat (cs.borderBottomWidth.slice (0, -2)),
      parseFloat (cs.borderLeftWidth.slice (0, -2))
    );
    rects.padding = new NR.Band (
      parseFloat (cs.paddingTop.slice (0, -2)),
      parseFloat (cs.paddingRight.slice (0, -2)),
      parseFloat (cs.paddingBottom.slice (0, -2)),
      parseFloat (cs.paddingLeft.slice (0, -2))
    );
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else if (el.currentStyle) {
    var cs = el.currentStyle;
    rects.margin = NR.Band.css
        (el, cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft);
    var bs = [cs.borderTopStyle, cs.borderRightStyle,
              cs.borderBottomStyle, cs.borderLeftStyle];
    rects.border = NR.Band.css
        (el,
         bs[0] == 'none' ? 0 : cs.borderTopWidth,
         bs[1] == 'none' ? 0 : cs.borderRightWidth,
         bs[2] == 'none' ? 0 : cs.borderBottomWidth,
         bs[3] == 'none' ? 0 : cs.borderLeftWidth);
    rects.padding = NR.Band.css
        (el, cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft);
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else {
    rects.margin = NR.Band.invalid;
    rects.border = NR.Band.invalid;
    rects.padding = NR.Band.invalid;
  }
  return rects;
}; // getBoxAreas

NR.Element.getAttrRects = function (el) {
  var rects = {};

  /* See <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/offset%2A> for
     compatibility problems. */

  rects.offset = NR.Rect.tlwh
      (el.offsetTop, el.offsetLeft, el.offsetWidth, el.offsetHeight);
  rects.offset.label = el.nodeName + '.offset';

  rects.client = NR.Rect.tlwh
      (el.clientTop, el.clientLeft, el.clientWidth, el.clientHeight);
  rects.client.label = el.nodeName + '.client';

  rects.scrollableArea = NR.Rect.wh (el.scrollWidth, el.scrollHeight);
  rects.scrollableArea.label = el.nodeName + '.scroll (width, height)';

  rects.scrollState = new NR.Vector (el.scrollLeft, el.scrollTop);
  rects.scrollState.label = el.nodeName + '.scroll (left, top)';

  return rects;
}; // getAttrRects

NR.Element.getRects = function (el, view) {
  var rects = {};

  if (el.getBoundingClientRect) {
    var origin = NR.View.getViewportRects (view).boundingClientOrigin;

    var bb = el.getBoundingClientRect ();
    rects.boundingClient
        = NR.Rect.trbl (bb.top, bb.right, bb.bottom, bb.left);
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = rects.boundingClient.add (origin);
    rects.borderBox.label = el.nodeName + ' border edge';
  } else {
    rects.boundingClient = NR.Rect.invalid;
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = NR.Element.getCumulativeOffsetRect (el, view);
  }

  var elRects = NR.Element.getAttrRects (el);
  rects.offset = elRects.offset;
  rects.client = elRects.client;
  rects.scrollableArea = elRects.scrollableArea;
  rects.scrollState = elRects.scrollState;
  
  var cssRects = NR.Element.getBoxAreas (el, view);
  rects.margin = cssRects.margin;
  rects.border = cssRects.border;
  rects.padding = cssRects.padding;

  /* Wrong if |el| has multiple line boxes. */
  rects.marginBox = rects.borderBox.add (rects.margin);
  rects.marginBox.label = el.nodeName + ' margin edge';

  rects.clientAbs = rects.client.add (rects.borderBox.getTopLeft ());
  rects.clientAbs.label = el.nodeName + '.client (canvas origin)';

  if (rects.client.isZeroRect () ||
      (view.opera && (rects.client.width <= 0 || rects.client.height <= 0))) {
    // maybe inline or non-rendered element
    rects.paddingBox = rects.borderBox.subtract (rects.border);
    rects.paddingBox.label = el.nodeName + ' border edge - border';
  } else {
    rects.paddingBox = rects.clientAbs;
  }

  rects.contentBox = rects.paddingBox.subtract (rects.padding);
  rects.contentBox.label = el.nodeName + ' content box';

  return rects;
}; // getRects

NR.Element.getRectsExtra = function (el, view) {
  var rects = {};

  /* Gecko-only, deprecated */
  if (el.ownerDocument.getBoxObjectFor) {
    var bo = el.ownerDocument.getBoxObjectFor (el);
    rects.boxObject = NR.Rect.tlwh (bo.y, bo.x, bo.width, bo.height);
    rects.boxObjectScreen = new NR.Vector (bo.screenX, bo.screenY);
    rects.boxObject.label = el.nodeName + ' boxObject';
    rects.boxObjectScreen.label = el.nodeName + ' boxObject.screen';
  } else {
    rects.boxObject = NR.Rect.invalid;
    rects.boxObjectScreen = NR.Vector.invalid;
  }

  /* WinIE only */
  if (el.createTextRange) {
    var trs = NR.Range.getRectsExtra (el.createTextRange (), view);
    rects.textRangeBounding = trs.bounding;
    rects.textRangeBoundingClient = trs.boundingClient;
    rects.textRangeOffset = trs.offset;
  } else {
    rects.textRangeBounding = NR.Rect.invalid;
    rects.textRangeBoundingClient = NR.Rect.invalid;
    rects.textRangeOffset = NR.Rect.invalid;
  }

  /* Not supported by Gecko */
  if (el.style) {
    var css = el.style;

    rects.pos = new NR.Rect (css.posTop, css.posRight, css.posBottom, css.posLeft,
                             css.posWidth, css.posHeight); // Unit is not pixel.
    rects.pos.label = el.nodeName + '.style.pos';

    rects.px = new NR.Rect (css.pixelTop, css.pixelRight,
                            css.pixelBottom, css.pixelLeft,
                            css.pixelWidth, css.pixelHeight);
    rects.px.label = el.nodeName + '.style.pixel';
  } else {
    rects.pos = NR.Rect.invalid;
    rects.pixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko, WebKit, and WinIE */
  if (el.currentStyle) {
    var css = el.currentStyle;

    rects.currentPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.currentPos.label = el.nodeName + '.currentStyle.pos';

    rects.currentPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                   css.pixelBottom, css.pixelLeft,
                                   css.pixelWidth, css.pixelHeight);
    rects.currentPx.label = el.nodeName + '.currentStyle.pixel';
  } else {
    rects.currentPos = NR.Rect.invalid;
    rects.currentPixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko and WinIE */
  if (view.getComputedStyle) {
    var css = view.getComputedStyle (el, null);

    rects.computedPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.computedPos.label = el.nodeName + ' computedStyle.pos';

    rects.computedPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                    css.pixelBottom, css.pixelLeft,
                                    css.pixelWidth, css.pixelHeight);
    rects.computedPx.label = el.nodeName + ' computedStyle.pixel';
  } else {
    rects.computedPos = NR.Rect.invalid;
    rects.computedPixel = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra

// Don't use - these stuffs are not interoperable at all
NR.Element.getLineRects = function (el, view) {
  var rects = {};

  /* Not supportedby WebKit */
  rects.clients = [];
  if (el.getClientRects) {
    var crs = el.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  var doc = el.ownerDocument;

  var range;
  if (doc.createRange) {
    /* Gecko, WebKit, Opera */
    range = doc.createRange ();
    range.selectNodeContents (el);
  } else if (doc.body && doc.body.createTextRange) {
    /* WinIE only */
    range = doc.body.createTextRange ();
    range.moveToElementText (el);
  }
  var rr = NR.Range.getRectsExtra (range, view);
  rects.rangeClients = rr.clients;

  return rects;
}; // getLineRects



/* --- NR.Range --- */

if (!NR.Range) NR.Range = {};

// Don't use - these stuffs are not interoperable at all
NR.Range.getRectsExtra = function (range, view) {
  var rects = {};

  /* WinIE only */
  rects.bounding = NR.Rect.tlwh
      (range.boundingTop, range.boundingLeft,
       range.boundingWidth, range.boundingHeight);
  rects.bounding.label = 'Range.bounding';

  /* WinIE only */
  rects.offset = new NR.Vector (range.offsetLeft, range.offsetTop);
  rects.offset.label = 'Range.offset';

  /* WinIE only */
  rects.clients = [];
  if (range.getClientRects) {
    var crs = range.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  /* WinIE only */
  if (range.getBoundingClientRect) {
    var bc = range.getBoundingClientRect ();
    rects.boundingClient = NR.Rect.trbl (bc.top, bc.right, bc.bottom, bc.left);
    rects.boundingClient.label = 'Range.getBoundingClientRect';
  } else {
    rects.boundingClient = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra



/* --- NR.View --- */

if (!NR.View) NR.View = {};

NR.View.getBoundingClientRectOrigin = function (view, doc) {
  var parentEl = doc.body || doc.documentElement;
  var testEl = doc.createElement ('non-styled-element');

  if (!testEl.getBoundingClientRect) return NR.Vector.invalid;

  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.top = 0;
  testEl.style.left = 0;
  testEl.margin = 0;
  testEl.borderWidth = 0;
  testEl.padding = 0;
  parentEl.appendChild (testEl);

  var bc = testEl.getBoundingClientRect ();
  var origin = new NR.Vector (-bc.left, -bc.top);
  origin.label = 'Origin of getBoundingClientRect';

  parentEl.removeChild (testEl);

  return origin;
}; // getBoundingClientRectOrigin

NR.View.getViewportRects = function (view) {
  var doc = view.document;
  var docEl = doc.documentElement;
  var bodyEl = doc.body;

  var quirks = doc.compatMode != 'CSS1Compat';
  
  var rects = {};

  /* Not supported by WinIE */
  rects.windowPageOffset = new NR.Vector (view.pageXOffset, view.pageYOffset);
  rects.windowPageOffset.label = 'window.pageOffset';

  if (docEl) {
    var deRects = NR.Element.getAttrRects (docEl);
    rects.deOffset = deRects.offset;
    rects.deClient = deRects.client;
    rects.deScrollableArea = deRects.scrollableArea;
    rects.deScrollState = deRects.scrollState;
  } else {
    rects.deOffset = NR.Rect.invalid;
    rects.deClient = NR.Rect.invalid;
    rects.deScrollableArea = NR.Rect.invalid;
    rects.deScrollState = NR.Vector.invalid;
  }

  if (bodyEl) {
    var dbRects = NR.Element.getAttrRects (bodyEl);
    rects.bodyOffset = dbRects.offset;
    rects.bodyClient = dbRects.client;
    rects.bodyScrollableArea = dbRects.scrollableArea;
    rects.bodyScrollState = dbRects.scrollState;
  } else {
    rects.bodyOffset = NR.Rect.invalid;
    rects.bodyClient = NR.Rect.invalid;
    rects.bodyScrollState = NR.Rect.invalid;
    rects.bodyScrollableArea = NR.Vector.invalid;
  }

  if (document.all && !window.opera) {
    if (quirks) {
      rects.scrollState = rects.bodyScrollState;
    } else {
      rects.scrollState = rects.deScrollState;
    }
  } else {
    rects.scrollState = rects.windowPageOffset;
  }

  if (quirks) {
    rects.icb = rects.bodyClient;
    rects.icb = rects.icb.subtract (rects.icb.getTopLeft ()); // Safari
    /* This is not ICB in Firefox if the document is in the quirks mode
       and both |html| and |body| has scrollbars.  In such cases there
       is no way to obtain ICB (content edge), AFAICT. */

    if (document.all && !window.opera) {
      /*
          This returns wrong value if the author does not specify the border
          of the |body| element - default viewport border width is 2px, but
          |document.body.currentStyle.borderWidth|'s default is |medium|, which
          is interpreted as |4px| when it was specified by author.
      
      var docElRects = NR.Element.getBoxAreas (bodyEl, view);
      rects.boundingClientOrigin = docElRects.border.getTopLeft ();
      rects.boundingClientOrigin.label = 'Viewport border offset';
      */

      rects.boundingClientOrigin
          = NR.View.getBoundingClientRectOrigin (view, doc);
    }
  } else {
    if (document.all && !window.opera) {
      rects.icb = rects.deOffset;

      rects.boundingClientOrigin = rects.icb.subtract (rects.deClient.getTopLeft ());
      rects.boundingClientOrigin.label
          = rects.icb.label + ' - documentElement.client';

      rects.boundingClientOrigin = rects.boundingClientOrigin.getTopLeft ();
    } else {
      rects.icb = rects.deClient;
    }
  }

  /* Firefox's initial containing block is the padding box.  There is 
     no reliable way to detect the offset from the tl of canvas in Fx
     while returning zero in any other browsers AFAICT, sniffing Gecko by
     UA string. */
  if (navigator.userAgent.indexOf("Gecko/") >= 0) {
    var deBorder = rects.deOffset.getTopLeft ();
    deBorder.label = 'padding edge -> border edge of root element box';

    var debc = docEl.getBoundingClientRect ();
    debc = NR.Rect.trbl (debc.top, debc.right, debc.bottom, debc.left);
    debc.label = docEl.nodeName + ' boundingClientRect';

    var debcAbs = debc.add (rects.scrollState);
    debcAbs.label = debc.label + ', canvas origin';

    var deMargin = debcAbs.getTopLeft ();
    deMargin.label = 'margin edge -> border edge of root element box';

    rects.canvasOrigin = deBorder.add (deMargin.negate ());
    rects.canvasOrigin.label = 'Canvas origin';

    rects.icb = rects.icb.subtract (rects.canvasOrigin);
    rects.icb.label = 'ICB (origin: margin edge of root element box)';
  } else {
    rects.canvasOrigin = new NR.Vector (0, 0);
    rects.canvasOrigin.label = 'Canvas origin';
  }

  rects.contentBox = rects.icb.add (rects.scrollState);
  rects.contentBox.label = 'Viewport content box';

  if (rects.boundingClientOrigin) {
    if (document.all && !window.opera && quirks) {
      //
    } else {
      rects.boundingClientOrigin
          = rects.boundingClientOrigin.add (rects.scrollState);
      rects.boundingClientOrigin.label = 'Bounding client rect origin';
    }
  } else {
    rects.boundingClientOrigin = rects.scrollState;
  }

  rects.boundingClientOrigin
      = rects.boundingClientOrigin.add (rects.canvasOrigin);
  rects.boundingClientOrigin.label = 'Bounding client rect origin (canvas origin)';

  return rects;
}; // getViewportRects

NR.View.getViewportRectsExtra = function (view) {
  var rects = {};

  var doc = view.document;

  /* Fx, WebKit, Opera: entire viewport (including scrollbars),
     Not supported by WinIE */
  rects.windowInner = NR.Rect.wh (view.innerWidth, view.innerHeight);
  rects.windowInner.label = 'window.inner';

  /* Fx3, WebKit: Same as page offset; Not supported by Opera, WinIE */
  rects.windowScrollXY = new NR.Vector (view.scrollX, view.scrollY);
  rects.windowScrollXY.label = 'window.scroll (x, y)';

  /* Not supported by WebKit, Opera, WinIE */
  rects.windowScrollMax = new NR.Vector (view.scrollMaxX, view.scrollMaxY);
  rects.windowScrollMax.label = 'window.scrollMax';

  /* Not supported by Opera, WinIE */
  rects.document = NR.Rect.wh (doc.width, doc.height);
  rects.document.label = 'Document';

  return rects;
}; // getViewportRectsExtra

NR.View.getWindowRects = function (view) {
  var rects = {};

  /* Not supported by WinIE */
  rects.outer = NR.Rect.wh (view.outerWidth, view.outerHeight);
  rects.outer.label = 'window.outer';

  /* Opera: Wrong; Not supported by WinIE */
  rects.screenXY = new NR.Vector (view.screenX, view.screenY);
  rects.screenXY.label = 'window.screen (x, y)';

  /* Not supported by Fx3 */
  rects.screenTL = new NR.Vector (view.screenLeft, view.screenTop);
  rects.screenTL.label = 'window.screen (top, left)';

  return rects;
}; // getWindowRects

NR.View.getScreenRects = function (view) {
  var s = view.screen;

  var rects = {};
 
  /* top & left not supported by Opera, WinIE, WebKit */
  rects.device = NR.Rect.tlwh (s.top || 0, s.left || 0, s.width, s.height);
  rects.device.label = 'screen device';

  /* top & left not supported by Opera, WinIE */
  rects.avail = NR.Rect.tlwh
      (s.availTop || 0, s.availLeft || 0, s.availWidth, s.availHeight);
  rects.avail.label = 'screen.avail';

  return rects;
}; // getScreenRects

/* --- NR.Event --- */

if (!NR.Event) NR.Event = {};

NR.Event.getRects = function (ev, view, vpRects /* optional */) {
  var rects = {};

  rects.client = new NR.Vector (ev.clientX, ev.clientY);
  rects.client.label = 'event.client';

  /* Not supported by Gecko */
  rects.offset = new NR.Vector (ev.offsetX, ev.offsetY);
  rects.offset.label = 'event.offset';

  var vp = vpRects || NR.View.getViewportRects (view);

  rects.viewport = rects.client.add (vp.canvasOrigin);
  rects.viewport.label = 'event (viewport origin)';

  //rects.canvas = rects.page.add (vp.canvasOrigin);
  rects.canvas = rects.viewport.add (vp.scrollState);
  rects.canvas.label = 'event (canvas origin)';

  return rects;
}; // getRects

NR.Event.getRectsExtra = function (ev) {
  var rects = {};

  rects.screen = new NR.Vector (ev.screenX, ev.screenY);
  rects.screen.label = 'event.screen';

  /* Not supported by Gecko, WebKit, Opera, WinIE (was supported by NC4) */
  rects.wh = new NR.Vector (ev.width, ev.height);
  rects.wh.label = 'event.width, event.height';

  /* Not supported by WinIE */
  rects.page = new NR.Vector (ev.pageX, ev.pageY);
  rects.page.label = 'event.page';

  /* Not supported by Opera, WinIE */
  rects.layer = new NR.Vector (ev.layerX, ev.layerY);
  rects.layer.label = 'event.layer';

  /* Not supported by Gecko */
  rects.xy = new NR.Vector (ev.x, ev.y);
  rects.xy.label = 'event.x, event.y';

  return rects;
}; // getRectsExtra



if (self.NROnLoad) {
  NROnLoad ();
}

/* 

NR.js - Cross-browser wrapper for CSSOM View attributes

Documentation: <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/NodeRect%2Ejs>.

Author: Wakaba <w@suika.fam.cx>.

*/

/* ***** BEGIN LICENSE BLOCK *****
 * Copyright 2008-2009 Wakaba <w@suika.fam.cx>.  All rights reserved.
 *
 * This program is free software; you can redistribute it and/or 
 * modify it under the same terms as Perl itself.
 *
 * Alternatively, the contents of this file may be used 
 * under the following terms (the "MPL/GPL/LGPL"), 
 * in which case the provisions of the MPL/GPL/LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of the MPL/GPL/LGPL, and not to allow others to
 * use your version of this file under the terms of the Perl, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the MPL/GPL/LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the Perl or the MPL/GPL/LGPL.
 *
 * "MPL/GPL/LGPL":
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * <http://www.mozilla.org/MPL/>
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is NodeRect code.
 *
 * The Initial Developer of the Original Code is Wakaba.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Wakaba <w@suika.fam.cx>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
Ten.Box = new Ten.Class({
  placePopupBottom: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);

    var l = eb.borderBox.left;
    var t = eb.borderBox.bottom;

    var vp = NR.View.getViewportRects(window).contentBox;
    if (vp.right < l + el.offsetWidth) {
      l = vp.right - el.offsetWidth;
    }
    if (l < 0) l = 0;

    el.style.left = l + 'px';
    el.style.top  = t + 'px';
  },

  _copiedProps: [
      'fontFamily', 'fontSize', 'lineHeight',
      'borderTopStyle', 'borderTopColor', 'borderTopWidth',
      'borderRightStyle', 'borderRightColor', 'borderRightWidth',
      'borderBottomStyle', 'borderBottomColor', 'borderBottomWidth',
      'borderLeftStyle', 'borderLeftColor', 'borderLeftWidth', 'paddingTop',
      'paddingRight', 'paddingBottom', 'paddingLeft', 'backgroundImage',
      'backgroundColor', 'backgroundRepeat', 'backgroundAttachment',
      'backgroundPosition', 'backgroundPositionX', 'backgroundPositionY',
      'color', 'verticalAlign'
  ],
  placePopupOverlayWithStyles: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);
    var box = Ten.Browser.leIE7 ? eb.contentBox : eb.borderBox;

    el.style.left = eb.borderBox.left + 'px';
    el.style.top = eb.borderBox.top + 'px';
    el.style.width = box.width + 'px';
    el.style.height = box.height + 'px';

    var props = this._copiedProps;
    for (var i in props) {
      var p = props[i];
      try {
        el.style[p] = Ten.Style.getElementStyle(refEl, p);
      } catch (e) { }
    }
  },

  /*
    Depending on the browser in use and at which phase in the process
    of the element creation, insertion, and rendering, coordinate values
    could be zero, negative, or NaN.  You might want to invoke this
    method in Ten.AsyncLoader.tryToExecute wrapper, that is why this
    method returns a boolean value.
  */
  placePopupBottomRight: function (el, refEl) {
    var l = 0;
    var t = 0;

    var eb = NR.Element.getRects(el, window);
    if (eb.contentBox.width <= 0) {
      return false;
    }

    var vp = NR.View.getViewportRects(window).contentBox;
    if (refEl) {
      var reb = NR.Element.getRects(refEl, window);
      l = reb.marginBox.right - eb.marginBox.width;
      t = reb.borderBox.top - eb.marginBox.height;
    } else {
      l = vp.right - eb.marginBox.width;
      t = vp.bottom - eb.marginBox.height;
    }

    if (isNaN(l) || isNaN(t)) {
      return false;
    }

    if (l < 0) l = 0;
    if (t < 0) t = 0;

    this.setPositionFixed(el, l, t);

    return true;
  },

  setPositionFixed: function (el, l, t) {
    // Don't use CSS's 'position: fixed' because Ten.Dragger does
    // not support it.
    //if (Ten.Browser.CSS.noFixed) {
      var vp = NR.View.getViewportRects(window);
      el.tenOriginalLeft = l - vp.scrollState.x;
      el.tenOriginalTop = t - vp.scrollState.y;
      el.style.position = 'absolute';
      var code = function () {
        var vp = NR.View.getViewportRects(window);
        el.style.left = (el.tenOriginalLeft + vp.scrollState.x) + 'px';
        el.style.top = (el.tenOriginalTop + vp.scrollState.y) + 'px';
      };
      code();
      new Ten.Observer(window, 'onscroll', code);
      el.ontenenddrag = function (el) {
        var ep = NR.Element.getRects(el, window);
        var t = ep.marginBox.top;
        var l = ep.marginBox.left;
        var vp = NR.View.getViewportRects(window);
        el.tenOriginalLeft = l - vp.scrollState.x;
        el.tenOriginalTop = t - vp.scrollState.y;
      };
    /*} else {
      el.style.position = 'fixed';
      el.style.left = l + 'px';
      el.style.top = t + 'px';
    }*/
  }
});
/*
// require Ten.js
*/

/* Ten.Resizable */
Ten.Resizable = new Ten.Class({
    initialize: function(window) {
        this.window = window;
        if (Ten.Selector.getElementsBySelector('span.toggle-button', this.window).length == 0) {
            this.setupToggleButton();
        }
        if (Ten.Selector.getElementsBySelector('span.resize-button', this.window).length == 0) {
            this.setupResizeButton();
        }
    }
}, {
    setupToggleButton: function() {
        this.toggleButton = new Ten.Element('span', {className: 'toggle-button'},
                                            new Ten.Element('img', {src: 'http://ugomemo.hatena.ne.jp/images/maximize.gif'}));
        Ten.Style.applyStyle(this.toggleButton, this.toggleButtonStyle);
        this.window.appendChild(this.toggleButton);
        new Ten.Observer(this.toggleButton, 'onclick', this, 'toggleMaximum');
    },
    setupResizeButton: function() {
        this.resizeButton = new Ten.Element('span', {className: 'resize-button'},
                                            new Ten.Element('img', {src: 'http://ugomemo.hatena.ne.jp/images/resize.gif'}));
        Ten.Style.applyStyle(this.resizeButton, this.resizeButtonStyle);
        this.window.appendChild(this.resizeButton);
        new Ten.Observer(this.resizeButton, 'onmousedown', this, 'startResize');
        this.handlers = [];
    },
    setAsMaximum: function() {
        this.maximum = true;
        Ten.Selector.getElementsBySelector('img', this.toggleButton)[0].src = 'http://ugomemo.hatena.ne.jp/images/normalize.gif';
    },
    setAsNormal: function() {
        this.maximum = false;
        Ten.Selector.getElementsBySelector('img', this.toggleButton)[0].src = 'http://ugomemo.hatena.ne.jp/images/maximize.gif';
    },
    toggleMaximum: function() {
        if (this.maximum) {
            this.normalize();
        } else {
            this.maximize();
        }
    },
    maximize: function() {
        this.normalStyle = {left: Ten.Style.getElementStyle(this.window, 'left'),
                            top: Ten.Style.getElementStyle(this.window, 'top'),
                            width: Ten.Style.getElementStyle(this.window, 'width'),
                            height: Ten.Style.getElementStyle(this.window, 'height')};
        Ten.Style.applyStyle(this.window, this.maximumStyle());
        this.setAsMaximum();
    },
    normalize: function() {
        Ten.Style.applyStyle(this.window, this.normalStyle);
        this.setAsNormal();
    },
    startResize: function(e) {
        if (e.targetIsFormElements()) return;
        this.delta = Ten.Position.subtract(
            Ten.Geometry.getElementPosition(this.window),
            Ten.Position.subtract(e.mousePosition(),Ten.Geometry.getElementPosition(this.resizeButton))
        );
        this.handlers = [
            new Ten.Observer(document, 'onmousemove', this, 'resize'),
            new Ten.Observer(document, 'onmouseup', this, 'endResize'),
            new Ten.Observer(this.resizeButton, 'onlosecapture', this, 'endResize')
        ];
        e.stop();
        this.setAsNormal();
    },
    resize: function(e) {
        var pos = Ten.Position.subtract(e.mousePosition(), this.delta);
        var newSize = {
            width: pos.x + 'px',
            height: pos.y + 'px'
        };
        Ten.Style.applyStyle(this.window, newSize);
        if (this.innerElement) {
            var newHeight = pos.y;
            if (this.rejectElement) {
                newHeight -= this.rejectElement.clientHeight;
            }
            newSize = {height: newHeight + 'px'};
            Ten.Style.applyStyle(this.innerElement, newSize);
        }
        e.stop();
    },
    endResize: function(e) {
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i].stop();
        }
        if(e) e.stop();
    },
    toggleButtonStyle: {
        position: 'absolute',
        top: '8px',
        right: '26px',
        cursor: 'pointer'
    },
    resizeButtonStyle: {
        position: 'absolute',
        bottom: '0px',
        right: '4px',
        cursor: 'nw-resize'
    },
    toggleButton: null,
    maximum: false,
    normalStyle: {},
    maximumStyle: function() {
        var scroll = Ten.Geometry.getScroll();
        return {
            left: scroll.x + 'px',
            top:  scroll.y + 'px',
            width: '100%',
            height: '100%'
        };
    }
});
if (!Ten.Widget) Ten.Widget = {};
Ten.Widget.OptionButtons = new Ten.Class({
  initialize: function (elements, onbeforechange, onchange, allowBlank) {
    this.elements = elements;
    this.onbeforechange = onbeforechange;
    this.onchange = onchange;
    this.allowBlank = allowBlank;

    var self = this;
    for (var i = 0; i < elements.length; i++) {
      new Ten.Observer(elements[i], 'onmousedown', (function (j) {
        return function (ev) { self._onChangeEvent(j); ev.stop() };
      })(i));
    }
  }
},{
  // selectedIndex: undefined/null/0..
  _onChangeEvent: function (index) {
    var selected = this.selectedIndex;
    if (selected === undefined) {
      selected = null;
      for (var i = 0; i < this.elements.length; i++) {
        if (this.elements[i].getAttribute('src', 2) == this.elements[i].getAttribute('data-on-src')) {
          selected = i;
          this.selectedIndex = i;
          break;
        }
      }
    }

    var self = this;
    var el = this.elements[index];
    if (selected == index) {
      if (this.allowBlank) {
        el.setAttribute('src', el.getAttribute('data-off-src'));
        this.selectedIndex = null;
        self.onbeforechange(el, false);
        self._callForDSi(function () { self.onchange(el, false) });
      }
    } else if (selected == null) {
      el.setAttribute('src', el.getAttribute('data-on-src'));
      this.selectedIndex = index;
      self.onbeforechange(el, true);
      self._callForDSi(function () { self.onchange(el, true) });
    } else {
      var oldEl = this.elements[selected];
      oldEl.setAttribute('src', oldEl.getAttribute('data-off-src'));
      el.setAttribute('src', el.getAttribute('data-on-src'));
      self.onbeforechange(el, true);
      this.selectedIndex = index;
      self._callForDSi(function () {
        self.onchange(oldEl, false);
        self.onchange(el, true);
      });
    }
  },

  _callForDSi:
    window.opera && /Nintendo DS/.test(navigator.userAgent)
      ? function (func) { var self = this; setTimeout(function () { func.call(self) }, 300) }
      : function (func) { func.call(this) },

  selectByIndex: function (i) {
    this._onChangeEvent(i);
  }
});
/*
  button: Dropdown button
  ref: Reference element used to place the panel (default: same as button)
  panel: Dropdown panel
  
  @data-panel-close-button on an element within the panel: Clicking
  the element will close the panel.

  @data-panel-align = left/right on the button: Controls how the panel
  is aligned with the reference element.
*/
Ten.Widget.DropDown = new Ten.Class({
  initialize: function (ancestor, structure) {
    var self = this;
    if (!ancestor) return; // for inheriting

    self.elements = Ten.DOM.getElementsByStructure(ancestor, structure);

    self.initEvents();
    self.setPanelPosition();
  }
}, {
  initEvents: function () {
    var self = this;
    new Ten.Observer(self.elements.button, 'onmousedown', function (ev) {
      self.toggle();
      ev.stop();
    });
    new Ten.Observer(self.elements.button, 'onclick', function (ev) {
      self.show();
      ev.stop();
    });
    new Ten.Observer(document.body, 'onmousedown', function (ev) {
      self.hide();
    });
  },
  preparePanel: function () {
    var self = this;
    if (self.panelPrepared) return;
    self.panelPrepared = true;
    new Ten.Observer(self.elements.panel, 'onmousedown', function (ev) {
      if (ev.target.getAttribute('data-panel-close-button') != null) {
        self.hide();
      }
      ev.stop();
    });
    new Ten.Observer(window, 'onresize', self, 'setPanelPosition');
  },
  setPanelPosition: function () {
    var panel = this.elements.panel;
    var align = this.elements.button.getAttribute('data-panel-align');

    var ref = this.elements.ref || this.elements.button;

    var ep = NR.Element.getRects(ref, window);

    panel.style.top = ep.borderBox.bottom + 'px';
    if (align == 'right') {
      panel.style.right = Ten.Geometry.getWindowSize().w - ep.borderBox.right + 'px';
    } else { // left
      panel.style.left = ep.borderBox.left + 'px';
    }
  },

  shown: false,
  toggle: function () {
    if (this.shown) {
      this.hide();
    } else {
      this.show();
    }
  },
  show: function () {
    if (this.shown) return;
    this.preparePanel();
    this.setPanelPosition();
    this.elements.button.className += ' ten-open';
    this.elements.panel.className
        = this.elements.panel.className.replace(/\bten-hidden\b/g, '');
    this.shown = true;
  },
  hide: function () {
    if (!this.shown) return;
    this.elements.button.className
        = this.elements.button.className.replace(/\bten-open\b/g, '');
    this.elements.panel.className += ' ten-hidden';
    this.shown = false;
  }
});
Ten.Widget.DropDown.FrameMenu = function () {
  return this.init.apply(this, arguments);
};

Ten.Widget.DropDown.FrameMenu.prototype = new Ten.Widget.DropDown;

Ten.Widget.DropDown.FrameMenu.prototype.init = function (el) {
  this.elements = {
    button: el,
    ref: el
  };
  var selector = this.elements.button.getAttribute('data-ref-selector');
  if (selector && this.elements.button.querySelector) {
    this.elements.ref = this.elements.button.querySelector(selector) || el;
  }

  this.initEvents();
};

Ten.Widget.DropDown.FrameMenu.prototype.preparePanel = function () {
  if (this.panelPrepared) return;
  this.panelPrepared = true;
  var panel = document.createElement('iframe');
  panel.frameBorder = 0;
  panel.className = 'ten-hidden ten-framemenu-iframe';
  panel.src = this.elements.button.getAttribute('data-menu-url');
  panel.setAttribute('allowtransparency', 'true');
  panel.setAttribute('data-keep-current-height', '');
  this.elements.ref.parentNode.appendChild(panel);
  this.elements.panel = panel;
  new Ten.Widget.Frame.Listener(panel);
};

Ten.Widget.DropDown.FrameMenu.setup = function (ancestor) {
  var els = Ten.DOM.getElementsByClassName('ten-has-framemenu', ancestor);
  var elsL = els.length;
  for (var i = 0; i < elsL; i++) {
    new Ten.Widget.DropDown.FrameMenu(els[i]);
  }
};
Ten.Widget.ItemList = function () { this.init.apply(this, arguments) };

Ten.Widget.ItemList.prototype = {
    init: function (ul) {
      var self = this;
      this.element = ul;
      this.clear();

      new Ten.Observer(ul, 'onclick', function (ev) {
        var target = ev.target;
        var selected = false;
        while (target) {
          if (target.tenItemListIndex != null) {
            selected = true;
            if (target.tenItemListIndex != self.focusIndex) {
              self.removeFocus();
              self.focusIndex = target.tenItemListIndex;
              self.showFocus();
              break;
            }
          }
          target = target.parentNode;
        }
        if (selected) {
          self.dispatchEvent('select', self.items[self.focusIndex]);
        }
      });
      new Ten.Observer(ul, 'onmouseover', function (ev) {
        var target = ev.target;
        while (target) {
          if (target.tenItemListIndex != null &&
              target.tenItemListIndex != self.focusIndex) {
            self.removeFocus();
            self.focusIndex = target.tenItemListIndex;
            self.showFocus();
            break;
          }
          target = target.parentNode;
        }
      });
    },

    appendItem: function (cb) {
      var div = document.createElement('div');
      div.innerHTML = this.element.getAttribute('data-template') || '';
      var li = div.getElementsByTagName('li')[0];
      li.tenItemListIndex = this.items.length;
      cb.apply(this, [li]);
      this.element.appendChild(li);
      this.items.push(li);
    },
    clear: function () {
      this.element.innerHTML = '';
      this.focusIndex = null;
      this.items = [];
    },

    focusUp: function () {
      if (this.focusIndex == null) {
        if (this.items.length) this.focusIndex = this.items.length - 1;
      } else {
        this.removeFocus();
        this.focusIndex--;
        if (this.focusIndex < 0) {
          this.focusIndex = this.items.length - 1;
        }
      }
      this.showFocus();
    },
    focusDown: function () {
      if (this.focusIndex == null) {
        if (this.items.length) this.focusIndex = 0;
      } else {
        this.removeFocus();
        this.focusIndex++;
        if (this.focusIndex >= this.items.length) {
          this.focusIndex = 0;
        }
      }
      this.showFocus();
    },
    setFocusByIndex: function (index) {
      if (index == null || index < 0 || index >= this.items.length) {
        this.removeFocus();
        return;
      } else {
        if (this.focusIndex != index) {
          this.removeFocus();
          this.focusIndex = index;
          this.showFocus();
        }
      }
    },

    showFocus: function () {
      if (this.focusIndex != null) {
        Ten.DOM.addClassName(this.items[this.focusIndex], 'ten-focused');
      }
    },
    removeFocus: function () {
      if (this.focusIndex != null) {
        Ten.DOM.removeClassName(this.items[this.focusIndex], 'ten-focused');
      }
    },

  selectFocusedItem: function () {
    if (this.focusIndex != null) {
      this.dispatchEvent('select', this.items[this.focusIndex]);
      return true;
    } else {
      return false;
    }
  }
};
Ten.EventDispatcher.implementEventDispatcher(Ten.Widget.ItemList.prototype);
Ten.Widget.Frame = function () { this.init() };
Ten.Widget.Frame.iframeMap = {};

Ten.Widget.Frame.prototype = {
  init: function () {
    this.m = Ten.XDMessenger.createForParent('*', /.*/);
    this.document = document;
  },
  initDimensionChangeListener: function () {
    if (!window.postMessage || !window.JSON) return;

    var iframeMap = Ten.Widget.Frame.iframeMap;
    var distributeKey = function (root) {
      var iframes = Ten.querySelectorAll('iframe', root);
      for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        if (!iframe.iframeHeightchangeKey) {
          iframe.iframeHeightchangeKey = Math.random();
          iframeMap[iframe.iframeHeightchangeKey] = iframe;
        }
        iframe.contentWindow.postMessage(JSON.stringify({
          type: 'TenXDMessengerSetKey',
          key: iframe.iframeHeightchangeKey
        }), '*');
      }
    };

    TL.compat.observe(window, 'message', function (ev) {
      try {
        var data = JSON.parse(ev.data);
        if (data.type == 'heightchange') {
          if (data.key) {
            var iframe = iframeMap[data.key];
            if (iframe) {
              if (data.value && /^(?:[0-9]+px|0)$/.test(iframe.style.height)) {
                if (parseInt(iframe.style.height) < data.value ||
                    !iframe.hasAttribute('data-keep-current-height')) {
                  iframe.style.height = data.value + 'px';
                }
              } else {
                if (data.value) {
                  iframe.style.height = data.value + 'px';
                }
              }
            }
          } else {
            distributeKey(document.documentElement);
          }
        }
      } catch (e) {
          if (window.console) console.log(e);
      }
    });

    Ten.AsyncLoader.executeWhenFragmentLoadedOrNow(function (root) {
      distributeKey(root);
    });
  },
  notifyDimensionChangeIfEnabled: function () {
    if (document.documentElement.getAttribute('data-ten-notify-dimension-change')) {
      this.notifyDimensionChange();
    }
  },
  notifyDimensionChange: function () {
    if (!window.postMessage || !window.JSON) return;

    var notifyHeightchange = function () {
      var height1 = document.body.offsetHeight;
      var height2 = document.documentElement.offsetHeight;
      var height = height1 > height2 ? height1 : height2;
      parent.postMessage(JSON.stringify({
        type: 'heightchange',
        key: Ten.Widget.Frame.iframeKey,
        value: height
      }), '*');
      //if (window.console) console.log(Ten.Widget.Frame.iframeKey + ': heightchange');
    };
    notifyHeightchange();

    TL.compat.observe(window, 'message', function (ev) {
      try {
        var data = JSON.parse(ev.data);
        if (data.type == 'TenXDMessengerSetKey') {
          if (Ten.Widget.Frame.iframeKey != data.key) {
            Ten.Widget.Frame.iframeKey = data.key;
            Ten.Widget.Frame.iframeKeyOrigin = ev.origin;
            notifyHeightchange();
          }
        } else if (data.type == 'requestheight') {
          notifyHeightchange();
        }
      } catch (e) {
        if (window.console) console.log(e);
      }
    });

    return;

    var self = this;
    self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
    Ten.AsyncLoader.executeAfterLoad(function () {
      self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
      setTimeout(function () {
        self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
        setTimeout(function () {
          self.m.send('heightChanged', self.document.body.offsetHeight || self.document.documentElement.offsetHeight);
        }, 1000);
      }, 1000);
    });
  }
};

Ten.Widget.Frame.Listener = function (iframe) {
  this.init(iframe);
};

Ten.Widget.Frame.Listener.prototype = {
  init: function (iframe) {
    this.m = Ten.XDMessenger.createForFrame(iframe, iframe.src);
    if (!this.m) return;
    this.m.addEventListener('heightChanged', function (value) {
      iframe.style.height = value + 'px';
    });
  }
};
if (!Ten.Storage) Ten.Storage = {};
Ten.Storage.Local = new Ten.Class({
  initialize: function () {
    if (self.localStorage) {
      this.localStorage = self.localStorage;
    } else if (self.globalStorage) {
      this.localStorage = self.globalStorage[document.domain];
    } else {
      return new Ten.Cookie();
    }
  }
}, {
  get: function (key) {
    return this.localStorage[key];
  },
  set: function (key, value) {
    return this.localStorage[key] = value;
  }
});
(function () {

var type;
var log = function (m) {
        if (window.console && console.log) {
                console.log([type, m]);
        }
};

var Messenger = function () { this.init.apply(this, arguments) };
Messenger.createForParent = function (origin /* for postMessage variant */, safeOriginPattern) {
        if (window.parent == window) return null;
        var iframe = document.createElement('iframe');
        var opts   = window.name.split('|', 2);
        var key    = opts[0];
        var url    = opts[1];
        document.body.appendChild(iframe);
        var output = iframe.contentWindow;
        output.name = key;
        iframe.width = 1;
        iframe.height = 1;
        iframe.setAttribute('style', 'height:1px;width:1px;visibility:hidden;');
        output.location.replace(url);
        return new this({
                key : key,
                url : url,
                input : window,
                output : output,
                safeOriginPattern: safeOriginPattern || /(?!)/
        });
};
Messenger.SIGNATURE = 'MZ';
Messenger.createForFrame = function (frame, url) {
        var output = frame.contentWindow;
        // 2821109907456 = 36 ** 8
        var key    = Messenger.SIGNATURE + Math.floor(Math.random() * 2821109907456 + 2821109907456).toString(36).substring(1) + '@';
        var empty  = this.findEmptyResource();
        if (!empty) return null;
        output.name  = key + '|' + empty;
        output.location.replace(url);
        return new this({
                key : key,
                url : url,
                input : function () { return frame.contentWindow[0] },
                output : output
        });
};
Messenger.findEmptyResource = function () {
        if (Messenger.emptyResourceURL) {
            return Messenger.emptyResourceURL;
        }

        var origin = location.protocol + '//' + location.host;
        var imgs = document.getElementsByTagName('img');
        for (var i = 0, it; it = imgs[i]; i++) {
                if (it.src.indexOf(origin) == 0) return it.src;
        }

/*
        var links = document.getElementsByTagName('link');
        for (var i = 0, it; it = links[i]; i++) {
                if (it.rel == 'stylesheet' || it.rel == 'alternate stylesheet' || it.rel == 'shortcut icon' || it.rel == 'icon') {
                        if (it.href.indexOf(origin) == 0) return it.href;
                }
        }
*/
        
        return null;
};
Messenger.absolute = function (url) {
        var img = new Image();
        img.src = url;
        var ret = img.src;
        img.src = '';
        delete img;
        return ret;
};
Messenger.prototype = {
        transportType: 'hash',

        init : function (opts) {
                var self = this;
                self._eventListeners     = {};
                self.key = opts.key;
                self.url = opts.url;
                self.input = typeof(opts.input) == 'function' ? opts.input : function () { return opts.input };
                self.output = typeof(opts.output) == 'function' ? opts.output : function () { return opts.output };
                /** read buffer */
                self.buffer = [];
                /** received msg sequence id */
                self.ack   = 0;
                /** write queue */
                self.queue = [];
                /** sent messages */
                self.sent  = [];
                /** sent msg sequence id */
                self.msgid = 0;
                self.regexp = new RegExp('^(' + Messenger.SIGNATURE + '[A-Za-z0-9]{8}@)([A-Za-z0-9]{4})([A-Za-z0-9]{4})([A-Za-z0-9]{2})(.+)');
                self.safeOriginPattern = opts.safeOriginPattern;
                self.hasSafeOrigin = self.safeOriginPattern
                    ? self.safeOriginPattern.test(self.url) : false;
                self.setupTimer();
        },

        stop : function () {
                //
        },

        send : function (type, obj) {
                var self = this;

                if (typeof data === 'undefined') data = null;
                var body = encodeURIComponent(Ten.JSON.stringify({
                        type : type,
                        data : obj
                }));

                /*
                 * Data Structure
                 * message : '#' + header (20bytes) + data (rest)
                 * header  : key (11bytes) + msgid (4bytes) + ack (4bytes) + msg rest (2byte)
                 * key     : 'XX' + random (8bytes) + '@'
                 */

                var dataLimit = 2083 - (this.url.length) - 22;
                var sequence  = [];
                while (body.length) {
                        sequence.push(body.substring(0, dataLimit));
                        body = body.substring(dataLimit);
                }

                var msglen = sequence.length;
                for (var i = 0, data; data = sequence[i]; i++) {
                        var msgseq = i.toString(36);
                        self.queue.push({
                                msgid   : self.msgid++,
                                msgrest : msglen - i - 1,
                                data    : data
                        });
                }

                self.exhaust();
        },

        setupTimer : function () {
                var self = this;
                if (self.timer) return;
                self.timer = setInterval(function () {
                        var data;
                        try {
                                var input  = self.input();
                                data = input.location.hash.substring(1);
                                if (!data || data == '_') return;
                                var base  = input.location.protocol + '//' + input.location.host + input.location.pathname + input.location.search;
                                input.location.replace(base + '#_');
                        } catch (e) { return }

                        var match = data.match(self.regexp);
                        if (!match) return;

                        var message = {
                                key      : match[1],
                                msgidraw : match[2],
                                msgid    : parseInt(match[2], 36),
                                ack      : parseInt(match[3], 36),
                                msgrest  : parseInt(match[4], 36),
                                data     : match[5]
                        };

                        for (var i = 0, it; it = self.sent[i]; i++) {
                                if (it.msgid < message.ack) self.sent.splice(i--, 1);
                        }

                        for (var i = 0, it; it = self.queue[i]; i++) {
                                if (it.msgid < message.ack) self.queue.splice(i--, 1);
                        }

                        log(['ack', self.ack + '=' + message.msgid, message.data == 'ACK', message.ack, self.sent]);

                        if (message.data == 'ACK') return;

                        if (self.ack != message.msgid) return;

                        self.ack = message.msgid + 1;

                        // log(['recv', message]);

                        self.buffer.push(message);

                        if (message.msgrest != 0) return;

                        var data = '';
                        for (var i = 0, it; it = self.buffer[i]; i++) {
                                data += it.data;
                        }
                        self.buffer = [];

                        var obj = Ten.JSON.parse(decodeURIComponent(data));

                        if (!self.queue.length) {
                                self.queue.push({
                                        msgid   : 0,
                                        msgrest : 0,
                                        data    : 'ACK'
                                });
                                self.exhaust();
                        }

                        self.dispatchEvent(obj.type, obj.data);
                }, 10);
        },

        exhaust : function () {
                var self = this;
                if (!self.queue.length) return;

                var now  = new Date().getTime();
                if (now < self.lastSent + 50) {
                        setTimeout(function () {
                                self.exhaust();
                        }, 50);
                        return;
                }

                var message = self.queue.shift();
                var ack     = (self.ack % 1679616 + 1679616).toString(36).substring(1);
                var msgid   = (message.msgid % 1679616 + 1679616).toString(36).substring(1);
                var msgrest = (message.msgrest % 1296 + 1296).toString(36).substring(1);

                log(['send', message]);
                var url = self.url + '#' + self.key + msgid + ack + msgrest + message.data;
                self.output().location.replace(url);
                self.lastSent = new Date().getTime();
                if (message.data != 'ACK') self.sent.push(message);

                clearTimeout(self.ackTimer);
                self.ackTimer = setTimeout(function () {
                        if (self.sent.length) {
                                self.queue = self.sent.concat(self.queue).sort(function (a, b) {
                                        return a.msgid - b.msgid;
                                });
                                log(['resend', self.queue]);
                                self.sent  = [];
                                setTimeout(function () {
                                        self.exhaust();
                                }, Math.random() * 200);
                        }
                }, 500);

                setTimeout(function () {
                        self.exhaust();
                }, 50);
        },

        hasEventListener: function (type) {
                return !!(this._eventListeners[type] instanceof Array && this._eventListeners[type].length);
        },

        addEventListener: function (type, listener) {
                if (!listener) return;
                if (!this.hasEventListener(type)) {
                        this._eventListeners[type] = [];
                }
                var listeners = this._eventListeners[type];
                for (var i = 0, it; it = listeners[i]; i++) {
                        if (listener == it) {
                                return;
                        }
                }
                listeners.push(listener);
        },

        removeEventListener: function (type, listener) {
                if (this.hasEventListener(type)) {
                        var listeners = this._eventListeners[type];
                        for (var i = 0, it; it = listeners[i]; i++) {
                                if (listener == it) {
                                        listeners.splice(i, 1);
                                        return;
                                }
                        }
                }
        },

        dispatchEvent: function (type, opt) {
                if (!this.hasEventListener(type)) return false;
                var listeners = this._eventListeners[type];
                for (var i = 0, it; it = listeners[i]; i++) {
                        it.call(this, opt);
                }
                return true; // preventDefault is not implemented
        }
};

if (window.postMessage && !window.tenNoPostMessage && window.addEventListener) {
  Messenger.createForParent = function (origin, safeOriginPattern) {
    var self = new this({
      postTo: parent,
      postToOrigin: origin || '*',
      safeOriginPattern: safeOriginPattern || /(?!)/,
      watch: window
    });
    return self;
  };
  Messenger.createForFrame = function (frame, url) {
    frame.src = url;
    var m = url.match(/^(https?:\/\/[^\/]+)/);
    var origin = m[1];
    var key = Messenger.SIGNATURE + Math.floor(Math.random() * 2821109907456 + 2821109907456).toString(36).substring(1) + '@';
    var self = new this({
      postTo: frame.contentWindow,
      postToOrigin: origin,
      watch: window
    });
    self.setKey(key);
    self.frame = frame;
    self.setKeyInterval = window.setInterval(function () {
      self.setKey(key);
    });
    self.frameonloadhandler = function () {
      self.setKey(self.key);
      clearInterval(self.setKeyInterval);
    };
    frame.addEventListener('load', self.frameonloadhandler, false);
    return self;
  };
  Messenger.prototype.channelType = 'postMessage';
  Messenger.prototype.init = function (opts) {
    var self = this;
    self._eventListeners     = {};
    this.postTo = opts.postTo;
    this.postToOrigin = opts.postToOrigin;
    this.safeOriginPattern = opts.safeOriginPattern;
    this.key = opts.key;
    var code = function (ev) {
      var data = Ten.JSON.parse(ev.data);

      // Pairing
      if (data.type == 'TenXDMessengerSetKey') {
        if (!self.key) {
          self.key = data.data;
        }
      } else if (data.type == 'TenXDMessengerRequestKey') {
        if (self.key) {
          self.send('TenXDMessengerSetKey', self.key);
        }
        return;
      }
      if (!self.key || !data.key || self.key != data.key) {
        return;
      }

      // Origin
      if (self.postToOrigin == ev.origin || self.postToOrigin == '*') {
        self.hasSafeOrigin = self.safeOriginPattern
            ? self.safeOriginPattern.test(ev.origin) : false;
        if (self.hasSafeOrigin && self.postToOrigin == '*') {
          var m = ev.origin.match(/^(https?:\/\/[^/]+)/);
          self.postToOrigin = m[1];
        }
      } else {
        return;
      }

      self.dispatchEvent(data.type, data.data);
    };
    window.addEventListener('message', code, false);
  };
  Messenger.prototype.setKey = function (key) {
    this.key = key;
    this.send('TenXDMessengerSetKey', key);
  };
  Messenger.prototype.requestKey = function () {
    if (this.key) return;
    this.send('TenXDMessengerRequestKey');
  };
  Messenger.prototype.stop = function () {
    if (this.frameonloadhandler) {
      this.frame.removeEventListener('load', this.frameonloadhandler, false);
    }
  };
  Messenger.prototype.send = function (type, obj) {
    var data = {key: this.key, type: type, data: obj};
    log([data, this.postTo, this.postToOrigin]);
    this.postTo.postMessage(Ten.JSON.stringify(data), this.postToOrigin);
  };
}

Ten.XDMessenger = Messenger;

})();Ten.Array.find = function (arr, cond) {
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
Ten.AsyncLoader = new Ten.Class({

  /* ------ Asynchronous communication ------ */

  loadScripts: function (urls, onload) {
    var number = urls.length;
    var counter = 0;
    var check = function () {
      if (counter == number && onload) {
        onload();
      }
    };
    Ten.Array.forEach(urls, function (url) {
      /* XXX
      if (/\.css(?:\?|$)/.test(url)) {
        SAMI.Style.loadStyle(url, function () {
          counter++;
          check();
        });
        return;
      }
      */

      var script = document.createElement('script');
      script.src = url;
      script.charset = 'utf-8';
      script.onload = function () {
        counter++;
        check();
        script.onload = null;
        script.onreadystatechange = null;
      };
      if (Ten.Browser.isIE) {
        script.onreadystatechange = function () {
          if (!event.srcElement) return;
          if (script.readyState != 'complete' && script.readyState != 'loaded') {
            return;
          }
          counter++;
          check();
          script.onload = null;
          script.onreadystatechange = null;
        };
        Ten.AsyncLoader.insert(script);
      } else {
        (document.body || document.documentElement).appendChild(script);
      }
    });
  },

  _callbackCode: {},
  callJSONP: function (url, code, paramName) {
    paramName = paramName || 'callback';

    var key = 'k' + (Math.random() + '').replace(/\./, '');

    this._callbackCode[key] = function (result) {
      code(result);
      delete Ten.AsyncLoader._callbackCode[key];
    };

    if (/\?/.test(url)) {
      url += '&' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    } else {
      url += '?' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    }
    Ten.AsyncLoader.loadScripts([url], function () { });
  },

  /* ------ Asynchronous Fragment Loading Protocol ------ */

  pageFragmentLoader: function (urlOrForm, additionalParams) {
    return new Ten.AsyncLoader.PageFragmentLoader(urlOrForm, additionalParams);
  },
  asyncizeLinks: function (linkClassName, containers, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var links = Ten.DOM.getElementsByClassName(linkClassName, root);
      for (var i = 0; i < links.length; i++) (function (link) {
        var url = link.href;
        var useHash = !link.getAttribute('ten-async-no-fragment');
        new Ten.Observer(link, 'onclick', function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(url);
          pf.openURLOnError = true;
          if (useHash) {
            pf.setLoadStartEnd(null, function () {
              // XXX
              var query = this.url.replace(/\#.*/, '').split(/\?/, 2)[1] || '';
              query = query.replace(/^\?/, '').split(/[&;]/);
              var newQuery = ['async=' + linkClassName];
              for (var i = 0; i < query.length; i++) {
                var q = query[i];
                if (!/^(?:locale\..*|only)=/.test(q)) newQuery.push(q);
              }
              newQuery = newQuery.join('&');
              // XXX use location.hash = xxx when onhashchange is available
              location.replace('#' + newQuery);
            });
          }
          pf.addElements(containers).start();
          if (code) {
            code.apply(pf, []);
          }
          ev.stop();
        });
      })(links[i])
    });

    this.setFragmentQueryParamHandler(linkClassName, function (params) {
      var url = location.pathname + '?' + params.join('&');
      var pf = this.pageFragmentLoader(url).addElements(containers);
      pf.openURLOnError = true;
      pf.start();
    });
  },
  asyncize: function (map, additionalParams, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var subtrees = Ten.DOM.getElementSetByClassNames({
        root: map.root || map.target
      }, root).root;
      for (var i = 0; i < subtrees.length; i++) (function (subtree) {
        var origRoot = map.root;
        var origTarget = map.target;
        var sRoot;
        if (origRoot) {
          map.root = [subtree];
          sRoot = subtree;
        } else {
          map.target = [subtree];
          sRoot = null; // Intentionally ignores /root/ here
        }
        var elements = Ten.DOM.getElementSetByClassNames(map, sRoot);
        map.root = origRoot;
        map.target = origTarget;

        var targetEl = elements.target[0];
        var targetType = targetEl.nodeName.toLowerCase();
        var eventType = 'onclick';
        if (targetType == 'form') {
          eventType = 'onsubmit';
        } else if (targetType == 'noscript') {
          eventType = 'now';
        }
        var onEvent = function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(targetEl, additionalParams);
          pf.elements = elements;
          pf.openURLOnError = !map.errors;
          if (eventType == 'now') pf.noIndicator = true;
          if (code) {
            code.apply(pf, []);
          }
          pf.start();
          if (ev) ev.stop();
        };
        if (eventType == 'now') {
          onEvent();
        } else {
          new Ten.Observer(targetEl, eventType, onEvent);
        }
      })(subtrees[i])
    });
  },

  /* ------ Asynchronous DOM manipulations ------ */

  insert: function (el) {
    if (Ten.Browser.isIE && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
      });
    } else {
      (document.body || document.documentElement.lastChild || document.documentElement || document).appendChild(el);
    }
  },
  insertToBody: function (el, onload) {
    if (Ten.Browser.isIE6 && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
        if (onload) {
          onload();
        }
      });
    } else if (document.body) {
      document.body.appendChild(el);
      if (onload) {
        onload();
      }
    } else {
      Ten.AsyncLoader.tryToExecute(function () {
        if (!document.body) return false;

        document.body.appendChild(el);
        if (onload) {
          onload();
        }
        return true;
      });
    }
  },

  /* ------ Asynchronous executions ------ */

  tryToExecute: function (code) {
    if (!code()) {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },
  tryToExecuteReformatting: function (code) {
    if (code()) {
      new Ten.Observer(window, 'onresize', code);
    } else {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },

  _registeredObjects: {},
  _pendingCodes: {},
  registerObject: function (key, value) {
    this._registeredObjects[key] = value;
    Ten.Array.forEach(this._pendingCodes[key] || [], function (code) {
      code(value);
    });
  },
  executeWithObject: function (key, code) {
    var obj = this._registeredObjects[key];
    if (obj) {
      code(obj);
    } else {
      if (!this._pendingCodes[key]) this._pendingCodes[key] = [];
      this._pendingCodes[key].push(code);
    }
  },

  /* ------ On-load processings ------ */

  _OnFragmentLoadedCodes: [],
  _OnFragmentLoaded: function (fragmentRoot) {
    var fr = fragmentRoot.getAttribute('data-ten-fragment-root');
    if (fr) {
      fragmentRoot = Ten.DOM.getAncestorByClassName(fr, fragmentRoot) || fragmentRoot;
    }

    var codes = this._OnFragmentLoadedCodes;
    for (var i = 0; i < codes.length; i++) {
      codes[i](fragmentRoot);
    }
  },
  executeWhenFragmentLoaded: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    this.executeAfterDOMContentLoaded(function () {
      code(document.body);
    });
  },
  executeWhenFragmentLoadedOrNow: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    if (Ten.Browser.isIE || !document.body) {
      this.executeAfterDOMContentLoaded(function () {
        code(document.body);
      });
    } else {
      code(document.body);
    }
  },

  _OnDOMContentLoadedCodes: [],
  _OnDOMContentLoaded: function () {
    while (this._OnDOMContentLoadedCodes.length) {
      var code = this._OnDOMContentLoadedCodes.shift();
      code();
    }
  },

  _OnLoadCodes: [],
  _OnLoad: function () {
    this._OnDOMContentLoaded();
    while (this._OnLoadCodes.length) {
      var code = this._OnLoadCodes.shift();
      code();
    }
  },

  _OnPageshowCodes: [],
  _OnPageshow: function () {
    this._OnLoad();
    while (this._OnPageshowCodes.length) {
      var code = this._OnPageshowCodes.shift();
      code();
    }
  },

  executeAfterDOMContentLoaded: function (code) {
    if (this.isDOMContentLoadedFired) {
      code();
    } else {
      this._OnDOMContentLoadedCodes.push(code);
    }
  },
  executeAfterLoad: function (code) {
    if (this.isLoadFired) {
      code();
    } else {
      this._OnLoadCodes.push(code);
    }
  },

  /* ------ Onhashchange processings ------ */

  _fragmentQueryParamHandler: {},
  //_onLoadFragmentProcessAdded: false,
  setFragmentQueryParamHandler: function (key, code) {
    this._fragmentQueryParamHandler[key] = code;

    if (this._onLoadFragmentProcessAdded) return;
    var self = this;
    // XXX もっとはやいタイミングで実行するべき?
    this.executeAfterDOMContentLoaded(function () {
      self._processFragment();
    });
    this._onLoadFragmentProcessAdded = true;
  },

  // XXX onhashchange support

  _processFragment: function () {
    var key;
    var newParams = [];
    var params = (location.hash || '').replace(/^\#/, '').split(/[&;]/);
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (/^async=/.test(param)) {
        key = decodeURIComponent(param.substring(6));
      } else {
        newParams.push(param);
      }
    }
    if (!key) return;
    var qph = this._fragmentQueryParamHandler[key];
    if (qph) qph.apply(this, [newParams]);
  }
});

new Ten.Observer(Ten.DOM, 'DOMContentLoaded', function () {
  Ten.AsyncLoader.isDOMContentLoadedFired = true;
  Ten.AsyncLoader._OnDOMContentLoaded();
});
new Ten.Observer(window, 'onload', function () {
  Ten.AsyncLoader.isLoadFired = true;
  Ten.AsyncLoader._OnLoad();
});
new Ten.Observer(window, 'onpageshow', function () {
  Ten.AsyncLoader.isPageshowFired = true;
  Ten.AsyncLoader._OnPageshow();
});
Ten.AsyncLoader.PageFragmentLoader = new Ten.Class({
  initialize: function (urlOrForm, additionalParams) {
    var nodeName = urlOrForm.nodeName;
    if (nodeName) {
      nodeName = nodeName.toLowerCase();
      if (nodeName == 'form') {
        this._initWithForm(urlOrForm, additionalParams);
      } else if (nodeName == 'noscript') {
        this._initWithURL(urlOrForm.getAttribute('data-src'));
      } else {
        this._initWithURL(urlOrForm);
      }
    } else {
      this._initWithURL(urlOrForm);
    }
    this.elements = {};
    this._loadStart = [];
    this._loadEnd = [];
  }
}, {
  _initWithURL: function (url) {
    this._onErrorURL = url;
    if (/\?/.test(url)) {
      url = url.replace(/\bonly=body\b/g, '').replace(/&&+/g, '&'); // XXX
      this._onErrorURL = url;
      url += '&only=body';
    } else {
      url += '?only=body';
    }
    if (Hatena.Locale) {
      if (!/local.hatena/.test(location.hostname)) { // XXX server.pl encoding workaround
        url = Hatena.Locale.urlWithLangAndRegion(url);
      }
    }
    this.url = url;
  },
  _initWithForm: function (form, additionalParams) {
    this._form = form;
    this._additionalParams = additionalParams || {};
    this._onErrorURL = location.href;
  },

  method: 'get',
  indicatorKey: 'global',
  //openURLOnError
  //noIndicator

  addElements: function (map) {
    var newElements = Ten.DOM.getElementSetByClassNames(map);
    for (var n in newElements) {
      this.elements[n] = newElements[n];
    }
    return this;
  },

  setLoadStartEnd: function (loadStart, loadEnd) {
    if (loadStart) this._loadStart.push(loadStart);
    if (loadEnd) this._loadEnd.push(loadEnd);
    return this;
  },

  start: function (code) {
    var self = this;
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.start(this.indicatorKey);
    for (var c in this._loadStart) {
      this._loadStart[c].apply(this, []);
    }

    var url;
    var method;
    var postCT;
    var postData;
    if (this._form) {
      url = this._form.action;
      method = this._form.method.toLowerCase();

      var params = Ten.Form.createDataSetArray(this._form);

      params.push('locale.lang');
      params.push(Hatena.Locale.getTextLang());

      params.push('locale.region');
      params.push(Hatena.Locale.getRegionCode());

      params.push('only');
      params.push('body');

      for (var n in this._additionalParams) {
        params.push(n);
        params.push(this._additionalParams[n]);
      }

      postCT = 'application/x-www-form-urlencoded';
      postData = Ten.Form.arrayToPostData(params);
    } else {
      url = self.url;
      method = this.method;
    }

    var xhr = new Ten.Extras.XHR(url, function () {
      self._onload(this, code);
    }, function () {
      self._onload(this, code);
    });
    if (method == 'post') {
      xhr.post(postCT, postData);
    } else {
      xhr.get();
    }
  },
  _onload: function (xhr, code) {
    var imt = xhr.getMediaTypeNoParam();
    var data;
    if (imt == 'application/json') {
      data = new Ten.AsyncLoader.PageFragmentLoader.JSONData(Ten.JSON.parse(xhr.getText()));
    } else {
      var text = xhr.getText();
      if (text == '' && !xhr.succeeded()) {
        data = new Ten.AsyncLoader.PageFragmentLoader.HTTPData(xhr);
      } else {
        data = new Ten.AsyncLoader.PageFragmentLoader.TextData(text);
      }
    }
    this.data = data;

    var dataIsError = data.isError();
    if (this.openURLOnError && dataIsError) {
      location.href = this._onErrorURL;
      return;
    }

    for (var n in this.elements) {
      if (n == 'root' || n == 'target') continue;
      var value = data.getText(n);
      if (value == null && n != 'errors') continue;
      var els = this.elements[n];
      if (!els) continue;
      if (n == 'errors') {
        if (dataIsError) {
          if (value instanceof Array) {
            var container = document.createElement('div');
            container.className = 'error-message';
            for (var i = 0; i < value.length; i++) {
              var msg = document.createElement('p');
              msg.innerHTML = 'aaa';
              msg.firstChild.data = value[i];
              container.appendChild(msg);
            }
            value = container;
          }
        } else {
          if (!value && Hatena.Locale) {
            var msgid = els[0] ? els[0].getAttribute('data-ok-msgid') : '';
            if (msgid && msgid.length) {
              var msg = document.createElement('div');
              msg.className = 'ok-message';
              msg.innerHTML = 'aaa';
              msg.firstChild.data = Hatena.Locale.text(msgid);
              value = msg;
            }
          }
        }
      }
      for (var i in els) {
        var el = els[i];
        var op = el.getAttribute('data-ten-async-operation');
        if (op == 'insertBefore' || op == 'replaceChild') {
          var parent = el.parentNode;
          if (value.nodeType) {
            parent.insertBefore(value, el);
            Ten.AsyncLoader._OnFragmentLoaded(value);
          } else {
            var div = document.createElement('div');
            div.innerHTML = value;
            var selectors = el.getAttribute('data-ten-async-selectors');
            if (selectors) {
              var nodes = Ten.querySelectorAll(selectors, div);
              for (var i = 0; i < nodes.length; i++) {
                parent.insertBefore(nodes[i], el);
                Ten.AsyncLoader._OnFragmentLoaded(nodes[i]);
              }
            } else {
              while (div.firstChild) {
                var node = div.firstChild;
                parent.insertBefore(node, el);
                if (node.nodeType == 1 /* ELEMENT_NODE */) {
                  Ten.AsyncLoader._OnFragmentLoaded(node);
                }
              }
            }
          }
          if (op == 'replaceChild') parent.removeChild(el);
        } else {
          if (value.nodeType) {
            el.innerHTML = '';
            el.appendChild(value);
          } else {
            el.innerHTML = value;
          }
          Ten.AsyncLoader._OnFragmentLoaded(el);
        }
      }
    }

    if (code) code.apply(this, []);
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.stop(this.indicatorKey);
    for (var c in this._loadEnd) {
      this._loadEnd[c].apply(this, []);
    }
  }
});
Ten.AsyncLoader.PageFragmentLoader.TextData = new Ten.Class({
  initialize: function (s) {
    this._text = s;
  }
}, {
  getText: function (key) {
    if (key == 'body') {
      return this._text;
    } else {
      return null;
    }
  },

  isError: function () {
    return false; // XXX
  }
});

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
Ten.AsyncLoader.Indicator = new Ten.Class({
  _indicator: {},
  _count: {},

  getIndicatorElement: function (key) {
    key = key || 'global';
    if (!this._indicator[key]) {
      this._indicator[key] = document.getElementById('global-indicator');
    }
    return this._indicator[key];
  },
  setIndicatorElement: function (key, el) {
    this._indicator[key] = el;
  },

  start: function (key) {
    key = key || 'global';
    this._count[key]++;
    if (!(this._count[key] > 0)) this._count[key] = 1;
    var el = this.getIndicatorElement(key);
    el.className = el.className.replace(/\bten-hidden\b/g, '');
  },
  stop: function (key) {
    key = key || 'global';
    this._count[key]--;
    if (!(this._count[key] > 0)) {
      var el = this.getIndicatorElement(key);
      el.className += ' ten-hidden';
    }
  }
});
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
function NotificationArea (element, opts) {
  this.element = element;
  this.options = opts || {};
  var self = this;
  this.element.onclick = function () {
    self.onclick();
    return false;
  };
}

NotificationArea.prototype = {
  showElement: function () {
    this.element.style.display = 'block';
    this.element.style.visibility = 'visible';
    this.isShown = true;
    if (this.current && this.current.onshown) {
      this.current.onshown.apply(this);
    }
  },
  showElementLater: function () {
    if (this.showElementTimer) clearTimeout(this.showElementTimer);
    var self = this;
    this.showElementTimer = setTimeout(function () {
      self.showElement();
    }, 1000);
  },
  hideElement: function (opts) {
    if (this.hasNextInfo() || (opts && opts.hasNext)) {
      this.element.style.visibility = 'hidden';
    } else {
      this.element.style.display = 'none';
    }
    this.isShown = false;
    if (this.showElementTimer) clearTimeout(this.showElementTimer);
    if (this.current && this.current.onhidden) {
      this.current.onhidden.apply(this);
    }
  },

  setText: function (text, opts) {
    this.element.innerText = text;
    this.element.textContent = text;
    this.element.href = opts.href || '';
    this.current = opts;
  },
  registerText: function (text, opts) {
    this.setText(text, opts);
    if (opts.showNow) {
      this.showElement();
    } else {
      this.showElementLater();
    }
  },

  setStatus: function (text, onclick) {
    var opts = {
      isStatus: true,
      onclick: onclick,
      id: Math.random()
    };
    if (this.isShown) {
      this.hideElement({hasNext: true});
      this.registerText(text, opts);
    } else {
      opts.showNow = true;
      this.registerText(text, opts);
    }
    return opts.id;
  },
  addInfo: function (text, onclick) {
    var opts = {
      isStatus: false,
      onclick: onclick instanceof Function ? onclick : function () {
          location.href = onclick;
      },
      href: onclick instanceof Function ? null : onclick,
      id: Math.random()
    };
    this.infoData = this.infoData || [];
    this.infoData.unshift([text, opts]);
    if (this.current && this.current.isStatus) {
      //
    } else {
      this.prepareNextText();
    }
    return opts.id;
  },
  prepareNextText: function () {
    if (this.infoData && this.infoData.length) {
      var data = this.infoData[0];
      this.registerText(data[0], data[1]);
    }
  },
  deleteById: function (id) {
    if (this.current && this.current.id == id) {
      this.closeText();
      return;
    }
    
    var data = this.infoData;
    for (var i = 0; i < data.length; i++) {
      if (data[i].id == id) {
        data.splice(i, 0);
        return;
      }
    }
  },
  closeText: function () {
    this.hideElement();
    if (this.current && !this.current.isStatus && this.infoData) {
      this.infoData.shift();
    }
    delete this.current;
    this.prepareNextText();
  },
  hasNextInfo: function() {
    return this.infoData && this.infoData.length;
  },
  onclick: function () {
    if (this.current.onclick) {
      this.current.onclick.apply(this);
    }
    this.closeText();
  }
};

var TL = function () {
  this.entryList = new TL.EntryList;
  this.entryList.MAX_ENTRIES = this.MAX_ENTRIES;
  this.newEntryList = new TL.EntryList;
  this.newEntryList.MAX_ENTRIES = this.MAX_NEW_ENTRIES;
  this.newEntryList.isNewEntryList = true;
  this.entryListByEID = {};

  var self = this;
  var setELBE = function (entryList) {
    return function (ev) {
      var list = ev.newEntries;
      for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        if (entry.eid) {
          self.entryListByEID[entry.eid] = entryList;
        }
      }
    };
  };
  var delELBE = function (ev) {
    var list = ev.oldEntries;
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      if (entry.eid) {
        delete self.entryListByEID[entry.eid];
      }
    }
  };
  TL.compat.observe(this.entryList, 'entriesappended', setELBE(this.entryList));
  TL.compat.observe(this.entryList, 'entriesprepended', setELBE(this.entryList));
  TL.compat.observe(this.entryList, 'entriesdiscarded', delELBE);
  TL.compat.observe(this.newEntryList, 'entriesappended', setELBE(this.newEntryList));
  TL.compat.observe(this.newEntryList, 'entriesprepended', setELBE(this.newEntryList));
  TL.compat.observe(this.newEntryList, 'entriesdiscarded', delELBE);
  TL.compat.observe(this.newEntryList, 'entriesdiscarded', function (ev) {
    if (ev.startOffset != 0) {
      self.checkNewEntries = false;
      self.dispatchEvent(new TL.Event('reloadmode'));
      self.isReloadMode = true;
    }
  });
  setTimeout(function () {
    self.checkNewEntries = false;
    self.dispatchEvent(new TL.Event('reloadmode'));
    self.isReloadMode = true;
  }, this.PAGE_MAX_AGE);
};

TL.compat = {
  addElementClass: function (el, className) {
    el.className += ' ' + className;
  },
  deleteElementClass: function (el, className) {
    el.className = el.className.replace(new RegExp('\\s*\\b' + className + '\\b\\s*', 'g'), ' ');
  },

  isInDocument: function (el) {
    while (el) {
      if (el.nodeType == 9 /* DOCUMENT_NODE */) {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  },

  show: function (el) {
    this.deleteElementClass(el, 'tl-hidden');
  },
  hide: function (el) {
    this.addElementClass(el, 'tl-hidden');
  },

  querySelector: function (selectors, root) {
    var node = root || document;
    if (node.querySelector) {
      return node.querySelector(selectors);
    } else {
      return Ten.querySelector(selectors, node);
    }
  },
  querySelectorAll: function (selectors, root) {
    var node = root || document;
    if (node.querySelector) {
      return node.querySelectorAll(selectors);
    } else {
      return Ten.querySelectorAll(selectors, node);
    }
  },

  getPage: function (url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status < 400) {
          onload(xhr);
        } else {
          if (onerror) onerror(xhr);
        }
      }
    };
    xhr.send(null);
  },

  map: function (list, code) {
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      newList.push(code(list[i]));
    }
    return newList;
  },
  grep: function (list, code) {
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      if (code(list[i])) newList.push(list[i]);
    }
    return newList;
  },

  implementEventTarget: function (cls) {
    cls.prototype.addEventListener = function (evName, code, capture) {
      if (capture) return;
      this.eventHandlers = this.eventHandlers || {};
      this.eventHandlers[evName] = this.eventHandlers[evName] || [];
      this.eventHandlers[evName].push(code);
    };
    cls.prototype.dispatchEvent = function (ev) {
      ev.target = this;
      var nodes = this.eventFlow || [this];
      for (var j = nodes.length - 1; j >= 0; j--) {
        var node = nodes[j];
        ev.currentTarget = node;
        if (node.eventHandlers && node.eventHandlers[ev.type]) {
          var codes = node.eventHandlers[ev.type];
          for (var i = 0; i < codes.length; i++) {
            codes[i].apply(this, [ev]);
          }
        }
      }
      return true;
    };
  },

  observe: function (obj, evName, code) {
    if (obj.addEventListener) {
      obj.addEventListener(evName, code, false);
    } else if (obj.attachEvent) {
      obj.attachEvent('on' + evName, code);
    }
  },
  stopEvent: function (ev) {
    if (ev.stopPropagation) {
      ev.stopPropagation();
    }
    if (ev.preventDefault) {
      ev.preventDefault();
    }
    ev.cancelBubble = true;
    ev.returnValue = false;
  },

  getLocalStorage: function () {
    return this.localStorage = this.localStorage || new Ten.Storage.Local();
  },

  sanitizeHTMLFragment: function (s) {
    // For broken Android browsers...
    return s.replace(/<(?:html|head|body|link|style|meta)/g, '<dummy ');
  },

  reviveScripts: function (e) {
    var scripts = e.getElementsByTagName('script');
    var scriptsL = scripts.length;
    var ss = [];
    for (var i = 0; i < scriptsL; i++) {
      ss.push(scripts[i]);
    }

    for (var i = 0; i < ss.length; i++) {
      var s = ss[i];
      var script = document.createElement('script');
      if (s.charset) script.charset = s.charset;
      if (s.src) script.src = s.src;
      if (s.text) script.text = s.text;
      s.parentNode.replaceChild(script, s);
    }

    return e;
  },

  isIE6: navigator.userAgent.indexOf('MSIE 6.') != -1,
  isDSi: navigator.userAgent.indexOf('Nintendo DSi') != -1,
  is3DS: navigator.userAgent.indexOf('Nintendo 3DS') != -1
};

TL.Event = function (type) {
  this.type = type;
};

TL.Config = {};

TL.Config.getUseAutoExpansion = function () {
  return TL.compat.getLocalStorage().get('tl-use-auto-expansion');
};

TL.Config.setUseAutoExpansion = function (newValue) {
  return TL.compat.getLocalStorage().set('tl-use-auto-expansion', newValue);
};

TL.Config.getUseTimelineObserver = function () {
  var value = TL.compat.getLocalStorage().get('tl-use-timeline-observer');
  if (value == null) {
    return !(TL.compat.isDSi || TL.compat.isIE6 || TL.compat.is3DS);
  } else {
    return value;
  }
};

TL.Config.setUseTimelineObserver = function (newValue) {
  return TL.compat.getLocalStorage().set('tl-use-timeline-observer', newValue);
};

TL.Config.getUseAutopagerizeNext = function () {
  var value = TL.compat.getLocalStorage().get('tl-use-autopagerize-next');
  if (value == null) {
    return !(TL.compat.isDSi || TL.compat.isIE6);
  } else {
    return value;
  }
};

TL.Config.setUseAutopagerizeNext = function (newValue) {
  return TL.compat.getLocalStorage().set('tl-use-autopagerize-next', nextValue);
};

TL.Config.getUseAutopagerizePrev = function () {
  return TL.compat.getLocalStorage().get('tl-use-autopagerize-prev');
};

TL.Config.setUseAutopagerizeNext = function (newValue) {
  TL.compat.getLocalStorage().set('tl-use-autopagerize-prev', newValue);
};

TL.Config.auto = function (tlview) {
  if (TL.Config.getUseTimelineObserver()) {
    tlview.startTimelineObserver();
  }
  if (TL.Config.getUseAutoExpansion()) {
    tlview.timeline.useAutoExpansion = true;
  }
  var usePrev = TL.Config.getUseAutopagerizePrev();
  var useNext = TL.Config.getUseAutopagerizeNext();
  if (usePrev || useNext) {
    tlview.startAutopagerize({next: useNext, prev: usePrev});
  }
};

TL.compat.implementEventTarget(TL);

TL.prototype.PAGE_MAX_AGE = 10*60*60*1000;
TL.prototype.MAX_ENTRIES = 1000;
TL.prototype.MAX_NEW_ENTRIES = 200;
TL.prototype.checkNewEntries = true;

TL.prototype.announceEntryListEdit = function () {
  this.entryList.dispatchEvent(new TL.Event('beforeentrylistedit'));
};

TL.prototype.prependNewEntries = function (entries) {
  var self = this;
  this.newEntryList.prependEntries(TL.compat.grep(entries, function (entry) {
    return !entry.eid || !self.entryListByEID[entry.eid];
  }));
};

TL.prototype.prependTopLevelEntries = function (entries, opts) {
  var self = this;
  var result = this.entryList.prependEntries(TL.compat.grep(entries, function (entry) {
    return !entry.eid || !self.entryListByEID[entry.eid];
  }), opts);
  if (result.discarded) {
    var entries = this.entryList.entries;
    this.setNextReftime(entries[entries.length - 1].sortKey + ',1');
  }
};

TL.prototype.appendTopLevelEntries = function (entries) {
  var self = this;
  var result = this.entryList.appendEntries(TL.compat.grep(entries, function (entry) {
    return !entry.eid || !self.entryListByEID[entry.eid];
  }));
  if (result.discarded) {
    this.newEntryList.deleteEntries();
    this.checkNewEntries = false;
    var entries = this.entryList.entries;
    this.setPrevReftime(entries[0].sortKey + ',1');
  }
};

TL.prototype.setNextURL = function (url) {
  this.nextURL = url;
  this.dispatchEvent(new TL.Event('nexturlchange'));
};

TL.prototype.setPrevURL = function (url) {
  this.prevURL = url;
  this.dispatchEvent(new TL.Event('prevurlchange'));
};

TL.prototype.setNextReftime = function (newReftime) {
  if (!this.nextURL) return;
  this.nextURL = this.nextURL.replace(/([?&])reftime=([+-]|%2[BbDd])[^&]+/, '$1reftime=$2' + newReftime);
};

TL.prototype.setPrevReftime = function (newReftime) {
  if (!this.prevURL) return;
  this.prevURL = this.prevURL.replace(/([?&])reftime=([+-]|%2[BbDd])[^&]+/, '$1reftime=$2' + newReftime);
};

TL.prototype.showNext = function () {
  var url = this.nextURL;
  if (!url) return;
  var self = this;
  var ds = new TL.DataSource.TimelinePage(url);
  TL.compat.observe(ds, 'entriesloaded', function (ev) {
    self.appendTopLevelEntries(ev.newEntries);
    if (ds.nextElement || ds.nextURL) {
      self.setNextURL(ds.nextElement ? ds.nextElement.href : ds.nextURL);
    }
    self.dispatchEvent(new TL.Event('shownextend'));
  });
  TL.compat.observe(ds, 'entryloadfailed', function () {
    self.dispatchEvent(new TL.Event('shownextend'));
  });
  self.dispatchEvent(new TL.Event('shownextstart'));
  ds.loadData();
};

TL.prototype.showPrev = function (opts) {
  var url = this.prevURL;
  if (!url) return;
  var self = this;
  var ds = new TL.DataSource.TimelinePage(url);
  TL.compat.observe(ds, 'entriesloaded', function (ev) {
    self.prependTopLevelEntries(ev.newEntries, opts);
    if (ds.prevElement || ds.prevURL) {
      self.setPrevURL(ds.prevElement ? ds.prevElement.href : ds.prevURL);
    }
    if (!self.checkNewEntries && ds.shouldCheckNewEntries()) {
      self.checkNewEntries = true;
    }
    self.dispatchEvent(new TL.Event('showprevend'));
  });
  TL.compat.observe(ds, 'entryloadfailed', function () {
    self.dispatchEvent(new TL.Event('showprevend'));
  });
  self.dispatchEvent(new TL.Event('showprevstart'));
  ds.loadData();
};

TL.prototype.loadPrev = function () {
  if (!this.checkNewEntries) return false;
  var url = this.prevURL;
  if (!url) return false;
  var self = this;
  var ds = new TL.DataSource.TimelinePage(url);
  TL.compat.observe(ds, 'entriesloaded', function (ev) {
    self.prependNewEntries(ev.newEntries);
    if (ds.prevElement || ds.prevURL) {
      self.setPrevURL(ds.prevElement ? ds.prevElement.href : ds.prevURL);
    }
    self.dispatchEvent(new TL.Event('loadprevend'));
    self.lastLoadPrevHasNoData = ev.newEntries.length == 0;
  });
  TL.compat.observe(ds, 'entryloadfailed', function () {
    self.dispatchEvent(new TL.Event('loadprevend'));
  });
  self.dispatchEvent(new TL.Event('loadprevstart'));
  ds.loadData();
  return true;
};

TL.prototype.infoToURL = function (info) {
  return '/' + info.authorURLName + '/e/' + info.eid;
};

TL.prototype.loadEntryByInfo = function (info, onload, onfail) {
  /* From the timeline */
  var entryList = this.entryListByEID[info.eid];
  if (entryList) {
    var entry = entryList.entryByEID[info.eid];
    if (entry) {
      setTimeout(function () {
        onload(entry, entryList);
      }, 0);
      return;
    }
  }

  /* From Entry page */
  var url = this.infoToURL(info);
  var ds = new TL.DataSource.EntryPage(url);
  TL.compat.observe(ds, 'entriesloaded', function (ev) {
    onload(ev.newEntries[0]);
  });
  if (onfail) {
    TL.compat.observe(ds, 'entryloadfailed', function (ev) {
      onfail();
    });
  }
  ds.loadData();
};

TL.prototype.expandEntry = function (entry, opts) {
  var n = 0;
  var self = this;
  opts = opts || {};
  var depth = (opts.depth || 1) - 1;

  var entryOpenId = opts.entryOpenId || (Math.random() + "").substring(2, 10);
  var parentInfo = entry.isParentExpanded ? null : entry.getParentEntryInfo();
  if (parentInfo) {
    this.loadEntryByInfo(parentInfo, function (parentEntry, parentEntryList) {
      var data = {};
      if (parentEntryList) {
        parentEntryList._deleteEntry(parentEntry);
        if (parentEntry.eid) delete self.entryListByEID[parentEntry.eid];
        var ev = new TL.Event('entrydeleteformove');
        ev.data = data;
        ev.entry = parentEntry;
        parentEntryList.dispatchEvent(ev);
      }

      var list = entry.eid ? self.entryListByEID[entry.eid] : null;
      if (list) {
        var entries = list.entries;
        for (var i = 0; i < entries.length; i ++) {
          if (entries[i] === entry) {
            var ev = new TL.Event('beforeentryreplace');
            ev.oldEntry = entry;
            ev.newEntry = parentEntry;
            ev.isReallyNew = !parentEntryList || parentEntryList.isNewEntryList;
            ev.entryOpenId = entryOpenId;
            ev.data = data;
            list.dispatchEvent(ev);
            entries.splice(i, 1, parentEntry);
            if (parentEntry.eid) {
              self.entryListByEID[parentEntry.eid] = list;
              list.entryByEID[parentEntry.eid] = parentEntry;
            }
            var childList = parentEntry.getChildEntryList();
            childList.entries.push(entry);
            if (entry.eid) {
              self.entryListByEID[entry.eid] = childList;
              childList.entryByEID[entry.eid] = entry;
            }
            var ev = new TL.Event('entryreplaced');
            ev.oldEntry = entry;
            ev.newEntry = parentEntry;
            ev.isReallyNew = !parentEntryList || parentEntryList.isNewEntryList;
            ev.entryOpenId = entryOpenId;
            ev.depth = depth;
            ev.data = data;
            list.dispatchEvent(ev);
            break;
          }
        }
      }
      entry.isParentExpanded = true;
      n--;
      if (n <= 0) entry.setToExpanded();
    }, function () {
      n--;
      if (n <= 0) entry.setToExpanded();
    });
    n++;
  }

  var childInfos = entry.getChildEntryInfos();
  var childList;
  for (var i = 0; i < childInfos.length; i++) {
    var childInfo = childInfos[i];
    this.loadEntryByInfo(childInfo, function (childEntry, childEntryList) {
      childList = childList || entry.getChildEntryList();
      childEntry.isParentExpanded = true;
      if (childEntryList) {
        childEntryList._deleteEntry(childEntry);
        if (childEntry.eid) delete self.entryListByEID[childEntry.eid];
        var data = {};
        var ev = new TL.Event('entrydeleteformove');
        ev.data = data;
        ev.entry = childEntry;
        childEntryList.dispatchEvent(ev);
        
        if (childEntryList.isNewEntryList) {
          childList.appendEntries([childEntry], {
            entryOpenId: entryOpenId,
            depth: depth,
            sort: true
          });
          if (childEntry.eid) self.entryListByEID[childEntry.eid] = childList;
        } else {
          childList.entries.push(childEntry);
          if (childEntry.eid) {
            childList.entryByEID[childEntry.eid] = childEntry;
            self.entryListByEID[childEntry.eid] = childList;
          }
          var ev = new TL.Event('entrymoved');
          ev.entry = childEntry;
          ev.data = data;
          ev.entryOpenId = entryOpenId;
          ev.depth = depth;
          childList.dispatchEvent(ev);
        }
      } else {
        childList.appendEntries([childEntry], {
          entryOpenId: entryOpenId,
          depth: depth,
          sort: true
        });
        if (childEntry.eid) self.entryListByEID[childEntry.eid] = childList;
      }
      n--;
      if (n <= 0) entry.setToExpanded();
    }, function () {
      n--;
      if (n <= 0) entry.setToExpanded();
    });
    n++;
  }

  if (n) {
    entry.dispatchEvent(new TL.Event('beforeexpand'));
  } else {
    entry.setToExpanded();
  }

  var ev = new TL.Event('entryopenidchange');
  ev.entryOpenId = entryOpenId;
  this.dispatchEvent(ev);
};

TL.EntryList = function () {
  this.entries = [];
  this.entryByEID = {};
};

TL.compat.implementEventTarget(TL.EntryList);

TL.EntryList.prototype.MAX_ENTRIES = 1000;
TL.EntryList.prototype.DEFAULT_CHILD_SORT_ORDER = 'desc';

TL.EntryList.prototype.prependEntries = function (entries, opts) {
  var list = [];
  var result = {};
  for (var i = entries.length - 1; i >= 0; i--) {
    var entry = entries[i];
    if (entry.eid && this.entryByEID[entry.eid]) {
      //
    } else {
      if (entry.eid) this.entryByEID[entry.eid] = entry;
      this.entries.unshift(entry);
      list.unshift(entry);
    }
  }
  if (this.entries.length > this.MAX_ENTRIES) {
    var ev = new TL.Event('entriesdiscarded');
    ev.startOffset = this.MAX_ENTRIES;
    ev.endOffset = this.entries.length;
    var discarded = this.entries.splice(ev.startOffset, ev.endOffset);
    ev.oldEntries = discarded;
    for (var i = 0; i < discarded.length; i++) {
      if (discarded[i].eid) delete this.entryByEID[discarded[i].eid];
    }
    this.dispatchEvent(ev);
    result.discarded = true;
  }
  if (list.length) {
    var ev = new TL.Event('entriesprepended');
    ev.newEntries = list;
    if (opts) {
      ev.entryOpenId = opts.entryOpenId;
      ev.depth = opts.depth;
      ev.needSort = opts.sort;
      ev.insertDownward = opts.insertDownward;
    }
    this.dispatchEvent(ev);
  }
  return result;
};

TL.EntryList.prototype.appendEntries = function (entries, opts) {
  var list = [];
  var result = {};
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    if (entry.eid && this.entryByEID[entry.eid]) {
      //
    } else {
      if (entry.eid) this.entryByEID[entry.eid] = entry;
      this.entries.push(entry);
      list.push(entry);
    }
  }
  if (this.entries.length > this.MAX_ENTRIES) {
    var ev = new TL.Event('entriesdiscarded');
    ev.startOffset = 0;
    ev.endOffset = this.entries.length - this.MAX_ENTRIES;
    var discarded = this.entries.splice(ev.startOffset, ev.endOffset);
    ev.oldEntries = discarded;
    for (var i = 0; i < discarded.length; i++) {
      if (discarded[i].eid) delete this.entryByEID[discarded[i].eid];
    }
    this.dispatchEvent(ev);
    result.discarded = true;
  }
  if (list.length) {
    var ev = new TL.Event('entriesappended');
    ev.newEntries = list;
    if (opts) {
      ev.entryOpenId = opts.entryOpenId;
      ev.depth = opts.depth;
      ev.needSort = opts.sort;
    }
    this.dispatchEvent(ev);
  }
  return result;
};

TL.EntryList.prototype.deleteEntries = function () {
  if (this.entries.length) {
    var ev = new TL.Event('entriesdiscarded')
    ev.startOffset = 0;
    ev.endOffset = this.entries.length;
    ev.oldEntries = this.entries;
    this.entries = [];
    this.entryByEID = {};
    this.dispatchEvent(ev);
    return ev.oldEntries;
  } else {
    return [];
  }
};

TL.EntryList.prototype._deleteEntry = function (entry) {
  var entries = this.entries;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i] === entry) {
      entries.splice(i, 1);
      break;
    }
  }
  if (entry.eid) {
    delete this.entryByEID[entry.eid];
  }
};

TL.EntryList.prototype.addEntryClass = function (className) {
  var es = this.entries;
  for (var i = 0; i < es.length; i++) {
    var entry = es[i];
    TL.compat.addElementClass(entry.element, className);
  }
};

TL.EntryList.prototype.deleteEntryClass = function (className) {
  var es = this.entries;
  for (var i = 0; i < es.length; i++) {
    var entry = es[i];
    TL.compat.deleteElementClass(entry.element, className);
  }
};

TL.EntryList.prototype.getLength = function () {
  return this.entries.length;
};

TL.Entry = function (el) {
  this.element = el;
  this.innerElement = TL.compat.querySelector('.list-body,table', el) || el;
  this.eid = el.getAttribute('data-tl-eid');
  this.sortKey = parseInt(el.getAttribute('data-tl-sortkey'));
};

TL.compat.implementEventTarget(TL.Entry);

TL.Entry.prototype.HAS_EXPANDABLE_CHILD_ENTRY_SELECTOR_TEXT = '.tl-reply-entry.tl-reply-not-extracted';
TL.Entry.prototype.HAS_EXPANDABLE_ENTRY_SELECTOR_TEXT = '.tl-reply-to-entry.tl-reply-not-extracted,.tl-reply-entry.tl-reply-not-extracted';
TL.Entry.prototype.PARENT_ENTRY_LINK_SELECTOR_TEXT = '.tl-reply-to-entry.tl-reply-not-extracted';
TL.Entry.prototype.CHILD_ENTRY_LINK_SELECTOR_TEXT = '.tl-reply-entry.tl-reply-not-extracted';

TL.Entry.prototype.isExpandable = function () {
  if (this.isParentExpanded) {
    return !this.isExpanded && !!TL.compat.querySelector(this.HAS_EXPANDABLE_CHILD_ENTRY_SELECTOR_TEXT, this.innerElement);
  } else {
    return !this.isExpanded && !!TL.compat.querySelector(this.HAS_EXPANDABLE_ENTRY_SELECTOR_TEXT, this.innerElement);
  }
};

TL.Entry.prototype.getParentEntryInfo = function () {
  var a = TL.compat.querySelector(this.PARENT_ENTRY_LINK_SELECTOR_TEXT, this.innerElement);
  if (!a) return;
  var url = a.href;
  a.className = a.className.replace(/\btl-reply-not-extracted\b/, '');
  var m = url.match(/^https?:\/\/[^\/]+\/(?:touch\/|mobile\/)?([^\/]+)\/(?:[eh]\/)?([0-9]+)(?:$|\?)/);
  if (m) {
    return {authorURLName: m[1], eid: m[2]};
  }
  return null;
};

TL.Entry.prototype.getChildEntryInfos = function () {
  var list = [];
  var comments = TL.compat.querySelectorAll(this.CHILD_ENTRY_LINK_SELECTOR_TEXT, this.innerElement);
  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    comment.className = comment.className.replace(/\btl-reply-not-extracted\b/, '');
    var author = comment.getAttribute('data-tl-entry-author');
    var eid = comment.getAttribute('data-tl-eid');
    if (!eid) {
      var url = comment.href;
      if (url) {
        var m = url.match(/^https?:\/\/[^\/]+\/(?:touch\/|mobile\/)?([^\/]+)\/(?:[eh]\/)?([0-9]+)(?:$|\?)/);
        if (m) {
          author = m[1];
          eid = m[2];
        }
      }
    }
    list.push({authorURLName: author, eid: eid});
  }
  return list;
};

TL.Entry.prototype.getChildEntryList = function () {
  if (!this.childEntryList) {
    this.childEntryList = new TL.EntryList;
    this.childEntryList.sortOrder = this.childEntryList.DEFAULT_CHILD_SORT_ORDER;
    this.dispatchEvent(new TL.Event('childentrylistcreated'));
  }
  return this.childEntryList;
};

TL.Entry.prototype.setToExpanded = function () {
  if (this.isExpanded) return;
  this.isExpanded = true;
  this.dispatchEvent(new TL.Event('expanded'));
};

TL.View = function (timeline, el, opts) {
  this.timeline = timeline;
  this.element = el;

  this.templateSet = new TL.View.TemplateSet(el);

  var entryListEl = TL.compat.querySelector(this.ENTRY_LIST_SELECTOR_TEXT, el);
  this.viewEntryList = new TL.View.EntryList(timeline.entryList, entryListEl, timeline, this.templateSet);
  this.viewEntryList.eventFlow = [this, this.viewEntryList];

  var self = this;
  this.entryOpenStyleElement = TL.compat.querySelector('.tl-entry-open-style');
  if (this.entryOpenStyleElement) {
    TL.compat.observe(timeline, 'entryopenidchange', function (ev) {
      self.setEntryOpenId(ev.entryOpenId);
    });
  }

  timeline.isOldPage = opts && opts.isOldPage;
};

TL.compat.implementEventTarget(TL.View);

TL.View.prototype.ENTRY_LIST_SELECTOR_TEXT = '.tl-entry-list';

TL.View.prototype.setEntryOpenId = function (newEntryOpenId) {
  var el = this.entryOpenStyleElement;
  if (!el) return;
  el.innerHTML = '<style>' + el.getAttribute('data-style').replace(/%%/g, '.tl-newly-opened-entry-' + newEntryOpenId) + '</style>';
};

TL.View.prototype.setNotificationArea = function (na) {
  var nen = new TL.View.NewEntryNotification(this.timeline.newEntryList, na);
  this.newEntryNotification = nen;
  var self = this;
  TL.compat.observe(nen, 'openentries', function (ev) {
    var id = (Math.random() + "").substring(2, 10);
    if (!ev.noEntryOpenClass) {
      self.timeline.newEntryList.addEntryClass('tl-newly-opened-entry-' + id);
    }
    self.setEntryOpenId(id);
    self.timeline.announceEntryListEdit();
    var entries = self.timeline.newEntryList.deleteEntries();
    self.timeline.prependTopLevelEntries(entries);
  });
  TL.compat.observe(nen, 'reloadclick', function () {
    self.reloadPage();
  });
  TL.compat.observe(this.timeline, 'reloadmode', function () {
    nen.setReloadMode();
  });
};

TL.View.prototype.addNextButton = function (el) {
  var self = this;
  TL.compat.observe(el, 'click', function (ev) {
    if (!self.timeline.isReloadMode) {
      self.timeline.showNext();
      TL.compat.stopEvent(ev);
    }
  });
  TL.compat.observe(this.timeline, 'nexturlchange', function (ev) {
    el.href = ev.target.nextURL;
  });
};

TL.View.prototype.addPrevButton = function (el) {
  var self = this;
  TL.compat.observe(el, 'click', function (ev) {
    if (!self.timeline.isReloadMode) {
      self.timeline.showPrev();
      TL.compat.stopEvent(ev);
    }
  });
  TL.compat.observe(this.timeline, 'prevurlchange', function (ev) {
    el.href = ev.target.prevURL;
  });
};

TL.View.prototype.addReloadPageButton = function (el) {
  var self = this;
  TL.compat.observe(el, 'click', function (ev) {
   self.reloadPage();
   TL.compat.stopEvent(ev);
  });
};

TL.View.prototype.initIndicators = function () {
  var el = this.element;
  this.prevIndicatorElement = TL.compat.querySelector('.tl-indicator-prev', el);
  this.nextIndicatorElement = TL.compat.querySelector('.tl-indicator-next', el);
  this.prevIndicatorCount = 0;
  this.nextIndicatorCount = 0;
  if (this.prevIndicatorElement == this.nextIndicatorElement) {
    this.startPrevIndicator = this.startNextIndicator;
    this.stopPrevIndicator = this.stopNextIndicator;
  }
  
  var self = this;
  TL.compat.observe(this.timeline, 'loadprevstart', function () {
    self.startPrevIndicator();
  });
  TL.compat.observe(this.timeline, 'loadprevend', function () {
    self.stopPrevIndicator();
  });
  TL.compat.observe(this.timeline, 'showprevstart', function () {
    self.startPrevIndicator();
  });
  TL.compat.observe(this.timeline, 'showprevend', function () {
    self.stopPrevIndicator();
  });
  TL.compat.observe(this.timeline, 'shownextstart', function () {
    self.startNextIndicator();
  });
  TL.compat.observe(this.timeline, 'shownextend', function () {
    self.stopNextIndicator();
  });
};

TL.View.prototype.startPrevIndicator = function () {
  var el = this.prevIndicatorElement;
  this.prevIndicatorCount++;
  if (el) TL.compat.show(el);
};

TL.View.prototype.stopPrevIndicator = function () {
  this.prevIndicatorCount--;
  var el = this.prevIndicatorElement;
  if (el && this.prevIndicatorCount <= 0) {
    TL.compat.hide(el);
  }
};

TL.View.prototype.startNextIndicator = function () {
  var el = this.nextIndicatorElement;
  this.nextIndicatorCount++;
  if (el) TL.compat.show(el);
};

TL.View.prototype.stopNextIndicator = function () {
  this.nextIndicatorCount--;
  var el = this.nextIndicatorElement;
  if (el && this.nextIndicatorCount <= 0) {
    TL.compat.hide(el);
  }
};

TL.View.prototype.reloadPage = function () {
  var url = this.reloadPageURL;
  if (url) {
    location.replace(url);
  } else {
    location.reload();
  }
};

TL.View.prototype.setReloadPageURL = function (url) {
  this.reloadPageURL = url;
};

TL.View.prototype.OBSERVER_INTERVAL_INITIAL = 30*1000;
TL.View.prototype.OBSERVER_INTERVAL_MIN = 30*1000;
TL.View.prototype.OBSERVER_INTERVAL_MAX = 30*60*1000;

if (TL.compat.isDSi) {
  TL.View.prototype.OBSERVER_INTERVAL_INITIAL = 120*1000;
  TL.View.prototype.OBSERVER_INTERVAL_MIN = 120*1000;
}

TL.View.prototype.startTimelineObserver = function () {
  var self = this;
  var observe = function () {
    if (self.timeline.loadPrev()) {
      var newInterval = self.timelineObserverInterval;
      if (self.timeline.lastLoadPrevHasNoData ||
          self.timeline.newEntryList.getLength() > 0) {
        newInterval *= 1.5;
      } else {
        newInterval /= 2;
      }
      if (newInterval < self.OBSERVER_INTERVAL_MIN) {
        newInterval = self.OBSERVER_INTERVAL_MIN;
      }
      if (newInterval > self.OBSERVER_INTERVAL_MAX) {
        newInterval = self.OBSERVER_INTERVAL_MAX;
      }
      self.timelineObserverInterval = newInterval;
      setTimeout(observe, newInterval);
      TL.log('TimelineObserver = ' + self.timelineObserverInterval);
    }
  };
  self.timelineObserverInterval = self.OBSERVER_INTERVAL_INITIAL;
  setTimeout(observe, self.timelineObserverInterval);
  TL.log('TimelineObserver = ' + self.timelineObserverInterval);

  if (!self.timeline.isOldPage) {
    TL.compat.observe(window, 'pageshow', function () {
      self.timeline.showPrev({insertDownward: true});
    });
  }
};

TL.View.prototype.AUTOPAGERIZE_TIMEOUT = 1*60*1000;
TL.View.prototype.AUTOPAGERIZE_NEXT_REMAINING_COUNT = 6;
TL.View.prototype.AUTOPAGERIZE_PREV_REMAINING_COUNT = 2;
TL.View.prototype.AUTOPAGERIZE_SCROLL_THRESHOLD = 40;
TL.View.prototype.AUTOPAGERIZE_TOP_THRESHOLD = 100;
TL.View.prototype.AUTOPAGERIZE_BOTTOM_THRESHOLD = 100;

TL.View.prototype.startAutopagerize = function (opts) {
  var self = this;
  self.prevScrollTop = document.documentElement.scrollTop;

  TL.compat.observe(self.viewEntryList.entryList, 'entriesappended', function (ev) {
    delete self.autopagerizeNextStarted;
  });
  TL.compat.observe(self.viewEntryList.entryList, 'entriesprepended', function (ev) {
    delete self.autopagerizePrevStarted;
  });

  var code = function () {
    var autoNext = opts.next &&
                   !(self.autopagerizeNextStarted &&
                     self.autopagerizeNextStarted + self.AUTOPAGERIZE_TIMEOUT > (new Date()).getTime());
    var autoPrev = opts.prev &&
                   !(self.autopagerizePrevStarted &&
                     self.autopagerizePrevStarted + self.AUTOPAGERIZE_TIMEOUT > (new Date()).getTime());
    if (!autoNext && !autoPrev) return;
    
    var start = document.documentElement.scrollTop || document.body.scrollTop;

    var diff = start - self.prevScrollTop;
    if (diff < 0) diff *= -1;
    if (diff < self.AUTOPAGERIZE_SCROLL_THRESHOLD) return;

    var end = start + (window.innerHeight || Math.min(document.documentElement.offsetHeight, document.body.offsetHeight));
    var ves = self.viewEntryList.splitViewEntriesByRange(start, end);

    var height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    if (autoNext && 
        ((height - end < self.AUTOPAGERIZE_BOTTOM_THRESHOLD) ||
         (self.prevScrollTop < start &&
          ves[2].length < self.AUTOPAGERIZE_NEXT_REMAINING_COUNT))) {
      self.autopagerizeNextStarted = (new Date()).getTime();
      self.timeline.showNext();
    }

    if (autoPrev &&
        (/* (start < self.AUTOPAGERIZE_TOP_THRESHOLD) || */
         (start < self.prevScrollTop &&
          ves[0].length < self.AUTOPAGERIZE_PREV_REMAINING_COUNT))) {
      if (self.newEntryNotification &&
          self.timeline.newEntryList.getLength()) {
        self.newEntryNotification.openEntriesLater({noEntryOpenClass: true});
      } else {
        self.autopagerizePrevStarted = (new Date()).getTime();
        self.timeline.showPrev();
      }
    }

    self.prevScrollTop = start;
  };

  TL.compat.observe(window, 'scroll', code);
  setTimeout(code, 0);
};

TL.View.TemplateSet = function (el) {
  this.element = TL.compat.querySelector('.tl-template-set', el);
};

TL.View.TemplateSet.prototype.get = function (name) {
  var el = this.element ? TL.compat.querySelector('.tl-template-' + name, this.element) : null;
  if (!el) return null;
  var cloned = document.createElement(el.nodeName);
  cloned.innerHTML = el.getAttribute('data-content');
  return cloned;
};

TL.View.EntryList = function (entryList, el, timeline, templateSet) {
  this.entryList = entryList;
  this.element = el;
  this.timeline = timeline;
  this.viewEntries = [];
  this.templateSet = templateSet;

  var self = this;
  TL.compat.observe(entryList, 'beforeentrylistedit', function (ev) {
    var firstVE = self.viewEntries[0];
    if (firstVE) {
      self.firstElementOffsetTop = firstVE.getElement().offsetTop;
    }
  });
  TL.compat.observe(entryList, 'entriesprepended', function (ev) {
    var firstVE = self.viewEntries[0];
    var firstOffsetTop = self.firstElementOffsetTop || 0;
    delete self.firstElementOffsetTop;
    if (firstVE && !firstOffsetTop) firstOffsetTop = firstVE.getElement().offsetTop;
    self.prependViewEntries(TL.compat.map(ev.newEntries, function (entry) {
      var ve = new TL.View.Entry(entry, self.timeline, self.templateSet);
      self.viewEntries.push(ve);
      if (ev.entryOpenId && ev.depth) {
        ve.expandLater({entryOpenId: ev.entryOpenId, depth: ev.depth});
      }
      return ve;
    }), {entryOpenId: ev.entryOpenId});
    if (ev.needSort) self.sort();

    if (firstVE && !ev.insertDownward) {
      var newOffsetTop = firstVE.getElement().offsetTop;
      if (firstOffsetTop != newOffsetTop) {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        window.scrollTo(0, newOffsetTop - firstOffsetTop + scrollTop);
      }
    }
  });
  TL.compat.observe(entryList, 'entriesappended', function (ev) {
    self.appendViewEntries(TL.compat.map(ev.newEntries, function (entry) {
      var ve = new TL.View.Entry(entry, self.timeline, self.templateSet);
      self.viewEntries.push(ve);
      if (ev.entryOpenId && ev.depth) {
        ve.expandLater({entryOpenId: ev.entryOpenId, depth: ev.depth});
      }
      return ve;
    }), {entryOpenId: ev.entryOpenId});
    if (ev.needSort) self.sort();
  });
  TL.compat.observe(entryList, 'entriesdiscarded', function (ev) {
    var list = ev.oldEntries;
    var ves = self.viewEntries;
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      entry.element.parentNode.removeChild(entry.element);
      for (var j = 0; j < ves.length; j++) {
        if (ves[j].entry === entry) {
          ves.splice(j, 1);
          break;
        }
      }
    }
  });
  TL.compat.observe(entryList, 'entrydeleteformove', function (ev) {
    var ves = self.viewEntries;
    for (var j = 0; j < ves.length; j++) {
      if (ves[j].entry === ev.entry) {
        ev.data.newViewEntry = ves[j];
        ves.splice(j, 1);
        break;
      }
    }
  });
  TL.compat.observe(entryList, 'beforeentryreplace', function (ev) {
    ev.data.newViewEntry = ev.data.newViewEntry || new TL.View.Entry(ev.newEntry, self.timeline, self.templateSet);
  });
  TL.compat.observe(entryList, 'entryreplaced', function (ev) {
    var oldElement = ev.oldEntry.element;
    if (oldElement.parentNode) {
      oldElement.parentNode.insertBefore(ev.newEntry.element, oldElement);

      if (ev.isReallyNew) {
        var container = document.createElement('div');
        container.className = 'tl-entries-container';
        ev.newEntry.element.parentNode.replaceChild(container, ev.newEntry.element);
        container.appendChild(ev.newEntry.element);
        var sev = new TL.Event('fragmentload');
        sev.fragment = container;
        self.timeline.dispatchEvent(sev);
      }
      
      oldElement.parentNode.removeChild(oldElement);
    }
    var ves = self.viewEntries;
    var ve;
    var i;
    for (i = 0; i < ves.length; i++) {
      if (ves[i].entry === ev.oldEntry) {
        ve = ves[i];
        ves.splice(i, 1);
        break;
      }
    }
    ve = ve || new TL.View.Entry(ev.oldEntry, self.timeline, self.templateSet);
    if (ev.data.newViewEntry) {
      ves.splice(i, 0, ev.data.newViewEntry);
      ev.data.newViewEntry.viewChildEntryList.appendViewEntries([ve], {noFragmentLoad: true});
      ev.data.newViewEntry.expandLater({entryOpenId: ev.entryOpenId, depth: ev.depth});
    }
    if (ev.isReallyNew && ev.entryOpenId) {
      TL.compat.addElementClass(ev.newEntry.element, 'tl-newly-opened-entry-' + ev.entryOpenId);
    }
  });
  TL.compat.observe(entryList, 'entrymoved', function (ev) {
    var ve = ev.data.newViewEntry;
    if (ve) {
      var el = ve.getElement();
      el.parentNode.removeChild(el);
      self.appendViewEntries([ve], {noFragmentLoad: true});
      self.viewEntries.push(ve);
      ve.expandLater({entryOpenId: ev.entryOpenId, depth: ev.depth});
    }
  });
};

TL.compat.implementEventTarget(TL.View.EntryList);

TL.View.EntryList.prototype.ENTRIES_CONTAINER_ELEMENT_NAME = 'div';
TL.View.EntryList.prototype.ENTRIES_CONTAINER_CLASS_NAME = 'tl-entries-container';

TL.View.EntryList.prototype.appendViewEntries = function (ves, opts) {
  var container = this.element.ownerDocument.createElement(this.ENTRIES_CONTAINER_ELEMENT_NAME);
  container.className = this.ENTRIES_CONTAINER_CLASS_NAME;
  for (var i = 0; i < ves.length; i++) {
    var ve = ves[i];
    var el = ve.getElement();
    if (!TL.compat.isInDocument(el)) {
      container.appendChild(el);
      if (opts && opts.entryOpenId) {
        TL.compat.addElementClass(el, 'tl-newly-opened-entry-' + opts.entryOpenId);
      }
    }
  }
  this.element.appendChild(container);
  if (opts && opts.noFragmentLoad) return;
  var ev = new TL.Event('fragmentload');
  ev.fragment = container;
  this.timeline.dispatchEvent(ev);
};

TL.View.EntryList.prototype.prependViewEntries = function (ves, opts) {
  var container = this.element.ownerDocument.createElement(this.ENTRIES_CONTAINER_ELEMENT_NAME);
  container.className = 'tl-entries-container';
  for (var i = 0; i < ves.length; i++) {
    var ve = ves[i];
    var el = ve.getElement();
    if (!TL.compat.isInDocument(el)) {
      container.appendChild(el);
      if (opts && opts.entryOpenId) {
        TL.compat.addElementClass(el, 'tl-newly-opened-entry-' + opts.entryOpenId);
      }
    }
  }
  this.element.insertBefore(container, this.element.firstChild);
  if (opts && opts.noFragmentLoad) return;
  var ev = new TL.Event('fragmentload');
  ev.fragment = container;
  this.timeline.dispatchEvent(ev);
};

TL.View.EntryList.prototype.sort = function () {
  var order = this.entryList.sortOrder;
  if (!order) return;
  if (!this.viewEntries.length) return;

  var sorter = order == 'asc' ? function (a, b) {
    return a.entry.sortKey - b.entry.sortKey;
  } : function (b, a) {
    return a.entry.sortKey - b.entry.sortKey;
  };
  this.viewEntries = this.viewEntries.sort(sorter);
  var parent = this.viewEntries[0].getElement().parentNode;
  if (!parent) return;
  for (var i = 0; i < this.viewEntries.length; i++) {
    var el = this.viewEntries[i].getElement();
    parent.appendChild(el);
  }
};

TL.View.EntryList.prototype.splitViewEntriesByRange = function (start, end) {
  var beforeVES = [];
  var inVES = [];
  var afterVES = [];
  var ves = this.viewEntries;
  for (var i = 0; i < ves.length; i++) {
    var el = ves[i].getElement();
    if (el.offsetTop + el.offsetHeight < start) {
      beforeVES.push(ves[i]);
    } else if (end < el.offsetTop) {
      afterVES.push(ves[i]);
    } else {
      inVES.push(ves[i]);
    }
  }
  return [beforeVES, inVES, afterVES];
};

TL.View.NewEntryNotification = function (newEntryList, na) {
  this.notificationArea = na;

  var self = this;
  TL.compat.observe(newEntryList, 'entriesprepended', function (ev) {
    self.setNewEntryCount(newEntryList.getLength());
  });
  TL.compat.observe(newEntryList, 'entriesappended', function (ev) {
    self.setNewEntryCount(newEntryList.getLength());
  });
  TL.compat.observe(newEntryList, 'entriesdiscarded', function (ev) {
    self.setNewEntryCount(newEntryList.getLength());
  });
  TL.compat.observe(newEntryList, 'entrydeleteformove', function (ev) {
    self.setNewEntryCount(newEntryList.getLength());
  });

  self.openEntriesLater = function (opts) {
    var self = this;
    setTimeout(function () {
      var ev = new TL.Event('openentries');
      ev.noEntryOpenClass = opts && opts.noEntryOpenClass;
      self.dispatchEvent(ev);
    }, 0);
  };
};

TL.compat.implementEventTarget(TL.View.NewEntryNotification);

TL.View.NewEntryNotification.prototype.originalTitle = document.title;

TL.View.NewEntryNotification.prototype.getNewEntryButtonLabel = function (n) {
  return 'New entries (' + n + ')';
};

TL.View.NewEntryNotification.prototype.getReloadButtonLabel = function (n) {
  return 'Reload';
};

TL.View.NewEntryNotification.prototype.setNewEntryCount = function (n) {
  if (this.isReloadMode) return;
  if (n == 0) {
    if (this.lastId) {
      this.notificationArea.deleteById(this.lastId);
      delete this.lastId;
    }
    document.title = this.originalTitle;
    return;
  }
  document.title = '(' + n + ') ' + this.originalTitle;
  var self = this;
  this.lastId = this.notificationArea.setStatus(this.getNewEntryButtonLabel(n), function () {
    self.dispatchEvent(new TL.Event('openentries'));
  });
};

TL.View.NewEntryNotification.prototype.setReloadMode = function () {
  var self = this;
  this.isReloadMode = true;
  document.title = '(*) ' + this.originalTitle;
  this.notificationArea.setStatus(this.getReloadButtonLabel(), function () {
    self.dispatchEvent(new TL.Event('reloadclick'));
  });
  self.dispatchEvent(new TL.Event('reloadmode'));
};

TL.View.Entry = function (entry, timeline, templateSet) {
  this.entry = entry;
  this.timeline = timeline;
  this.templateSet = templateSet;
  var self = this;

  TL.compat.observe(entry, 'childentrylistcreated', function () {
    var el = self.getElement();
    var div = el.ownerDocument.createElement('div');
    div.className = 'tl-child-entry-list';
    var vEntryList = new TL.View.EntryList(self.entry.childEntryList, div, self.timeline, self.templateSet);
    self.viewChildEntryList = vEntryList;
    el.appendChild(div);
  });

  TL.compat.observe(entry, 'beforeexpand', function () {
    if (self.expandIndicatorElement) {
      TL.compat.show(self.expandIndicatorElement);
    }
    TL.compat.addElementClass(self.getElement(), 'tl-entry-beforeexpand');
  });
  TL.compat.observe(entry, 'expanded', function () {
    var button = self.expandElement;
    if (button) {
      if (button.parentNode) button.parentNode.removeChild(button);
      if (self.expandIndicatorElement) {
        if (self.expandIndicatorElement.parentNode) {
          self.expandIndicatorElement.parentNode.removeChild(self.expandIndicatorElement);
        }
        delete self.expandIndicatorElement;
      }
      delete self.expandElement;
    }
    self.expandLater = function () { };
    TL.compat.deleteElementClass(self.getElement(), 'tl-entry-beforeexpand');
    TL.compat.addElementClass(self.getElement(), 'tl-entry-expanded');
  });

  if (entry.isExpandable()) {
    var expand = this.templateSet.get('expand-button');
    if (expand) {
      var button = TL.compat.querySelector('.tl-expand-button', expand);
      var indicator = TL.compat.querySelector('.tl-indicator-expand', expand);
      TL.compat.observe(button, 'click', function (ev) {
        self.expandLater({depth: self.MAX_EXPAND_DEPTH});
        //TL.compat.stopEvent(ev);
      });
      button.href = 'javascript:void(0)';
      self.expandLater = function (opts) {
        if (opts.depth <= 0) return;
        setTimeout(function () {
          timeline.expandEntry(self.entry, opts);
        }, 500);
      };
      this.expandElement = expand;
      this.expandIndicatorElement = indicator;
      self.insertExpandButton();

      if (timeline.useAutoExpansion) {
        self.expandLater({depth: self.MAX_AUTO_EXPAND_DEPTH});
        timeline.useAutoExpansion = false;
      }
    }
  }
};

TL.View.Entry.prototype.getElement = function () {
  return this.entry.element;
};

TL.View.Entry.prototype.expandLater = function () { };

TL.View.Entry.prototype.MAX_EXPAND_DEPTH = 5;
TL.View.Entry.prototype.MAX_AUTO_EXPAND_DEPTH = 1;

TL.View.Entry.prototype.insertExpandButton = function () {
  var button = this.expandElement;
  if (!button) return;
  var parentEl = TL.compat.querySelector('.tl-expand-button-container', this.getElement());
  if (!parentEl) return;
  parentEl.appendChild(button);
};

TL.DataSource = function () {

};

TL.DataSource.prototype.ENTRY_SELECTOR_TEXT = '.tl-entry, .tl-pseudo-entry';

TL.DataSource.prototype.urlFilter = function (url) {
  return url.replace(/^https?:\/\/[^\/]+/, '');
};

TL.compat.implementEventTarget(TL.DataSource);

TL.DataSource.prototype.useAsInitialDataOf = function (tlview) {
  TL.compat.observe(this, 'entriesloaded', function (ev) {
    var ds = ev.target;
    tlview.timeline.appendTopLevelEntries(ev.newEntries);
    if (ds.nextElement) {
      tlview.addNextButton(ds.nextElement);
      tlview.timeline.setNextURL(ds.nextElement.href);
    } else if (ds.nextURL) {
      tlview.timeline.setNextURL(ds.nextURL);
    }
    if (ds.prevElement) {
      tlview.addPrevButton(ds.prevElement);
      tlview.timeline.setPrevURL(ds.prevElement.href);
    } else if (ds.prevURL) {
      tlview.timeline.setPrevURL(ds.prevURL);
    }
    if (ds.reloadElement) {
      tlview.addReloadPageButton(ds.reloadElement);
      tlview.setReloadPageURL(ds.reloadElement.href);
    }
  });
};

TL.DataSource.prototype.shouldCheckNewEntries = function () {
  return true;
};

TL.DataSource.FromElement = function (containerElement) {
  this.containerElement = containerElement;
};

TL.DataSource.FromElement.prototype = new TL.DataSource;

TL.DataSource.FromElement.prototype.loadData = function () {
  var entrySelectors = this.ENTRY_SELECTOR_TEXT;
  var outerEl = this.containerElement;
  var els = TL.compat.querySelectorAll(entrySelectors, outerEl);
  var entries = [];
  for (var i = 0; i < els.length; i++) {
    var entry = new TL.Entry(els[i]);
    entries.push(entry);
  }
  var self = this;
  self.nextElement = TL.compat.querySelector('.pager-older', outerEl);
  self.prevElement = TL.compat.querySelector('.pager-newer', outerEl);
  self.reloadElement = TL.compat.querySelector('.tl-pager-reload', outerEl);
  setTimeout(function () {
    var ev = new TL.Event('entriesloaded');
    ev.newEntries = entries;
    self.dispatchEvent(ev);
  }, 0);
};

TL.DataSource.TimelinePage = function (url) {
  this.url = this.urlFilter(url);
};

TL.DataSource.TimelinePage.prototype = new TL.DataSource;

TL.DataSource.TimelinePage.prototype.loadData = function () {
  var entrySelectors = this.ENTRY_SELECTOR_TEXT;
  var self = this;
  TL.compat.getPage(this.url, function (xhr) {
    var div = document.createElement('div');
    div.innerHTML = TL.compat.sanitizeHTMLFragment(xhr.responseText);
    var els = TL.compat.querySelectorAll(entrySelectors, div);
    var entries = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.parentNode.removeChild(el);
      TL.compat.reviveScripts(el);
      var entry = new TL.Entry(el);
      entries.push(entry);
    }
    self.nextElement = TL.compat.querySelector('.pager-older', div);
    self.prevElement = TL.compat.querySelector('.pager-newer', div);
    self.nextURL = xhr.getResponseHeader('X-Pager-Next-URL');
    self.prevURL = xhr.getResponseHeader('X-Pager-Prev-URL');
    self.reloadElement = TL.compat.querySelector('.tl-pager-reload', div);
    var ev = new TL.Event('entriesloaded');
    ev.newEntries = entries;
    self.dispatchEvent(ev);
  }, function () {
    self.dispatchEvent(new TL.Event('entryloadfailed'));
  });
};

TL.DataSource.TimelinePage.prototype.shouldCheckNewEntries = function () {
  return true;
};

TL.DataSource.EntryPage = function (url) {
  if (url) {
    this.url = this.urlFilter(url);
  }
};

TL.DataSource.EntryPage.prototype = new TL.DataSource;

TL.DataSource.EntryPage.prototype.loadData = function () {
  var entrySelectors = this.ENTRY_SELECTOR_TEXT;
  var self = this;
  TL.compat.getPage(this.url, function (xhr) {
    var div = document.createElement('div');
    div.innerHTML = TL.compat.sanitizeHTMLFragment(xhr.responseText);
    TL.compat.reviveScripts(div);
    var el = TL.compat.querySelector(entrySelectors, div);
    if (el) {
      var childInfos = self.extractChildEntryInfos(div);
      el.parentNode.removeChild(el);
      var entry = new TL.Entry(el);
      entry.getChildEntryInfos = function () { return childInfos };
      entry.isExpandable = function () { return true };
      var ev = new TL.Event('entriesloaded');
      ev.newEntries = [entry];
      self.dispatchEvent(ev);
    } else {
      self.dispatchEvent(new TL.Event('entryloadfailed'));
    }
    div = null;
  }, function () {
    self.dispatchEvent(new TL.Event('entryloadfailed'));
  });
};

TL.DataSource.EntryPage.prototype.CHILD_ENTRY_LINK_SELECTOR_TEXT = '.tl-reply-entry.tl-reply-not-extracted';

TL.DataSource.EntryPage.prototype.extractChildEntryInfos = function (div) {
  var els = TL.compat.querySelectorAll(this.CHILD_ENTRY_LINK_SELECTOR_TEXT, div);
  var list = [];
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    el.className = el.className.replace(/\btl-reply-not-extracted\b/, '');
    var author = el.getAttribute('data-tl-entry-author');
    var eid = el.getAttribute('data-tl-eid');
    if (author && eid) {
      list.push({authorURLName: author, eid: eid});
    } else {
      var url = el.href;
      if (url) {
        var m = url.match(/^https?:\/\/[^\/]+\/(?:touch\/|mobile\/)?([^\/]+)\/(?:[eh]\/)?([0-9]+)(?:$|\?)/);
        if (m) {
          list.push({authorURLName: m[1], eid: m[2]});
        }
      }
    }
  }
  return list;
};

TL.DataSource.EntryFragment = function (fragment) {
  this.div = document.createElement('div');
  this.div.innerHTML = fragment;
};

TL.DataSource.EntryFragment.prototype = new TL.DataSource.EntryPage;

TL.DataSource.EntryFragment.prototype.loadData = function () {
  var entrySelectors = this.ENTRY_SELECTOR_TEXT;
  var el = TL.compat.querySelector(entrySelectors, this.div);
  if (el) {
    var childInfos = this.extractChildEntryInfos(this.div);
    el.parentNode.removeChild(el);
    var entry = new TL.Entry(el);
    entry.getChildEntryInfos = function () { return childInfos };
    var ev = new TL.Event('entriesloaded');
    ev.newEntries = [entry];
    this.dispatchEvent(ev);
  }
  this.div = null;
};

TL.Logger = function () {
  var pre = document.createElement('pre');
  pre.style.display = 'block';
  try { pre.style.whiteSpace = 'pre-wrap' } catch (e) { }; // try for IE
  pre.style.background = 'white';
  pre.style.color = 'black';
  pre.style.textAlign = 'left';
  pre.style.overflow = 'hidden';
  this.element = pre;
  if (location.search.match(/use_logger=1/)) {
    document.body.appendChild(pre);
  }
};

TL.Logger.prototype.log = function (m) {
  this.element.appendChild(document.createTextNode(m + '\n'));
};

(function () {
  var logger = new TL.Logger;
  TL.log = function () {
    logger.log.apply(logger, arguments);
  };
})();

if (self.TenExtrasOnLoadFunctions) {
  for (var i = 0; i < self.TenExtrasOnLoadFunctions.length; i++) {
    self.TenExtrasOnLoadFunctions[i] ();
  }
  self.TenExtrasOnLoadFunctions = [];
}
/*

Ten Extras

Copyright 2009-2011 Hatena <http://www.hatena.com/>.

This library is free software; you may redistribute it and/or modify
it under the same terms as the Perl programming language.

*/
