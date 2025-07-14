const mongoose=require('mongoose');

const messageSchema=new mongoose.Schema({
    messageId:{
        type:String,
        required:[true,"Message Id is required"],
        unique:true
    },
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    sentAt:{
        type:Date,
        required:true
    },
    readAt:Date
});

const messageModel=mongoose.model("message",messageSchema);

module.exports=messageModel;