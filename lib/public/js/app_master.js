ms.socket = io.connect('/master');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  console.log('master_connected');
});


ms.allTracks = function(cb){
  cb([
    {'id': 'song1', 'name': 'Bla', 'urls': ['asd','asdasd']},
    {'id': 'song2', 'name': 'Bla2', 'urls': ['asd332','asdasd']}
  ]);
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




