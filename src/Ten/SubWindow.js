/*
// require Ten.js
*/

/* Ten.SubWindow */
Ten.SubWindow = new Ten.Class({
    initialize: function(args) {
        var c = this.constructor;
        if (c.singleton && c._cache) {
            return c._cache;
        }
        if (args) {
            for (var k in args) {
                this[k] = args[k];
            }
        }
        var div = document.createElement('div');
        Ten.Style.applyStyle(div, Ten.SubWindow._baseStyle);
        Ten.Style.applyStyle(div, c.style);
        this.window = div;
        this.addContainerAndCloseButton();
        document.body.appendChild(div);
        if (c.draggable) {
            this._draggable = new Ten.Draggable(div, this.handle);
        }
        if (c.singleton) c._cache = this;
        return this;
    },
    _baseStyle: {
        color: '#000',
        position: 'absolute',
        display: 'none',
        zIndex: 10002,
        left: 0,
        top: 0,
        backgroundColor: '#fff',
        border: '1px solid #bbb'
    },
    style: {
        padding: '2px',
        textAlign: 'center',
        borderRadius: '6px',
        MozBorderRadius: '6px',
        width: '100px',
        height: '100px'
    },
    handleStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundColor: '#f3f3f3',
        borderBottom: '1px solid #bbb',
        width: '100%',
        height: '30px'
    },
    containerStyle: {
        margin: '32px 0 0 0',
        padding: '0 10px'
    },
    // closeButton: 'close.gif',
    closeButton: 'http://s.hatena.com/images/close.gif',
    closeButtonStyle: {
        position: 'absolute',
        top: '8px',
        right: '10px',
        cursor: 'pointer'
    },
    _baseScreenStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        display: 'none',
        zIndex: 10001,
        overflow: 'hidden',
        width: '100%',
        height: '100%'
    },
    screenStyle: {},
    showScreen: true,
    singleton: true,
    draggable: true,
    _cache: null
},{
    screen: null,
    windowObserver: null,
    visible: false,
    addContainerAndCloseButton: function() {
        var win = this.window;
        var c = this.constructor;
        var div = document.createElement('div');
        win.appendChild(div);
        Ten.Style.applyStyle(div, c.containerStyle);
        this.container = div;
        if (c.handleStyle) {
            var handle = document.createElement('div');
            Ten.Style.applyStyle(handle, c.handleStyle);
            win.appendChild(handle);
            this.handle = handle;
        }
        if (c.closeButton) {
	    var btn = document.createElement('img');
            btn.src = c.closeButton;
            btn.alt = 'close';
            Ten.Style.applyStyle(btn, c.closeButtonStyle);
            win.appendChild(btn);
            new Ten.Observer(btn, 'onclick', this, 'hide');
            this.closeButton = btn;
        }
        if (c.showScreen) {
            var screen = document.createElement('div');
            Ten.Style.applyStyle(screen, Ten.SubWindow._baseScreenStyle);
            Ten.Style.applyStyle(screen, c.screenStyle);
            document.body.appendChild(screen);
            this.screen = screen;
            new Ten.Observer(screen, 'onclick', this, 'hide');
        }
    },
    show: function(pos) {
        pos = (pos.x && pos.y) ? pos : {x:0, y:0};
        var s = this.window.style;
        s.display = 'block';
        s.left = pos.x + 'px';
        s.top = pos.y + 'px';
        if (this.screen) {
            var ss = this.screen.style;
            ss.display = 'block';
            ss.left = Ten.Geometry.getScroll().x + 'px';
            ss.top = Ten.Geometry.getScroll().y + 'px';
        }
        this.windowObserver = new Ten.Observer(document.body, 'onkeypress', this, 'handleEscape');
        this.visible = true;
    },
    handleEscape: function(e) {
        if (!e.isKey('escape')) return;
        this.hide();
        e.stop();
    },
    hide: function() {
        if (this._draggable) this._draggable.endDrag();
        this.window.style.display = 'none';
        if (this.screen) this.screen.style.display = 'none';
        if (this.windowObserver) this.windowObserver.stop();
        this.visible = false;
        this.window.blur();
    }
});

/* Ten.Draggable */
Ten.Draggable = new Ten.Class({
    initialize: function(element,handle) {
        this.element = element;
        this.handle = handle || element;
        this.startObserver = new Ten.Observer(this.handle, 'onmousedown', this, 'startDrag');
        this.handlers = [];
    }
},{
    startDrag: function(e) {
        if (e.targetIsFormElements()) return;
        this.delta = Ten.Position.subtract(
            e.mousePosition(),
            Ten.Geometry.getElementPosition(this.element)
        );
        this.handlers = [
            new Ten.Observer(document, 'onmousemove', this, 'drag'),
            new Ten.Observer(document, 'onmouseup', this, 'endDrag'),
            new Ten.Observer(this.element, 'onlosecapture', this, 'endDrag')
        ];
        e.stop();
    },
    drag: function(e) {
        var pos = Ten.Position.subtract(e.mousePosition(), this.delta);
        Ten.Style.applyStyle(this.element, {
            left: pos.x + 'px',
            top: pos.y + 'px'
        });
        e.stop();
    },
    endDrag: function(e) {
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i].stop();
        }
        if(e) e.stop();
    }
});
