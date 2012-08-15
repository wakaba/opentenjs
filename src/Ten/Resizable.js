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
