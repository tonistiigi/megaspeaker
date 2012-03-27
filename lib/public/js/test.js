$(function(){
  

  
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