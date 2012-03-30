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
    'resources': [],
    'spritemap': {},
    'spriteid': 'part'
  };
  ms.loadTrack(track);
})

ms.bind('payload', function(payload){
  payload = {
    track: ''
    type: 'play|stop',
    timestamp: '',
    spriteid: ''
  }
  ms.queuePayload(payload);
});

ms.bind('loaded', function(){

});

ms.bind('progress', function() {

});

*/

if(typeof ms == "undefined") {
  ms = {};
}

var pathparts = window.location.pathname.split('/');
ms.channel = pathparts[1];

//ms.startPlayer(mouseEvent, callback)
_.extend(ms, Backbone.Events);


// Measure helper class
var Measure = function(opt) {
  this.opt = _.defaults(opt || {}, {
    minSamples: 4,
    maxSamples: 30,
    maxErrors: 5,
    timeout: 400,
    sleep: 50, //ms
    moe: 20,
    max: null,
    min: null
  });
  this.errors = 0;
  this.ready = false;
  this.value = 0;
  this.i = 0;
  this.samples = 0;
  
  _.bindAll(this, 'measure');
};
Measure.prototype = _.extend(Backbone.Events, {
  run: function(iterator) {
    this.iterator = iterator;
    this.results = new Stats();
    this.measure();
  },
  measure: function() {
    this.i++;
    this._requestTime = new Date().getTime()
    this.iterator(_.bind(this.measureResponder, this, this.i));
  },
  measureResponder: function(index, result){
    if (this.i != index) {
      return;
      //return this.trigger('error', {msg: 'Wrong response order.'});
    }
    var timeNow = new Date().getTime();
    if ((this.opt.timeout == null && timeNow - this._requestTime > this.opt.timeout) ||
      (this.opt.min != null && result < this.opt.min) || (this.opt.max != null && result > this.opt.max)) {
        this.errors++;
        if (this.errors >= this.opt.maxErrors) {
          this.ready = false;
          this.trigger('error', {msg: 'Max retries limit'});
        }
        else {
          _.delay(this.measure, this.opt.sleep);
        }
    }
    else {
      this.samples++;
      this.results.push(result);
      if (this.samples < this.opt.minSamples) {
        return _.delay(this.measure, this.opt.sleep);
      }
      
      var moe = this.results.moe();
      var moeReq = this.opt.moe;
      if (this.samples < this.opt.maxSamples * .3) {
        moeReq*=.5;
      }
      else if(this.samples > this.opt.maxSamples * .85){
        moeReq*=2;
      }
      if (moe <= moeReq) {
        this.ready = true;
        this.value = this.results.amean();
        return this.trigger('ready', this.value);
      }
      //console.log('result was', result, this.results.amean(), moe, moeReq, this.samples);
      if (this.samples >= this.opt.maxSamples) {
        this.ready = false;
        return this.trigger('error', {msg: 'Max samples limit'});
      }

      if (this.samples >= this.minSamples) {
        this.results = this.results.irq();
      }

      _.delay(this.measure, this.opt.sleep);
    }
    
  }
});

ms.deviceLatency = 0;
if(/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
  ms.deviceLatency = 150;
}  
if(/iphone/i.test(window.navigator.userAgent)) {
  ms.deviceLatency = 200;
}
else if(/safari/i.test(window.navigator.userAgent)) {
  //ms.deviceLatency = 30;
}


ms.timesync = new Measure();
ms.timesync.getTime = function(){
  return new Date().getTime() + Math.round(this.value)+ ms.deviceLatency;
};
ms.timesync.sync = function(){
  ms.timesync.run(function(cb){
    var requestTime = new Date().getTime();
    ms.socket.emit('getTime', function(remoteTime){
      var ratio = .5;
      var timeNow = new Date().getTime();
      var result = (remoteTime-timeNow)*ratio + (remoteTime-requestTime)*(1-ratio);
      cb(result);
    })
  });
};
$(function(){
ms.socket.on('connect', function(){
  setTimeout(function(){
    ms.timesync.sync();
  }, 150);
});
});

// Tests: To be removed:


ms.timesync.bind('error', function(){
  console.log('timesync failed');
});
ms.timesync.bind('ready', function(result){
  ms.timesynced = true;
  // test routine
  /*setInterval(function(){
    $("#timetest").html(ms.timesync.getTime());
  },1);*/
});
