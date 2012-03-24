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


$(function() {
  $.extend(ms, {
      player: null,
//      startPlayer: function(event) {
//        ms.onQueuePayload({
//          track: 'greatsong',
//          spriteid: 'cajon-1',
//          timestamp: (new Date).getTime(),
//          type: 'play'
//        });
//
//        ms.onLoadTrack({
//          "id": 'greatsong',
//          "resources": [
//            'jukebox/demo/media/spritemap-cajon.ac3',
//            'jukebox/demo/media/spritemap-cajon.mp3',
//            'jukebox/demo/media/spritemap-cajon.m4a',
//            'jukebox/demo/media/spritemap-cajon.ogg',
//            // All mobiles support 3gp / amr. crappy codec, but cool fallback
//            'jukebox/demo/media/spritemap-cajon.amr'
//          ],
//          "spritemap": {
//            'cajon-1': {
//              'start': 0.00,
//              'end': 4.20
//            }
//          },
//          "spriteid": 'cajon-1'
//        });
//      },
      step: function() {
        var currentTime = ms.timesync.getTime();
        
        for (var i = 1, ln = ms.payloadQueue.length; i<ln; i++) {
          var payload = ms.payloadQueue[i];
          var diff = payload.timestamp - currentTime;
          if (diff < 30) {
            if (diff > 0) {
              while(true){ // uh, oh - blocking javascript!
                if(!(payload.timestamp - ms.timesync.getTime())) {
                  break;
                }
              }
              diff = 0;
            }
            if(payload.type=='play'){
              ms.trigger('play', payload.part, diff);
            }
            else if(payload.type=='stop'){
              ms.trigger('stop', diff);
            }
            ms.payloadQueue.done = true;
          }
        }
        while(ms.payloadQueue.length && payloadQueue[0].done) {
          ms.payLoadQueue.shift();
        }
        
      },
      /* Future callbacks */
      loadedTrack: null,
      payloadQueue: null,

      onLoadTrack: function(track){
        var audioReady = function() {
          ms.loadedTrack = track;
          ms.player.context.removeEventListener('canplaythrough', audioReady);
          // If queue exists then play track
          ms.payloadQueue && ms.playTrack();
        };

        ms.player.pause();
        ms.player.resource = jukebox.Manager.getPlayableResource(track.resources);
        for (var s in track) {
          ms.player.settings[s] = track[s];
        }
        ms.player.context.addEventListener('canplaythrough', audioReady);
        ms.player.context.src = ms.player.resource;
      },

      onQueuePayload: function(payload){
        if (ms.payloadQueue.length && ms.payloadQueue[0].timestamp < payload.timestamp) {
          ms.payloadQueue.shift();
        }
        ms.payloadQueue.push(payload);
      },
      
      

      playTrack: function() {
        var payload = ms.payloadQueue,
            track = ms.loadedTrack,
            player = ms.player;  

        // If right track is loaded
        if (payload.track === track.id && payload.spriteid === track.spriteid) {
          if (payload.type === "play") {
            // Implement payload.timestamp
            player.play(track.spriteid, true);
          }
          else {
            player.stop();
          }
        }
      }
    });
    
   // Sync time
   ms.timesync.bind('ready', function(){

   });

   // Start player callback
   // If success then backend fires loadtrack, payload events
   ms.bind('ready', function(){

   });

   ms.bind('error', function(){

   });

  // Inject track
  ms.bind('loadtrack', ms.onLoadTrack);

  // Play/stop event
  ms.bind('payload', ms.onQueuePayload);
  
  setInterval(function(){
    ms.step();
  }, 1);

  // Track loaded ready to play
  // Currently uses audio tag 'canplaythrough' in loadTrack
  // ms.bind('loaded', ms.playTrack);

  ms.player = new jukebox.Player({
    resources: [
      'jukebox/demo/media/spritemap-cajon.ac3',
      'jukebox/demo/media/spritemap-cajon.mp3',
      'jukebox/demo/media/spritemap-cajon.m4a',
      'jukebox/demo/media/spritemap-cajon.ogg',
      // All mobiles support 3gp / amr. crappy codec, but cool fallback
      'jukebox/demo/media/spritemap-cajon.amr'
    ],

    spritemap: {
      'cajon-1': {
        'start': 0.00,
        'end': 4.20
      }
    }
  });

  $("#play").click(function(e) {
    ms.startPlayer(e);
  });
  
  setInterval(ms.stepper, 100);
});