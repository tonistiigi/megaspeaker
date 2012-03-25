ms.socket = io.connect('/master');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  console.log('master_connected');

  ms.socket.on('speakerCount', function(count) {
    ms.trigger('speakerCount', count);
  });

  ms.socket.on('loadedCount', function(count) {
    ms.trigger('loadedCount', count);
  });

  ms.socket.on('loaded', function(trackId) {
    ms.trigger('loaded', trackId);
  });

});

ms.allTracks = function(cb){
  ms.socket.emit('allTracks', function(tracks) {
    cb(tracks)
  });
};

ms.load = function(trackId, cb){
  ms.socket.emit('load', trackId, cb);
};

ms.play = function(trackId, cb){
  ms.socket.emit('play', trackId, cb);
};

ms.stop = function(trackId, cb){
  ms.socket.emit('stop', trackId, cb);
};

