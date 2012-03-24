ms.socket = io.connect('/client');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});

  ms.socket.on('speakerCount', function(count) {
    ms.trigger('speakerCount', count)
  });

  ms.socket.on('play', function(trackId) {
    ms.trigger('play', trackId);
  });

  ms.socket.on('stop', function(trackId) {
    ms.trigger('stop', trackId);
  });

  ms.socket.on('load', function(track) {
    ms.trigger('load', track);
  });
})

ms.ready = function(trackId){
  ms.socket.emit('loaded', trackId);
};


