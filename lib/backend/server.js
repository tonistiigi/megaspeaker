
var fs = require('fs');
var path = require('path');
var url = require("url");
var express = require("express");
var socketio = require("socket.io");
var optimist = require("optimist");
var util = require('util');
var winston = require("winston");
var _ = require('underscore')._;

var argv = optimist.options('port', {
  alias: 'p',
  "default": '4100',
  describe: 'Server port'
}).options('log', {
  alias: 'l',
  "default": 'info',
  describe: 'Log level'
}).argv;

winston.setLevels(winston.config.syslog.levels);
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  colorize: true,
  level: argv.log,
  handleExceptions: true
});

var CONF_FILE = path.join(__dirname, '../../conf.json');
if (!path.existsSync(CONF_FILE)) {
  winston.error('No conf file found.');
  process.exit(1);
}
var CONF = JSON.parse(fs.readFileSync(CONF_FILE));
var PORT = parseInt(argv.port);
var app = express.createServer().listen(PORT);

app.use(express.errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.use(express.favicon());

global.io = io = socketio.listen(app, {
  'log level': 1
});

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');

app.get('/', function(req, res, next){
  req.url = '/landing.html';
  next();
});

function getTime(cb){
  return cb(new Date().getTime());
}

var channels = {};

app.get('/:name/reset/'+CONF.root, function(req, res, next){
  if(channels[req.params.name]){
    if(channels[req.params.name].socket)
    channels[req.params.name].socket.disconnect();
    delete channels[req.params.name];
    return res.redirect('/' + req.params.name+'/master');
  }
});

app.get('/:name/master', function(req, res, next) {
  if (path.existsSync(path.join(__dirname, '../public/', req.url))) {
    return next();
  }

  if(!channels[req.params.name]) {
    req.url = '/master.html';
  } else {
    return res.redirect('/' + req.params.name);
  }
  next();
});


app.get('/:name', function(req, res, next) {
  if (path.existsSync(path.join(__dirname, '../public/', req.url))) {
    return next();
  }

  if(!channels[req.params.name]) {
    return res.redirect('/' + req.params.name + '/master');
  }
  else {
    req.url = '/index.html';
  }
  next();
});

app.use(express.static(path.join(__dirname, '../public/'), {
  //maxAge: 86400000
}));

io.of('/master').on('connection', function(socket) {
  socket.on('register', function(data) {
    if(channels[data.channel]){
      return;
    }
    channels[data.channel] = { trackToLoad: false, loaded: 0, socket: socket };
    socket.join(data.channel);
    socket.set('channel', data.channel);
  });

  socket.on('allTracks', function(cb) {
    cb(CONF['tracks']);
  });

  socket.on('play', function(trackId, cb) {
    socket.get('channel', function(err, name) {
      var payload = {
        track: trackId,
        timestamp: new Date().getTime()+3000,
        part: trackId,
        type: 'play'
      };
      channels[name].lastPayload = payload;
      io.of('/client').in(name).emit('payload', payload);
      if(cb)cb(null);
    });
  });

  socket.on('stop', function(trackId, cb) {
    socket.get('channel', function(err, name) {
      channels[name].trackToLoad = false;
      channels[name].lastPayload = false;
      var payload = {
        track: trackId,
        timestamp: new Date().getTime()+3000,
        part: trackId,
        type: 'stop'
      };
      io.of('/client').in(name).emit('payload', payload);
      cb(null);
    });
  });

  socket.on('load', function(trackId, cb) {
    socket.get('channel', function(err, name) {
      if(!channels[name]) { return; }
      channels[name].loaded = 0;
      CONF.tracks[trackId].id = trackId;
      channels[name].trackToLoad = CONF.tracks[trackId];
      io.of('/client').in(name).emit('load', CONF.tracks[trackId]);
      cb(null);
    });
  });

  socket.on('disconnect', function() {
    socket.get('channel', function(err, name) {
      delete channels[name];
    });
  });

  socket.on('getTime', getTime);

});

io.of('/client').on('connection', function(socket) {
  socket.on('register', function(data) {
    socket.join(data.channel);
    socket.set('channel', data.channel);
    io.of('/master').in(data.channel).emit('speakerCount',
      io.of('/client').clients(data.channel).length);
    io.of('/client').in(data.channel).emit('speakerCount',
      io.of('/client').clients(data.channel).length);


  });

  socket.on('playerReady', function(){
    socket.get('channel', function(err, name) {
      if(channels[name] && channels[name].trackToLoad) {
        socket.emit('load', channels[name].trackToLoad);
        setTimeout(function(){
          if(channels[name].lastPayload){
            console.log('playerread', channels[name].lastPayload);
            socket.emit('payload', channels[name].lastPayload);
          }
        },400);
      }
    });
  });

  socket.on('loaded', function(trackId) {
    socket.get('channel', function(err, name) {
      channels[name].loaded++;
      io.of('/master').in(name).emit('loadedCount', channels[name].loaded);
      io.of('/client').in(name).emit('loadedCount', channels[name].loaded);
      socket.broadcast.to(name).emit('loaded', trackId);
    });
  });


  socket.on('disconnect', function() {
    socket.get('channel', function(err, name) {
      var speakerCount = io.of('/client').clients(name).length - 1;

      io.of('/master').in(name).emit('speakerCount', speakerCount);
      io.of('/client').in(name).emit('speakerCount', speakerCount);
      if(channels[name]){
      channels[name].loaded = (channels[name].loaded <= 0)? 0: --channels[name].loaded;
      io.of('/master').in(name).emit('loadedCount', channels[name].loaded);
      io.of('/client').in(name).emit('loadedCount', channels[name].loaded);
      }
    });
  });

  socket.on('getTime', getTime);

});
winston.info('Server started at <http://localhost:'+PORT+'/> Have fun!');

