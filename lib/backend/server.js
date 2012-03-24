
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

app.use(express.static(path.join(__dirname, '../public/'), {
  maxAge: 86400000
}));

var channels = {};

app.get('/:name', function(req, res, next) {
  var selectedChannel = channels[req.params.name];
  if(!selectedChannel) {
    channels[req.params.name] = {};
    req.url = '/master.html';
  }
  next();
});



io.of('/master').on('connection', function(socket) {
  socket.on('allTracks', function(cb) {
    cb(CONF['tracks']);
  });

  socket.on('play', function() {

  });

  socket.on('pause', function() {

  });



});

io.of('/client').on('connection', function(socket) {
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


});
winston.info('Server started at <http://localhost:'+PORT+'/> Have fun!');

