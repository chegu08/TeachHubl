const express = require("express");
const app = express();
const { v4: uuid } = require("uuid");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = app.listen(4002, () => console.log("server is running on port 4002..."));

const io = new Server(server, { cors: { origin: "*" } });

const roomDetails = new Map();

io.on('connection', (socket) => {

    socket.on('kjsdglj', () => {
        console.log("akkdfgnlkadngksndlgkbnsdbgtn");
    })

    console.log(`A new user has joined with id: ${socket.id}`);
    socket.emit('user-joined', socket.id);

    socket.on('create-room', (roomId) => {
        console.log("A new room has been created with id : ", roomId);
    });

    socket.on('join-room', ({ user, roomId, role }) => {
        console.log(`${user} has joined the room ${roomId}`);
        if (!roomDetails[roomId]) {
            roomDetails[roomId] = []
        }
        roomDetails[roomId].push(user);
        socket.join(roomId);

    });

    socket.on('get-people-in-room', roomId => {
        socket.emit('people-in-room', { peopleInRoom: roomDetails[roomId] });
    })


    socket.on('disconnected', (userSocketId) => {
        console.log("User with id ", userSocketId, "has been disconnected");
        socket.disconnect(true);
    });
});

