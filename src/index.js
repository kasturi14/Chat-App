const path = require('path');
const http = require('http');
const express  = require('express');
const socketIO = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);    //now our server supports web sockets.

const port = process.env.PORT || 3000;  //for heroku
var publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));



io.on('connection', (socket)=> {        
    //socket is an object that contains info about the new connection
    console.log('New web socket connection.');

    
    socket.emit('message', generateMessage('Welcome'));                          //<-send messages             
    socket.broadcast.emit('message', generateMessage('A new user has joined!')); //<-send messages

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed.');
        }

        io.emit('message', generateMessage(message));                            //<-send messages
        callback();
    });

    
    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect',()=> {
        io.emit('message', generateMessage('A user has left.'));                 //<-send messages
    });
});


server.listen(port, ()=> {
    console.log(`Server up on port 3000`);
});