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
