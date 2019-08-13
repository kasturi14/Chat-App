const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
// const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);

const io = socketIO(server);    //now our server supports web sockets.
const port = process.env.PORT || 3000;  //for heroku
var publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    //socket is an object that contains info about the new connection
    console.log('New web socket connection.');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        //<-send messages
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        //<-send messages

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        // const filter = new Filter();
        // if (filter.isProfane(message)) {
        //     return callback('Profanity is not allowed.');
        // }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        //<-send messages
        callback();
    });


    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`));//<-send messages
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    });
});


server.listen(port, () => {
    console.log(`Server up on port 3000`);
});