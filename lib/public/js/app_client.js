ms.socket = io.connect('/client');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});
  ms.socket.on('speakerCount', function(count) {
    ms.trigger('speakerCount', count)
  });

  ms.socket.on('payload', function(payload) {
    ms.trigger('payload', payload);
  });


  ms.socket.on('load', function(track) {
    ms.trigger('loadtrack', track);
  });
})

ms.ready = function(trackId){
  ms.socket.emit('loaded', trackId);
};


$(function() {
  _.extend(ms, {
    player: null,
    timeSyncReady: false,
    loadedTrack: null,
    payloadQueue: [],
    
    startPlayer: function() {
      // Create player with dummy content
      ms.player = new jukebox.Player({
        // Silence!! Infidel!!
        resources: [
          "http://commondatastorage.googleapis.com/megaspeaker/silence.mp3",  
          "http://commondatastorage.googleapis.com/megaspeaker/silence.ogg",
          "http://commondatastorage.googleapis.com/megaspeaker/silence.caf"
        ],

        spritemap: {
          'silence': {
            'start': 0.00,
            'end': 5.00
          }
        },
        autoplay: 'silence'
      });
      ms.trigger("ready");
    },

    step: function() {
      if(!ms.loaded){
        return;
      }
      
      var currentTime = ms.timesync.getTime();
      for (var i = 0, ln = ms.payloadQueue.length; i<ln; i++) {
        var payload = ms.payloadQueue[i];
        var diff = payload.timestamp - currentTime;
        if (diff < 30) {
          if (diff > 0) {
            while(true){ // uh, oh - blocking javascript!
              if(0 >= (payload.timestamp - ms.timesync.getTime())) {
                break;
              }
            }
            diff = 0;
          }
          if(payload.type=='play'){
            ms.playTime = ms.timesync.getTime();
            ms.playOffset = -diff;
            ms.playing = true;
            console.log('play '+ diff+' '+(payload.timestamp - ms.timesync.getTime())+' '+ms.timesync.getTime());
            ms.trigger('play', payload.part, -diff);
          }
          else if(payload.type=='stop'){
            ms.trigger('stop', -diff);
            ms.playing = false;
          }
          ms.payloadQueue[i].done = true;
        }
      }
      while(ms.payloadQueue.length && ms.payloadQueue[0].done) {
        ms.payloadQueue.shift();
      }
    },
    
    // Load track
    onLoadTrack: function(track){
      console.log('loaded', arguments);
      ms.loaded = false;
      var audioReady = function() {
        console.log('audio is ready');
        ms.player.context.removeEventListener('canplaythrough', audioReady);
        track.loaded = true;
        ms.loadedTrack = track;
        ms.loaded = true;
        ms.trigger("loaded", track);
      };
      ms.player.pause();
      //ms.player.pause();
      ms.player.resource = jukebox.Manager.getPlayableResource(track.resources);
      for (var s in track) {
        ms.player.settings[s] = track[s];
      }
      ms.player.context.addEventListener('canplaythrough', audioReady);
      ms.player.context.src = ms.player.resource;
      console.log('src='+ ms.player.resource);
    },
    
    onQueuePayload: function(payload){
      console.log('payload', arguments);
      if (ms.payloadQueue.length && ms.payloadQueue[0].timestamp < payload.timestamp) {
        ms.payloadQueue.shift();
      }
      ms.payloadQueue.push(payload);
    },

    playTrack: function(spriteid, offset) {
      var track = ms.loadedTrack;
      
      if (!ms.timeSyncReady || !track || track && !track.spritemap[spriteid]) {
        return;
      }
      var pos = ms.player.settings["spritemap"][spriteid].start;
      if (offset) {
        pos += offset/1000;
      }
      ms.playOffset = pos;
      ms.player.play(pos, true);
      //console.log('playTrack '+spriteid+' '+(ms.timesync.getTime())+'');
    },
    
    stopTrack: function(){
      ms.player.pause();
    }
  });

  // Player started
  ms.bind('ready', function() {
    $("#play").html("Waiting...");
    /*
    ms.trigger("loadtrack", {
      track: 'plapla',
      resources: [
        "http://commondatastorage.googleapis.com/megaspeaker/Kenny_Dope_Live1.mp3",
        "http://commondatastorage.googleapis.com/megaspeaker/Kenny_Dope_Live1.caf",
        "http://commondatastorage.googleapis.com/megaspeaker/Kenny_Dope_Live1.ogg"
      ],
      spritemap: {
        'test1': {
          'start': 0.00,
          'end': 47.00
        }
      },
      spriteid: 'test1'
    });*/
    
    
  });
  
  // Track loaded
  ms.bind('loaded', function() {
    //ms.trigger("play", "test1", 30000);
  });
  
  // Inject track
  ms.bind('loadtrack', ms.onLoadTrack);
  
  // Add payload to queue
  ms.bind('payload', ms.onQueuePayload);

  // Play request
  ms.bind('play', ms.playTrack);
  
  ms.bind('stop', ms.stopTrack);
  
  // Sync time
  ms.timesync.bind('ready', function() {
     ms.timeSyncReady = true;
  });
  setInterval(_.bind(ms.step,ms), 1);
  
  setInterval(function(){
    if(ms.playing){
      console.log((ms.player.context.currentTime-ms.playOffset)*1000 - (ms.timesync.getTime()-ms.playTime));
    }
  },1000);
  
  
  
  window.addEventListener('pagehide', function(){
    if(typeof window.pagehide=="undefined"){
      window.pagehide = 1;
    }
    ms.player.pause();
  });
  
  
  window.addEventListener('pageshow', function(){
    if(window.pagehide) {
      ms.player.pause();
      window.location.reload();
    }
  });
  
  $("#play").on('mousedown',$.proxy(ms.startPlayer, ms));
  $("#play").on('touchstart',$.proxy(ms.startPlayer, ms));
    
}, ms);