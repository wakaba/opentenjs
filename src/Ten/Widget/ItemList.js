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
