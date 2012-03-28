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

ms.querySC = function(q) {
  ms.socket.emit('querySC', q, function(tracks){
    var results = $('.soundcloud .results');
    results.empty();
    for(var i=0; i<tracks.length; i++) {
      var item = document.createElement('div');
      item.innerHTML = '<img src="'+tracks[i].artwork_url+'" width="70"><div class="name">'+tracks[i].title+'</div><div class="description">'+tracks[i].description+'</div><div class="btn">Select</div>';
     
      $(item).bind('click touchstart', _.bind(ms.loadTrack, null, tracks[i]));
      results.append(item);
      
    }
    //console.log(tracks);
  });
};

ms.loadTrack = function(track){
  ms.socket.emit('load', {
    id: track.id,
    name: track.title,
    artwork: track.artwork_url,
    duration: track.duration/1000,
    resources: ["", track.stream_url]
  }, function(){
    tracksList[track.id]=track;
    startTrack(track.id);
  });
}

function scsearch(){
  var str = document.getElementById('scq').value;
  if(str.length){
    ms.querySC(str);
  }
}