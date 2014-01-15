window.Honeycomb = {};

Honeycomb.Mouse = (function() {
  function Mouse(el, e) {
    this.el = el;
    this.event = e;
    this.x = e.pageX;
    this.y = e.pageY;
  };

  Mouse.prototype = {
    track: function() {
      this.el.addEventListener('mousemove', this.update.bind(this))
      return this;
    },
    removeTracking: function() {
      this.el.removeEventListener('mousemove', this.update.bind(this))
    },
    update: function(e) {
      this.x = e.pageX;
      this.y = e.pageY;
    },
    compare: function(mouse) {
      return Math.sqrt(
        Math.pow(this.x - mouse.x, 2) +
        Math.pow(this.y - mouse.y, 2)
      );
    }
  };

  return Mouse;
})();

Honeycomb.Hover = (function() {
  var self, outIntent, overIntent;

  function Hover(el, options) {
    self = this;
    this.el          = el;
    this.timeout     = null;
    this.overDelay   = options.overDelay || this.defaults.overDelay;
    this.outDelay    = options.outDelay || this.defaults.outDelay;
    this.sensitivity = options.sensitivity || this.defaults.sensitivity;

    this.el.addEventListener('mouseover', overIntent);
    this.el.addEventListener('mouseout', outIntent);
  }

 Hover.prototype.off = function() {
   this.el.removeEventListener('mouseover', overIntent);
   this.el.removeEventListener('mouseout', outIntent);
 };

 Hover.prototype.defaults = {
   sensitivity: 7,
   overDelay: 100,
   outDelay: 0,
 };

 // FIXME hoverIn will fire twice if you do not trigger the outintent and then
 // come back into the region.

 outIntent = function(e) {
   clearTimeout(self.timeout);

   self.timeout = setTimeout(function() {
     var hoverEvent = new CustomEvent('hoverout', { bubble: true, cancellable: true })
     self.el.dispatchEvent(hoverEvent)
   }, self.outDelay);
 };

 overIntent = function(e) {
   var originalOverPosition = new Honeycomb.Mouse(self.el, e),
       trackedPosition      = new Honeycomb.Mouse(self.el, e).track(),
       _attempt, _setIntentionDelay;

   _attempt = function() {
     var mouseMovement = originalOverPosition.compare(trackedPosition), hoverEvent;

     if (self.sensitivity > mouseMovement) {
       hoverEvent = new CustomEvent('hoverin', { bubble: true, cancellable: true })
       self.el.dispatchEvent(hoverEvent)

     } else {
       originalOverPosition.x = trackedPosition.x
       originalOverPosition.y = trackedPosition.y

       _setIntentionDelay();
     }
   }
    _setIntentionDelay = function() {
      clearTimeout(self.timeout);
      self.timeout = setTimeout(_attempt, self.overDelay);
    }

    _setIntentionDelay();
    trackedPosition.removeTracking();
  };

  return Hover;
}());