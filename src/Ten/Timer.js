/* Ten.Timer */
Ten.Timer = new Ten.Class({
  base: [Ten.EventDispatcher],
  initialize: function(intarval, repeatCount) {
    this.constructor.SUPER.call(this);
    this.currentCount = 0;
    this.intarval = intarval || 60; // ms
    this.repeatCount = repeatCount || 0;
  }
}, {
  start: function() {
    this.running = true;
    var self = this;
    setTimeout(function() {
      self.loop();
    }, self.intarval);
  },
  reset: function() {
    this.stop();
    this.currentCount = 0;
  },
  loop: function() {
    if (!this.running) return;
    this.currentCount++;
    if (this.repeatCount && this.currentCount >= this.repeatCount) {
      this.stop();
      this.dispatchEvent('timer');
      this.dispatchEvent('timerComplete');
      return;
    }
    var self = this;
    this.dispatchEvent('timer', this.currentCount);
    setTimeout(function() {
      self.loop();
    }, self.intarval);
  },
  stop: function() {
    this.running = false;
  }
});
