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



if(typeof ms == "undefined") {
  ms = {};
}

_.avg = function (values) {
  return _.reduce(values, function(a, b){ return a + b; }, 0) / values.length;
};

var pathparts = window.location.pathname.split('/');
ms.channel = pathparts[1];

//ms.startPlayer(mouseEvent, callback)
_.extend(ms, Backbone.Events);


// Measure helper class
var Measure = function(opt) {
  this.opt = _.defaults(opt || {}, {
    samples: 3,
    retries: 3,
    timeout: 400,
    sleep: 120, //ms
    deviation: 30,
    max: null,
    min: null
  });
  this.errors = 0;
  this.ready = false;
  this.value = 0;
  this.i = 0;
  
  _.bindAll(this, 'measure');
};
Measure.prototype = _.extend(Backbone.Events, {
  run: function(iterator) {
    this.iterator = iterator;
    this.results = [];
    this.measure();
  },
  measure: function() {
    this.i++;
    this._requestTime = new Date().getTime()
    this.iterator(_.bind(this.measureResponder, this, this.i));
  },
  measureResponder: function(index, result){
    if (this.i != index) {
      return this.trigger('error', {msg: 'Wrong response order.'});
    }
    var timeNow = new Date().getTime();
    if ((this.opt.timeout == null && timeNow - this._requestTime > this.opt.timeout) ||
      (this.results.length && Math.abs(_.avg(this.results) -  result) > this.opt.deviation) ||
      (this.opt.min != null && result < this.opt.min) || (this.opt.max != null && result > this.opt.max)) {
        this.errors++;
        if (this.errors >= this.opt.retries) {
          this.ready = false;
          this.trigger('error', {msg: 'Max retries limit'});
        }
        else {
          _.delay(this.measure, this.opt.sleep);
        }
    }
    else {
      this.results.push(result);
      if (this.results.length >= this.opt.samples) {
        this.value = _.avg(this.results);
        this.ready = true;
        this.trigger('ready', this.value);
      }
      else {
        _.delay(this.measure, this.opt.sleep);
      }
    }
    
  }
});




ms.timesync = new Measure();
ms.timesync.getTime = function(){
  return new Date().getTime() + Math.round(this.value);
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
  console.log('timesync ready = ', result);
  // test routine
  setInterval(function(){
    $("#timetest").html(ms.timesync.getTime());
  },1);
});

