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
