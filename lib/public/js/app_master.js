ms.socket = io.connect('/master');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  console.log('master_connected');

  ms.socket.on('speakerCount', function(count) {
    ms.trigger('speakerCount', count);
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

ms.load = function(trackId){
  ms.socket.emit('load', trackId);
};

ms.play = function(trackId){
  ms.socket.emit('play', trackId);
};

ms.stop = function(trackId){
  ms.socket.emit('stop', trackId);
};

ms.allTracks(function(tracks) {
  console.log(tracks)
});


