ms.socket = io.connect('/master');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  console.log('master_connected');
});

ms.allTracks = function(cb){
  ms.socket.emit('allTracks', function(tracks) {
    cb(tracks)
  });
};

ms.load = function(trackId, cb){
  cb(null, {});
};

ms.play = function(trackId, cb){
  cb(null, {});
};

ms.stop = function(trackId, cb){
  cb(null, {});
};

ms.allTracks(function(tracks) {
  console.log(tracks)
});


