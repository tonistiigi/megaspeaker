
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

app.get('/:name/master', function(req, res, next) {
  if (path.existsSync(path.join(__dirname, '../public/', req.url))) {
    return next();
  }
  var selectedChannel = channels[req.params.name];
  if(!selectedChannel) {
    req.url = '/master.html';
  }
  else {
    return res.redirect('/' + req.params.name);
  }
  next();
});


app.get('/:name', function(req, res, next) {
  if (path.existsSync(path.join(__dirname, '../public/', req.url))) {
    return next();
  }
  var selectedChannel = channels[req.params.name];
  if(!selectedChannel) {
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
    socket.join(data.channel);
    channels[data.channel] = {};
    socket.set('channel', data.channel);
  });

  socket.on('allTracks', function(cb) {
    cb(CONF['tracks']);
  });

  socket.on('play', function(trackId) {
    socket.get('channel', function(err, name) {
      socket.broadcast.to(name).emit('play', trackId);
    });
  });

  socket.on('stop', function(trackId) {
    socket.get('channel', function(err, name) {
      socket.broadcast.to(name).emit('stop', trackId);
    });
  });

  socket.on('load', function(trackId) {
    socket.get('channel', function(err, name) {
      socket.broadcast.to(name).emit('load', CONF.tracks[trackId]);
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
  });

  socket.on('loaded', function(trackId) {
    socket.get('channel', function(err, name) {
      socket.broadcast.to(name).emit('loaded', trackId);
    });
  })

  io.of('/master').emit(
    'speakerCount',
    io.of('/client').sockets.length
  );

  socket.on('disconnect', function() {
    io.of('/master').emit(
      'speakerCount',
      io.of('/client').sockets.length
    );
  });

  socket.on('getTime', getTime);

});
winston.info('Server started at <http://localhost:'+PORT+'/> Have fun!');

