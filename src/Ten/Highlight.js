/*
// require Ten.js
*/

/* Ten.Highlight */
Ten.Highlight = new Ten.Class({
    initialize: function(quote) {
        if (!quote) return;
        this.quote = quote;
        var c = this.constructor;
        if (!c._cache) c._cache = {};
        if (c._cache[quote]) return c._cache[quote];
        c._cache[quote] = this;
        c.makeTextNodes(c);
    },
    makeTextNodes: function(c) {
        if (c.textNodes || c.textNodePositions || c.documentText) return;
        if (Ten.Highlight.highlighted) Ten.Highlight.highlighted.hide();
        c.textNodes = [];
        c.textNodePositions = [];
        var isIE = navigator.userAgent.indexOf('MSIE') != -1;
        var texts = [];
        var pos = 0;
        (function(node, parent) {
            if (isIE && parent && parent != node.parentNode) return;
            if (node.nodeType == 3) {
                c.textNodes.push(node);
                texts.push(node.nodeValue);
                c.textNodePositions.push(pos);
                pos += node.nodeValue.length;
            } else {
                var childNodes = node.childNodes;
                for (var i = 0; i < childNodes.length; i++) {
                    arguments.callee(childNodes[i], node);
                }
            }
        })(document.body);
        c.documentText = texts.join('');
        c.loaded = true;
    },
    loaded: false,
    bgColors: null,
    textNodes: null,
    textNodePositions: null,
    documentText: null,
    highlighted: null,
    _cache: null,
    _lock: {},
    Color: new Ten.Color(255,255,0,0.4),
    ClassName: null
},{
    makeMatchedNodes: function() {
        if (this.matchedNodes) return;
        var matched = {};
        var c = this.constructor;
        var quote = this.quote;
        var nodes = c.textNodes, positions = c.textNodePositions, text = c.documentText;
        var i = 0;
        for (var start = text.indexOf(quote); start != -1;
             start = text.indexOf(quote, start + quote.length)) {
             var end = start + quote.length - 1;
             for (; i < positions.length; i++) {
                 if (end < positions[i]) {
                     break;
                 }
                 var last = positions[i+1] ? positions[i+1] - 1
                     : c.documentText.length;
                 if (last < start) {
                     continue;
                 } else if (start <= last) {
                     if (!matched[i]) matched[i] = {ranges: []};
                     var range = [];
                     range[0] = start - positions[i];
                     range[1] = end < last ? end - positions[i] + 1
                         : last - positions[i] + 1;
                     matched[i].ranges.push(range);
                 }
             }
             i--;
        }
        this.matchedNodes = matched;
    },
    show: function() {
        var c = this.constructor;
        if (!c.loaded) return;
        this.makeMatchedNodes();
        var matched = this.matchedNodes;
        if (!matched) return;
        if (Ten.Highlight.highlighted) Ten.Highlight.highlighted.hide();
        var nodes = c.textNodes;
        if (!this.containers) this.containers = {};
        var containers = this.containers;
        for (var i in matched) {
            if (!i.match(/^\d+$/)) continue;
            if (!this.containers[i]) {
                var node = nodes[i];
                if (!node) continue;
                var text = nodes[i].nodeValue;
                var container = document.createElement('span');
                container.style.padding = '0';
                container.style.margin = '0';
                var pos = 0;
                var ranges = matched[i].ranges;
                for (var j = 0; j < ranges.length; j++) {
                    var range = ranges[j];
                    if (pos < range[0]) {
                        container.appendChild(document.createTextNode(text.substring(pos,range[0])));
                    }
                    var span = this.createSpan(i);
                    if (!span) continue;
                    span.appendChild(document.createTextNode(text.substring(range[0],range[1])));
                    container.appendChild(span);
                    pos = range[1];
                }
                if (pos < text.length) container.appendChild(document.createTextNode(text.substring(pos)));
                this.containers[i] = container;
            }
            this.replaceNode(i,true);
        }
        Ten.Highlight.highlighted = this;
    },
    createSpan: function(i) {
        var c = this.constructor;
        if (!c.bgColors) c.bgColors = {};
        if (!c.bgColors[i]) {
            if (!c.textNodes[i]) return;
            var node = c.textNodes[i].parentNode;
            var back = Ten.Color.parseFromElementColor(node,'backgroundColor')
                || new Ten.Color(255,255,255);
            c.bgColors[i] = back.overlay(c.Color).asHexString();
        }
        var span = document.createElement('span');
        span.style.backgroundColor = c.bgColors[i];
        if (c.ClassName) span.className = c.ClassName;
        return span;
    },
    hide: function() {
        var matched = this.matchedNodes;
        if (!matched) return;
        Ten.Highlight.highlighted = null;
        var c = this.constructor;
        for (var i in matched) {
            if (!i.match(/^\d+$/)) continue;
            this.replaceNode(i,false);
        }
    },
    replaceNode: function(i, show) {
        var c = this.constructor;
        if (c._lock[i]) return;
        if (c.textNodes[i].parentNode && c.textNodes[i].parentNode.tagName.toLowerCase() == 'textarea') {
            return;
        }
        c._lock[i] = true;
        var newNode, oldNode;
        if (show) {
            newNode = this.containers[i], oldNode = c.textNodes[i];
        } else {
            newNode = c.textNodes[i], oldNode = this.containers[i];
        }
        if (newNode) Ten.DOM.replaceNode(newNode, oldNode);        
        c._lock[i] = false;
    },
    containers: null,
    matchedNodes: null
});
