(function() {

  var sendHeart = function() {
    var self = this;
    console.log(self);
    var heartEl = document.querySelector('.heart');

    heartEl.onmouseover = function() {
      self.socket.emit('light it up', 'I AM HERE');
    };
  };

  var init = function() {
    var self = this;
    self.socket.on('init', function(data) {
      console.log(data);
    });

    self.socket.on('more light', function(data) {
      console.log('there was more light!', data);
    });
    sendHeart.call(self);
  };

  var createApp = function(prototype) {
    return prototype;
  };

  /* global io */
  var appPrototype = {
    init: init,
    socket: io()
  };
  var app = createApp(appPrototype);

  window.addEventListener('load', app.init.bind(app), false);

})();
