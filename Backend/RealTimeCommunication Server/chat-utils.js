const messageModel = require("./models/messageModel");

/**
 *  rooms are named such as <user1>&<user2>.
 * 
 * if a user has come with a socket id insert socket.id 
 * into the room .
 * 
 * There can be multiple sockets for the same user.
 * 
 * if a socket has disconnected ,remove socket.id from room
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
 * userId:{
 * 
 *      totalConnections:Set(socketIds),
 *      selectedChat:string
 *  
 * }
*/
const userStateDetail= new Map();


const handleIncomingUser=async (data,socket)=> {

    const {userId,selectedChat}=data;

    console.log(`new user has joined chat socket with userId ${userId}`);

    if(!userStateDetail[userId]){
        userStateDetail[userId]={
            totalConnections:new Set(socket.id),
            selectedChat
        }
    }
    // assuming the user has not opened any chats while incoming 
    // it is not necessary to create any room for the user

    // now fetch the users message 
    const messages=await messageModel.find({to:userId}).sort({sentAt:"asc"});
    
    const ordered_messages={};
    messages.forEach(msg=>{
        if(!ordered_messages[msg.from]){
            ordered_messages[msg.from]={
                recentlySentContent:"",
                sentAt:new Date(-8640000000000000),
                totalUnreadMessages:0
            };
        }
        if(new Date(msg.sentAt)>new Date(ordered_messages[msg.from].sentAt)) {
            ordered_messages[msg.from].recentlySentContent=msg.content;
            ordered_messages[msg.from].sentAt=msg.sentAt;
            if(msg.readAt) {
                // ordered_messages[msg.from].totalUnreadMessages++;
                ordered_messages[msg.from].readAt=msg.readAt;
            } 
            else ordered_messages[msg.from].totalUnreadMessages++;
        }
        
    });

    socket.emit('message-list',ordered_messages);
};

const updateChangeOfRoom= async (data,socket)=>{

    const {userId,selectedChat}=data;

    if(userStateDetail[userId].selectedChat!=""&&userStateDetail[userId].selectedChat!=selectedChat) {
        if(roomDetailsForChat.has(`${userId}&${userStateDetail[userId].selectedChat}`)) {
            const newsocketIds=roomDetailsForChat.get(`${userId}&${userStateDetail[userId].selectedChat}`).filter(socketId=>socketId!=socket.id);
            if(newsocketIds.length=0)
                roomDetailsForChat.set(`${userId}&${userStateDetail[userId].selectedChat}`,newsocketIds);
            else roomDetailsForChat.delete(`${userId}&${userStateDetail[userId].selectedChat}`);

        }
        else {
            const newsocketIds=roomDetailsForChat.get(`${userStateDetail[userId].selectedChat}&${userId}`).filter(socketId=>socketId!=socket.id);
            if(newsocketIds.length!=0)
                roomDetailsForChat.set(`${userStateDetail[userId].selectedChat}&${userId}`,newsocketIds);
            else 
                roomDetailsForChat.delete(`${userStateDetail[userId].selectedChat}&${userId}`);
        }
    }

    userStateDetail[userId].totalConnections.add(socket.id);
    userStateDetail[userId].selectedChat=selectedChat;

    if(roomDetailsForChat.has(`${userId}&${selectedChat}`)) {
        const oldsocketid=roomDetailsForChat.get(`${userId}&${selectedChat}`);
        roomDetailsForChat.set(`${userId}&${selectedChat}`,[...oldsocketid,socket.id]);
        socket.join(`${userId}&${selectedChat}`);
    }
    else if(roomDetailsForChat.has(`${selectedChat}&${userId}`)){
        const oldsocketid=roomDetailsForChat.get(`${selectedChat}&${userId}`)
        roomDetailsForChat.set(`${selectedChat}&${userId}`,[...oldsocketid,socket.id]);
        socket.join(`${selectedChat}&${userId}`);
    }
    else {
        roomDetailsForChat.set(`${userId}&${selectedChat}`,[socket.id]);
        socket.join(`${userId}&${selectedChat}`);
    } 

    

    // fetching all the messages that was sent by selectedChat
    try {
        const allmessages=await messageModel.find({
            $or:[
                {from:userId,to:selectedChat},
                {to:userId,from:selectedChat}
            ]
        }).sort({"sentAt":"desc"}).lean();


        socket.emit('message-list-for-selected-chat',{
            success:true,
            allmessages,
            Error:""
        })
    } catch(err) {
        console.log(err);
        socket.emit('message-list-for-selected-chat',{
            success:false,
            Error:"Error fetching messages for this chat",
            allmessages:""
        })
    }
};

const updateAllMessagesToRead=async (data)=>{
    const {userId,selectedChat}=data;

    try {
        await messageModel.updateMany({to:userId,from:selectedChat},{
            $set:{
                readAt:new Date(Date.now())
            }
        })
    } catch(err) {
        console.log(err);
    }

};

const handleMessage=async (data,socket)=>{
    const {userId,selectedChatId:selectedChat,content,sentAt,messageId}=data;

    /**
     * if there is any socket connection active for selectedChat 
     * then the message is marked read immediately while inserting into database
     * 
     * Otherwise it is pushed to the database as just sentAt
     */

    let activeSocketConnectionForReceiver=false;

    roomDetailsForChat[`${userId}&${selectedChat}`]?.forEach(socketId=>{
        if(userStateDetail[selectedChat]?.totalConnections.find(socketId)) {
            activeSocketConnectionForReceiver=true;
        }
    });

    if(activeSocketConnectionForReceiver) {
        roomDetailsForChat[`${selectedChat}&${userId}`]?.forEach(socketId=>{
            activeSocketConnectionForReceiver|=userStateDetail[selectedChat]?.totalConnections.find(socketId);
        });
    }
     
    const roomId=roomDetailsForChat.has(`${userId}&${selectedChat}`)?`${userId}&${selectedChat}`:`${selectedChat}&${userId}`;

    // const sentTime=new Date();

    socket.broadcast.to(roomId).emit('incoming-message',{
        content,
        from:userId,
        to:selectedChat,
        sentAt
    });

    try{
        const messageDetails={
            messageId,
            content,
            from:userId,
            to:selectedChat,
            sentAt
        };
        if(activeSocketConnectionForReceiver) messageDetails.readAt=sentAt;
        const message=await messageModel.insertOne(messageDetails);
        console.log("message inserted into database");
        console.log(message);
    } catch(err) {
        console.log(err);
    }
};

module.exports={
    handleIncomingUser,
    updateChangeOfRoom,
    updateAllMessagesToRead,
    handleMessage
}