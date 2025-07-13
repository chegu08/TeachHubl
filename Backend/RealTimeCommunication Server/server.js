const express = require("express");
const app = express();
const { v4: uuid } = require("uuid");
const cors = require("cors");
const { Server } = require("socket.io");
const NotebookModel=require("./models/noteBookModel");
const messageModel=require("./models/messageModel");
const mongoose=require("mongoose");

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.REALTIMESERVERPORT || 4002;

const server = app.listen(port, async () => {
    try {
        const mongodbURL = 'mongodb://localhost:27018,localhost:27019,localhost:27020/TeachHubl'
        await mongoose.connect(mongodbURL)
        console.log("Connected to database successfully...");
        console.log(`server is running on port ${port}...`);
    }
    catch (err) {
        console.log("Failed to start server");
        console.log("Error:", err);
    }

});

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], } });

app.get('/:classId', async (req, res) => {
    try {
        const _class = await NotebookModel.findOne({ classId: req.params.classId })

        return res.status(200).json({ totalPages: _class.pages.length, elements: _class.pages })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
})

app.get('/:classId/:pageNumber', async (req, res) => {
    try {
        const classId = req.params.classId
        const pageNumber = req.params.pageNumber
        //console.log(pageNumber)
        const _class = await NotebookModel.findOne({ classId })
        const elements = (pageNumber < _class.pages.length) ? _class.pages[pageNumber] : []
        res.status(200).json({ elements })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
})


app.post('/:classId/:pageNumber', async (req, res) => {
    try {
        const { page: newpage } = req.body
        //console.log(req)
        //console.log(newpage)
        const pageNumber = req.params.pageNumber
        const classId = req.params.classId
        const _class = await NotebookModel.findOne({ classId })
        if (!_class) {
            const db_res = await NotebookModel.create({
                classId,
                pages: [newpage]
            })
            return res.status(200).json({ Message: "new page inserted successfully", db_res })

        }
        else if (pageNumber < _class.pages.length) {
            let updatedPages = _class.pages
            updatedPages[pageNumber] = newpage
            const db_res = await NotebookModel.updateOne({ classId }, {
                pages: updatedPages
            })
            return res.status(200).json({ Message: "new page inserted successfully", db_res })
        }
        else {
            const db_res = await NotebookModel.updateOne({ classId }, {
                pages: [..._class.pages, newpage]
            })
            return res.status(200).json({ Message: "new page inserted successfully", db_res })
        }
        //return res.status(200)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
});

// this is the io connection for chat

/**
 *  rooms are named such as <user1>&<user2>.
 * 
 * if a user has come with a socket id insert socket.id 
 * into the room .
 * 
 * There can be multiple sockets for the same user.
 * 
 * if a socket has disconnected ,remove socket.id form room
*/
const roomDetailsForChat=new Map();

/**
 * TO check whether a user is online or not . 
 * Just check in userStateDetails 
 * 
 * Also use the user state Details to know which chat the user has opened.
 * 
 * A user must be removed from user state details only after ensuring 
 * that there is no socket.id in the associated room with 
 * the disconnected userId
 * 
 * The format of userStateDetails is 
 * 
 * "userId":{
 * 
 *      totalConnections:number,
 *      selectedChat:string
 *  
 * }
*/
const userStateDetail= new Map();

io.of('/chat').on('connection',(socket)=>{
    
    const userId=socket.handshake.query;
    console.log('userblahblah : ',userId);
    // socket.emit('recv-message-list',`User with user id ${userId} has come online. Fetching all the messages...`);
    // console.log(socket)
    
});



// this is the io connection for webRTC and whiteBoard

const roomDetails = new Map();

io.of('/').on('connection', (socket) => {

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

    socket.on("WhiteBoardData", (data) => {
        socket.broadcast.to(data.roomId).emit("WhiteBoardDataResponse", { imageURL: data })
    });

});