$(function(){
  
  var spkr = null;
  
  function log(){
    var div = document.createElement('div');
    div.innerHTML = [].slice.apply(arguments).join(' ');
    $('#log').append(div);
  }
  
  function onLoad1(e){
    log('load1');
    var file = "http://commondatastorage.googleapis.com/megaspeaker/dtb.mp3";
    if(spkr){
      spkr.loadFile(file, 56);
    }
    else {
      spkr = new Spkr(e, file, 56);
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
      spkr.playAt(1);
    }, 1);
  }
  function onLog1(){
    
  }  
  function onLog2(){
    
  }
  function onIncr(){
    
  }
  function onDecr(){
    
  }
  
  var Spkr = function(e, src, duration){
    if (!e instanceof MouseEvent) {
      throw('No mouse event given');
    }
    this.file = null;
    
    _.bindAll(this, 'step', 'onCanPlayThrough');
    
    setInterval(this.step, 1);
    
    this.audio = document.createElement('audio');
    
    this.audio.addEventListener('loadstart', function(){ log('EVT', 'loadstart'); }, true);
    this.audio.addEventListener('progress', function(){ log('EVT', 'progress'); }, true);
    this.audio.addEventListener('suspend', function(){ log('EVT', 'suspend'); }, true);
    this.audio.addEventListener('abort', function(){ log('EVT', 'abort'); }, true);
    this.audio.addEventListener('error', function(){ log('EVT', 'error'); }, true);
    this.audio.addEventListener('emptied', function(){ log('EVT', 'emptied'); }, true);
    this.audio.addEventListener('stalled', function(){ log('EVT', 'stalled'); }, true);
    this.audio.addEventListener('loadedmetadata', function(){ log('EVT', 'loadedmetadata'); }, true);
    this.audio.addEventListener('loadeddata', function(){ log('EVT', 'loadeddata'); }, true);
    this.audio.addEventListener('canplay', function(){ log('EVT', 'canplay'); }, true);
    this.audio.addEventListener('canplaythrough', function(){ log('EVT', 'canplaythrough'); }, true);
    this.audio.addEventListener('playing', function(){ log('EVT', 'playing'); }, true);
    this.audio.addEventListener('seeking', function(){ log('EVT', 'seeking'); }, true);
    this.audio.addEventListener('seeked', function(){ log('EVT', 'seeked'); }, true);
    this.audio.addEventListener('ended', function(){ log('EVT', 'ended'); }, true);
    this.audio.addEventListener('waiting', function(){ log('EVT', 'waiting'); }, true);
    this.audio.addEventListener('durationchange', function(){ log('EVT', 'durationchange'); }, true);
    this.audio.addEventListener('timeupdate', function(){ log('EVT', 'timeupdate'); }, true);
    this.audio.addEventListener('play', function(){ log('EVT', 'play'); }, true);
    this.audio.addEventListener('pause', function(){ log('EVT', 'pause'); }, true);
    this.audio.addEventListener('ratechange', function(){ log('EVT', 'ratechange'); }, true);
    this.audio.addEventListener('volumechange', function(){ log('EVT', 'volumechange'); }, true);
    
    this.loadFile(src);
    
  };
  
  _.extend(Spkr.prototype, {
    STATE_LOADING_START: 1,
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
      var parts = src.split('/');
      $("#url").text(parts[parts.length - 1]);
      $("#loaded").text(0);
    },
    onCanPlayThrough: function(){
      if (this.loading) {
        this.audio.addEventListener('canplaythrough', this.onCanPlayThrough, true);
        this.ready = true;
        $("#loaded").text(1);
        this.audio.pause();
      }
    },
    play: function() {
      this.playAt(parseFloat(this.audio.currentTime.toFixed(2)));
    },
    playAt: function(position){
      this.playTime = +new Date();
      this.playing = true;
      this.playPosition = position;
      var setTime = this.setCurrentTime(position);
      log('setTime',position, setTime?'Y':'N');
      this.audio.play();
      $("#playtime").text(this.playTime);
    },
    pause: function() {
      this.playing = false;
      this.audio.pause();
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
      if (this.playing) {
        var latency = ((+new Date()) - this.playTime) - (currentTime - this.playPosition) * 1000;
        if (latency !== this.latency) {
          this.latency = latency;
          $("#latency").text(latency.toFixed(5));
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
  
});