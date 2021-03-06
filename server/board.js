var express = require('express');
var router = express.Router();
var server = require('http').Server(global.app);
var io = require('socket.io')(server);
var chatPort = 7051;

server.listen(chatPort, function () {
  console.log("Server listening on: http://localhost:%s", chatPort);
});

var usernames = {};
var rooms = [];

io.sockets.on('connection', function (socket) {

  var createRoom = function(data) {
      var new_room = data.room;
      rooms.push(new_room);
      data.room = new_room;
      socket.emit('roomcreated', data);
  };

    socket.on('adduser', function (data) {
        var username = data.username;
        var room = data.room;

        if (rooms.indexOf(room) != -1) {
            socket.username = username;
            socket.room = room;
            usernames[username] = username;
            socket.join(room);
            socket.emit('updatechat', 'SERVER', 'You are connected. Start chatting');
            socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' has connected to this room');
        } else {
          createRoom(data);
        }
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        if (socket.username !== undefined) {
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        }
    });
});

router.get('/chat', function(req, res, next) {
  res.json({
     success: true,
     data: io.sockets
   });
});

module.exports = router;
