ms.socket = io.connect('/master');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  console.log('master_connected');

  ms.socket.on('speakerCount', function(count) {
    //console.log('speakerCount', arguments);
    ms.trigger('speakerCount', count);
  });

  ms.socket.on('loadedCount', function(count) {
    //console.log('loadedCount', arguments);
    ms.trigger('loadedCount', count);
  });

  ms.socket.on('loaded', function(trackId) {
    ms.trigger('loaded', trackId);
  });
  
  ms.socket.on('disconnect', function(){
    setTimeout(function(){
    window.location.reload();
    }, 500);
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

