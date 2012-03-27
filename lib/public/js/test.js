$(function(){
  
  var agent = window.navigator.userAgent;
  var ua = {};
  ua.webkit = /webkit/i.test(agent);
  ua.chrome = /chrome/i.test(agent);
  ua.safari = !ua.chrome && /safari/i.test(agent);
  ua.moz = /firefox/i.test(agent);
  ua.ie = /MSIE/i.test(agent);
  ua.ios = /ipad|iphone|ipad/i.test(agent);
  ua.iphone = /iphone|ipad/i.test(agent);
  ua.ipad = /ipad/i.test(agent);
  ua.android = /android/i.test(agent);
  ua.winmo = /iemobile/i.test(agent);
  
  var spkr = null;
  
  function log(){
    var div = document.createElement('div');
    div.innerHTML = [].slice.apply(arguments).join(' ');
    var log = $('#log')[0];
    if(log.firstChild)
      log.insertBefore(div, log.firstChild);
    else
      log.appendChild(div);
  }
  
  function onLoad1(e){
    log('load1');
    var file = "http://commondatastorage.googleapis.com/megaspeaker/dtb.mp3";
    if(spkr){
      spkr.loadFile(file, 56);
    }
    else {
      spkr = new Spkr(e, file, 56);
      spkr.setAutoCorrect(true);
    }
  }
  function onLoad2(){
    log('load2');
    setTimeout(function(){
      spkr.loadFile("http://commondatastorage.googleapis.com/megaspeaker/gb.mp3", 60);
    }, 1000);
  }
  function onPlay(){
    setTimeout(function(){
      spkr.play();
    }, 1);
  }
  function onPause(){
    setTimeout(function(){
      spkr.pause();
    }, 1);
  }
  function onReplay(){
    setTimeout(function(){
      spkr.playAt(0);
    }, 1);
  }
  function onSet(){
    setTimeout(function(){
      spkr.playAt(1, false, 200);
    }, 1);
  }
  function onLog1(){
    
  }  
  function onLog2(){
    
  }
  function onIncr(){
    spkr.correctLatency(50);
  }
  function onDecr(){
    spkr.correctLatency(-50);
  }
  
  var Spkr = function(e, src, duration){
    if (!e instanceof MouseEvent) {
      throw('No mouse event given');
    }
    this.file = null;
    
    _.bindAll(this, 'step', 'onCanPlayThrough', 'setCurrentTimeAsync');
    
      
    this.latencyStats = new Stats();
    this.firstLatency = new Stats();
    this.lastLatency = [];
    
    if (ua.chrome) {
      this.firstLatency.push(50);
      this.latencyStats.push(50);
    }
    else if (ua.safari) {
      this.firstLatency.push(150);
      this.latencyStats.push(150);
    }
    else if (ua.iphone) {
      this.firstLatency.push(300);
      this.latencyStats.push(180);
    }
    else if (ua.ipad) {
      this.firstLatency.push(180);
      this.latencyStats.push(130);
    }
    else if (ua.android) {
      this.firstLatency.push(200);
      this.latencyStats.push(200);
    }
    else if (ua.winmo) {
      this.firstLatency.push(750);
      this.latencyStats.push(0);
    }
    
    setInterval(this.step, 50);
    
    this.audio = document.createElement('audio');
    this.autoCorrect = false;
    
    this.audio.addEventListener('loadstart', function(){ log('EVT', 'loadstart'); }, true);
    this.audio.addEventListener('progress', function(){ log('EVT', 'progress'); }, true);
    this.audio.addEventListener('suspend', function(){ log('EVT', 'suspend'); }, true);
    this.audio.addEventListener('abort', function(){ log('EVT', 'abort'); }, true);
    this.audio.addEventListener('error', function(){ log('EVT', 'error'); }, true);
    this.audio.addEventListener('emptied', function(){ log('EVT', 'emptied'); }, true);
    //this.audio.addEventListener('stalled', function(){ log('EVT', 'stalled'); }, true);
    this.audio.addEventListener('loadedmetadata', function(){ log('EVT', 'loadedmetadata'); }, true);
    this.audio.addEventListener('loadeddata', function(){ log('EVT', 'loadeddata'); }, true);
    this.audio.addEventListener('canplay', function(){ log('EVT', 'canplay'); }, true);
    this.audio.addEventListener('canplaythrough', function(){ log('EVT', 'canplaythrough'); }, true);
    //this.audio.addEventListener('playing', function(){ log('EVT', 'playing'); }, true);
    this.audio.addEventListener('seeking', function(){ log('EVT', 'seeking'); }, true);
    this.audio.addEventListener('seeked', function(){ log('EVT', 'seeked'); }, true);
    //this.audio.addEventListener('ended', function(){ log('EVT', 'ended'); }, true);
    this.audio.addEventListener('waiting', function(){ log('EVT', 'waiting'); }, true);
    this.audio.addEventListener('durationchange', function(){ log('EVT', 'durationchange'); }, true);
    //this.audio.addEventListener('timeupdate', function(){ log('EVT', 'timeupdate'); }, true);
    //this.audio.addEventListener('play', function(){ log('EVT', 'play'); }, true);
    //this.audio.addEventListener('pause', function(){ log('EVT', 'pause'); }, true);
    this.audio.addEventListener('ratechange', function(){ log('EVT', 'ratechange'); }, true);
    this.audio.addEventListener('volumechange', function(){ log('EVT', 'volumechange'); }, true);
    
    this.audio.addEventListener('ended', this.onEnded, true);
    
    this.audio.addEventListener('play', this.onPlay, true);
    this.audio.addEventListener('pause', this.onPause, true);
    
    //var self = this;
    //this.audio.addEventListener('timeupdate', function(){
    //  self.timeupdate = +new Date();
    //}, true);
    
    
    this.loadFile(src);
    
  };
  
  _.extend(Spkr.prototype, {
    STATE_LOADING_START: 1,
    onPlay: function(){
      this.audioPlaying = true;
    },
    onPause: function(){
      this.audioPlaying = false;
    },
    loadFile: function(src, duration){
      /*
      // network state
      const unsigned short NETWORK_EMPTY = 0;
      const unsigned short NETWORK_IDLE = 1;
      const unsigned short NETWORK_LOADING = 2;
      const unsigned short NETWORK_NO_SOURCE = 3;
      */
      this.networkState = null;
      /*
      // ready state
      const unsigned short HAVE_NOTHING = 0;
      const unsigned short HAVE_METADATA = 1;
      const unsigned short HAVE_CURRENT_DATA = 2;
      const unsigned short HAVE_FUTURE_DATA = 3;
      const unsigned short HAVE_ENOUGH_DATA = 4;
      */
      this.readyState = null;
      this.buffers = 0;
      this.bufferedFrom = null;
      this.bufferedUntil = null;
      this.duration = null;

      
      this.playing = false;
      this.audio.pause();
      this.audio.loop = false;
      this.audio.preload = 'auto';
      this.audio.autoplay = false;
      this.audio.setAttribute('src', src + '?' + Math.random());
      this.audio.addEventListener('canplaythrough', this.onCanPlayThrough, true);
      this.audio.load();
      this.audio.pause();
      this.ready = false;
      this.loading = true;
      this.dur = duration;
      this.playCount = 0;
      var parts = src.split('/');
      $("#url").text(parts[parts.length - 1]);
      $("#loaded").text(0);
    },
    onEnded: function(){
      log('EVT', 'ended');
      this.pause();
    },
    onCanPlayThrough: function(){
      if (this.loading) {
        this.audio.addEventListener('canplaythrough', this.onCanPlayThrough, true);
        this.ready = true;
        $("#loaded").text(1);
        this.audio.pause();
      }
    },
    setAutoCorrect: function(bool){
      this.autoCorrect = !!bool;
    },
    play: function() {
      this.playAt(parseFloat(this.audio.currentTime.toFixed(2)), false, 300);
    },
    playAt: function(position, correction, expectedLatency){
      if(this.numCorrections > 15) {
        this.pause();
      }
      this.playCount++;
      this.playTime = +new Date();
      this.playPosition = position;
      if(!correction) {
        this.trackTime = this.playTime;
        this.trackPosition = this.playPosition;
        this.expectedLatency = parseInt(expectedLatency);
        this.numCorrections=0;
      }
      var self = this;
      var setTime = this.setCurrentTimeAsync(position, function(){
        self.playing = true;
        self.fixedLatency = null;
        self.lastLatency = [];
        log('setTime',position);
        self.audio.play();
        $("#playtime").text(self.playTime);
      });
    },
    pause: function() {
      this.playing = false;
      this.audio.pause();
    },
    setCurrentTimeAsync: function(value, cb, retry) {
      var self = this;
      if (true || ua.ios) {
        if(this.audio.currentTime == value) {
          return cb();
        }
        if (!retry) retry = 0;
        if(retry>2){
          return cb();
        }
        var didSeek = false;
        var onSeeked = function(){
          didSeek = true;
          cb();
        }
        this.audio.addEventListener('seeked', onSeeked);
        setTimeout(function(){
          self.audio.removeEventListener('seeked', onSeeked);
          if(!didSeek){
            self.setCurrentTimeAsync(value, cb, retry+1);
          }
        }, 30);
        this.setCurrentTime(value);
      }
      else {
        var result = this.setCurrentTime(value);
        if(!result){
          setTimeout(function(){
            self.setCurrentTimeAsync(value, cb);
          }, 10);
        }
        else {
          cb();
        }
      }
    },
    setCurrentTime: function(value) {
      try {
        // DOM Exceptions are fired when Audio Element isn't ready yet.
        this.audio.currentTime = value;
        return true;
      } catch(e) {
        return false;
      }
    },
    getLatency: function() {
      return this.lastLatency.amean();
    },
    
    correctLatency: function(delta) {
      var deviceLatency = this.latencyStats.amean() || 0;
      var currentTime = this.audio.currentTime;
      if(!ua.winmo) {
        this.audio.pause();
      }
      var newPos = parseFloat(((currentTime*1000 - delta + deviceLatency)/1000).toFixed(2));
      this.playAt(newPos, true);
    },
    
    step: function() {
      if (!this.playing && !this.audio.paused) {
        this.audio.pause();
      }
      if (this.loading) {
        var readyState = this.audio.readyState;
        if (readyState !== this.readyState) {
          this.readyState = readyState;
          $("#loadstate").text(this.readyState);
        }
        var networkState = this.audio.networkState;
        if (networkState !== this.networkState) {
          this.networkState = networkState;
          $("#netstate").text(this.networkState);
        }
        
        var duration = this.audio.duration;
        if (duration !== this.duration) {
          this.duration = duration;
          $("#duration").text(this.duration);
        }
        
        var buffered = this.audio.buffered;
        if(buffered.length){
          
          if(buffered.length !== this.buffers) {
            this.buffers = buffered.length;
            $("#buffers").text(this.buffers);
          }
          
          var bufferedFrom = buffered.start(0);
          if (bufferedFrom != this.bufferedFrom) {
            this.bufferedFrom = this.bufferedFrom;
            $("#bufferstart").text(bufferedFrom);
          }
          var bufferedTo = buffered.end(0);
          if (bufferedTo != this.bufferedTo) {
            this.bufferedTo = this.bufferedTo;
            $("#bufferend").text(bufferedTo);
          }
          
          if(bufferedTo > this.dur) {
            this.onCanPlayThrough();
            this.loading = false;
          }
          
        }
        
        
      }
      
      var currentTime = this.audio.currentTime;
      if(this.audioPlaying && this.playing){
        this.pause();
      }
      if (this.playing) {
        var now = +new Date();
        var latency = Math.round((now - this.playTime) - (currentTime - this.playPosition) * 1000);
        /*
        Latency is known if:
          - 3 last measurements were pretty equal.
          - Average of 15 first measurements on Android 2.3
        */
        
        if (latency !== this.latency) {
          this.latency = latency;
          $("#latency").text(latency.toFixed(5));
        }
        var tlatency = Math.round((now - this.trackTime) - (currentTime - this.trackPosition) * 1000);
        if (tlatency !== this.tlatency) {
          this.tlatency = tlatency;
          $("#tracklatency").text(tlatency.toFixed(5));
        }
        var fixedLatency = this.fixedLatency;
        if (this.fixedLatency === null && currentTime > this.playPosition + (this.playCount==1?.2:0) ) {
          
          this.lastLatency.push(latency);
          var len = this.lastLatency.length;
          if (len >2 && Math.abs(latency - this.lastLatency[len - 2]) <= 2 && Math.abs(latency - this.lastLatency[len - 3]) <= 2){
            this.fixedLatency = (this.lastLatency[len - 2] + this.lastLatency[len - 3] + latency) / 3;
          }
          else if (len>15 && ua.android) {
            var sum = 0;
            for (var i=0; i < this.lastLatency.length; i++) {
              sum += this.lastLatency[i];
            }
            this.fixedLatency = sum/this.lastLatency.length;
            
          }
        }
        if (fixedLatency !== this.fixedLatency) {
          if (this.playCount == 1) {
            this.firstLatency.push(this.fixedLatency);
          }
          else {
            this.latencyStats.push(this.fixedLatency);
          }
          $("#latency2").text(this.fixedLatency);
          if (this.autoCorrect) {
            var diff = this.tlatency - this.expectedLatency;
            if (Math.abs(diff) > 50) {
              this.correctLatency(-diff);
            }
          }
        }
      }
      $('#time').text(currentTime.toFixed(5));
    }
  });
  

  
  $("#load1").on('touchstart', onLoad1).on('mousedown', onLoad1);
  $("#load2").on('touchstart', onLoad2).on('mousedown', onLoad2);
  $("#play").on('touchstart', onPlay).on('mousedown', onPlay);
  $("#pause").on('touchstart', onPause).on('mousedown', onPause);
  $("#replay").on('touchstart', onReplay).on('mousedown', onReplay);
  $("#set").on('touchstart', onSet).on('mousedown', onSet);
  $("#log1").on('touchstart', onLog1).on('mousedown', onLog1);
  $("#log2").on('touchstart', onLog2).on('mousedown', onLog2);
  $("#incr").on('touchstart', onIncr).on('mousedown', onIncr);
  $("#decr").on('touchstart', onDecr).on('mousedown', onDecr);
  
  log(window.navigator.userAgent);
  
});