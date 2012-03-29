$(function(){
  

  
  var spkr = null;
  
  function log(){
    var div = document.createElement('div');
    div.innerHTML = [].slice.apply(arguments).join(' ');
    var log = $('#log')[0];
    if(!log.length) return;
    if(log.firstChild)
      log.insertBefore(div, log.firstChild);
    else
      log.appendChild(div);
  }
  
  function onLoad1(e){
    log('load1');
    var file = "http://commondatastorage.googleapis.com/megaspeaker/silence.mp3";
    if(spkr){
      spkr.loadFile(file, 5);
      
    }
    else {
      spkr = new Spkr(e, file, 56);
      //spkr.setAutoCorrect(true);
    }
    spkr.on('loaded', function(){
      log('loaded');
      //spkr.play();
    })
  }
  function onLoad2(){
    log('load2');
    setTimeout(function(){
      spkr.loadFile("http://commondatastorage.googleapis.com/megaspeaker/dtb.mp3", 55);
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
  function onLog1(e){
    log('load1');
    var file = "http://commondatastorage.googleapis.com/megaspeaker/silence.mp3";
    if(spkr){
      spkr.loadFile(file, 5);
      
    }
    else {
      spkr = new Spkr(e, file, 56);
      spkr.setAutoCorrect(true);
    }
    spkr.on('loaded', function(){
      if(!spkr.log1){
      spkr.play();
      setTimeout(onLog2, 5000);
      spkr.log1 = 1;
    }
    })
  }  
  function onLog2(){
    setTimeout(function(){
      spkr.loadFile("http://commondatastorage.googleapis.com/megaspeaker/dtb.mp3", 55);
    }, 1000);
    spkr.on('loaded', function(){
      spkr.playAt(3.45, false, 200);
      setTimeout(function(){
        spkr.playAt(30, false, 400);
      },5000);
   } );
  }
  function onIncr(){
    spkr.correctLatency(50);
  }
  function onDecr(){
    spkr.correctLatency(-50);
  }
  
  var evt = document.ontouchstart ? 'touchstart' : 'mousedown';
  $("#load1").on(evt, onLoad1);
  $("#load2").on(evt, onLoad2);
  $("#play").on(evt, onPlay);
  $("#pause").on(evt, onPause);
  $("#replay").on(evt, onReplay);
  $("#set").on(evt, onSet);
  $("#log1").on(evt, onLog1);
  $("#log2").on(evt, onLog2);
  $("#incr").on(evt, onIncr);
  $("#decr").on(evt, onDecr);
  
  log(window.navigator.userAgent);
  
});