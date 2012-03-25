ms.socket = io.connect('/client');
ms.socket.on('connect', function(){
  ms.socket.emit('register', {'channel': ms.channel});

  ms.socket.on('speakerCount', function(count) {
    //console.log('speakerCount', arguments);
    ms.trigger('speakerCount', count)
  });

  ms.socket.on('payload', function(payload) {
    //console.log('payload', arguments);
    ms.trigger('payload', payload);
  });

  ms.socket.on('loadedCount', function(count) {
    //console.log('loadedCount', arguments);
    ms.trigger('loadedCount', count);
  });

  ms.socket.on('load', function(track) {
    //console.log('payload', arguments);
    ms.trigger('loadtrack', track);
  });
})

ms.ready = function(trackId){
  ms.socket.emit('loaded', trackId);
};

$(function() {
  _.extend(ms, {
    player: null,
    loadedTrack: null,
    payloadQueue: [],

    startPlayer: function() {
      // Create player with dummy content
      ms.player = new jukebox.Player({
        // Silence!! Infidel!!
        resources: [
          "http://commondatastorage.googleapis.com/megaspeaker/silence.caf",
          "http://commondatastorage.googleapis.com/megaspeaker/silence.mp3",
          "http://commondatastorage.googleapis.com/megaspeaker/silence.ogg"
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
      if(!ms.loaded || !ms.timesynced){
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
            ms.playTrack(payload.part, -diff);
            //ms.trigger('play', payload.part, -diff);
            //console.log('play '+ diff+' '+(payload.timestamp - ms.timesync.getTime())+' '+ms.timesync.getTime());
          }
          else if(payload.type=='stop'){
            ms.stopTrack();
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
      //console.log('loaded ' + JSON.stringify(arguments));
      ms.payloadQueue = [];
      ms.loaded = false;
      ms.isloading = true;
      ms.track = track;
      ms.audioReady = function() {
        ms.isloading = false;
        //console.log('audio is ready');
        //ms.player.context.removeEventListener('canplaythrough', audioReady);
        track.loaded = true;
        ms.loadedTrack = track;
        ms.loaded = true;
        ms.trigger("loaded", track);
      };
      // If player not ready
      if (!ms.player) {
        return ;
      }

      ms.player.pause();
      ms.player.resource = jukebox.Manager.getPlayableResource(track.resources);
      for (var s in track) {
        ms.player.settings[s] = track[s];
      }
      //ms.player.context.addEventListener('canplaythrough', audioReady);
      ms.player.context.src = ms.player.resource;
      //console.log('src='+ ms.player.resource);
    },

    onQueuePayload: function(payload){
      //console.log('payload ' +payload.track);
      if (ms.payloadQueue.length && ms.payloadQueue[0].timestamp < payload.timestamp) {
        ms.payloadQueue.shift();
      }
      ms.payloadQueue.push(payload);
    },

    playTrack: function(spriteid, offset) {
      var track = ms.loadedTrack;
      if (!ms.player || !track || track && !track.spritemap[spriteid]) {
        return;
      }
      var pos = ms.player.settings["spritemap"][spriteid].start;
      if (offset) {
        pos += offset/1000;
      }
      ms.playOffset = pos;
      ms.player.play(pos, true);

      // Animate speaker
      $("#speaker-animation").show();
      $("#loading").hide();
      // Update treack time left
      ms.trackInterval = setInterval(function() {
        if (ms.player) {
          $("#time").html(ms.formatDuration(ms.player.context));
          if (ms.player.context.duration === ms.player.context.currentTime) {
            clearInterval(ms.trackInterval);
            ms.stopTrack();
          }
        }
      }, 1000);
      //console.log('playTrack '+spriteid+' '+(ms.timesync.getTime())+'');
    },

    stopTrack: function(){
      $("#speaker-animation").hide();
      clearInterval(ms.trackInterval);
      ms.player && ms.player.pause();
      ms.payloadQueue = [];

      $("#speaker-on").show();
      $("#speaker-animation").hide();

      // Fallback to reload
      document.location.reload();
    },

    updateSpeakerCount: function(total) {
      console.log("total: " + total);
      $("#totalSpeakers").html(total);
    },

    updateLoadedCount: function(loaded) {
      console.log("loaded: "+loaded);
      $("#readySpeakers").html(loaded);
    },

    formatDuration: function(music) {
      var timeLeft = music.duration-music.currentTime,
          tcMins = parseInt(timeLeft/60),
          tcSecs = parseInt(timeLeft - (tcMins * 60));

      if (isNaN(tcMins) || isNaN(tcSecs)) {
        return '';

      }
      if (tcSecs < 10) {
        tcSecs = '0' + tcSecs;
      }

      return tcMins + ':' + tcSecs;
    },

    pauseTrack: function() {

    }
  });

  // Player started
  ms.on('ready', function() {
    ms.socket.emit('playerReady');
    $("#playBtn").hide();
    $("#speaker-on").show();
  });

  // Track loaded
  ms.on('loaded', function(track) {
    $("#title").html(track.name);
    $("#time").html(ms.formatDuration(ms.player.context));
  });

  // Inject track
  ms.on('loadtrack', ms.onLoadTrack);

  // Add payload to queue
  ms.on('payload', ms.onQueuePayload);

  ms.on("speakerCount", ms.updateSpeakerCount);
  ms.on("loadedCount", ms.updateLoadedCount);

  setInterval(_.bind(ms.step,ms), 1);

  ms.errors = 0;

  setInterval(function(){
    if(ms.playing && ms.player){
      diff = (ms.player.context.currentTime-ms.playOffset)*1000 - (ms.timesync.getTime()-ms.playTime) + ms.deviceLatency;
      //console.log('latency '+(diff-ms.deviceLatency));
      if(diff > 0 || diff < -400){
        ms.errors++;
        if(ms.errors>5){
          ms.playing = false;
          ms.player.pause();
          //window.location.reload();
        }
        ms.player.play((ms.playOffset*1000+(ms.timesync.getTime()-ms.playTime)-ms.deviceLatency)/1000,true);
        //ms.player.play(ms.player.context.currentTime + diff/1000,true);
        //console.log('corrected ' + ms.playOffset+ ' ' + ms.timesync.getTime() +' ' + ms.playTime+' ' +ms.deviceLatency+' ' + (ms.playOffset*1000+(ms.timesync.getTime()-ms.playTime)-ms.deviceLatency)/1000);
      }
    }

    if(ms.player && ms.isloading && !ms.loaded){
      //console.log((ms.player.context.readyState == 4)+' '+(ms.player.context.buffered.length)+' '+ (ms.player.context.buffered.end(0))+' '+ (ms.track.duration));
      try {
      //console.log((ms.player.context.readyState == 4)+' '+(ms.player.context.buffered.length)+' '+ (ms.player.context.buffered.end(0))+' '+ (ms.track.duration));
      $("#loading").show().html(Math.round(100*(ms.player.context.buffered.end(0) / (ms.track.duration+1))));
        if(ms.player.context.readyState == 4 && ms.player.context.buffered.length && ms.player.context.buffered.end(0) >= ms.track.duration){
          //console.log('audio was ready');
          ms.audioReady();
        }
      } catch(e) {
        ms.audioReady();
      }
    }
  }, 1000);

  window.addEventListener('pageshow', function(){
    if(window.pagehide) {
      ms.player.pause();
      window.location.reload();
    }
  });

  $("#playBtn").on('mousedown', _.bind(ms.startPlayer, ms));
  $("#playBtn").on('touchstart', _.bind(ms.startPlayer, ms));
}, ms);
