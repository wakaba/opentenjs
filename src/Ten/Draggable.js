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
