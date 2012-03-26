$(function(){
  
  function log(){
    var div = document.createElement('div');
    div.innerHTML = [].slice.apply(arguments).join(' ');
    $('#log').append(div);
  }
  
  function onLoad1(){

  }
  function onLoad2(){
    
  }
  function onPlay(){
    
  }
  function onPause(){
    
  }
  function onStop(){
    
  }
  function onSkip(){
    
  }
  function onLog1(){
    
  }  
  function onLog2(){
    
  }
  function onIncr(){
    
  }
  function onDecr(){
    
  }
  
  $("#load1").on('touchstart', onLoad1).on('mousedown', onLoad1);
  $("#laod2").on('touchstart', onLoad2).on('mousedown', onLoad2);
  $("#play").on('touchstart', onPlay).on('mousedown', onPlay);
  $("#pause").on('touchstart', onPause).on('mousedown', onPause);
  $("#stop").on('touchstart', onStop).on('mousedown', onStop);
  $("#skip").on('touchstart', onSkip).on('mousedown', onSkip);
  $("#log1").on('touchstart', onLog1).on('mousedown', onLog1);
  $("#log2").on('touchstart', onLog2).on('mousedown', onLog2);
  $("#incr").on('touchstart', onIncr).on('mousedown', onIncr);
  $("#decr").on('touchstart', onDecr).on('mousedown', onDecr);
  
});