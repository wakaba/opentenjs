
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
