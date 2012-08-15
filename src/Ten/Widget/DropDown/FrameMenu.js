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
