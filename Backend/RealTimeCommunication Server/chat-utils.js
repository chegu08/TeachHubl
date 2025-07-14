const messageModel = require("./models/messageModel");

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


const handleIncomingUser=async (data,socket)=> {

    const {userId,selectedChat}=data;

    console.log(`new user has joined chat socket with userId ${userId}`);

    if(!userStateDetail[userId]){
        userStateDetail[userId]={
            totalConnections:1,
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
        if(!msg.readAt&&new Date(msg.sentAt)>new Date(ordered_messages[msg.from].sentAt)) {
            ordered_messages[msg.from].recentlySentContent=msg.content;
            ordered_messages[msg.from].sentAt=msg.sentAt,
            ordered_messages[msg.from].totalUnreadMessages++;
        }
        
    });

    socket.emit('message-list',ordered_messages);
};

module.exports={
    handleIncomingUser
}