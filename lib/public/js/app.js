/*

#Low level API:

ms.timesync.getTime()

Events:
ms.timesync.bind('error', function(){

});
ms.timesync.bind('ready', function(){

});


#High level

ms.startPlayer(mouseEvent);
ms.bind('ready', function(){
  
});
ms.bind('error', function(){


});
ms.bind('loadtrack', function(track){
  track = {
    'id': 'greatsong',
    'urls': [],
    'spritemap': {},
    'autoplay': 'part'
  };
  ms.loadTrack(track);
})

ms.bind('payload', function(payload){
  payload = {
    track: ''
    type: 'play|stop',
    timestamp: '',
    part: ''
  }
  ms.queuePayload(payload);
});

ms.bind('loaded', function(){

});

ms.bind('progress', function() {

});



*/