const mongoose=require("mongoose");

const sessionSchema=new mongoose.Schema({
    sessionId:{
        type:String,
        required:true,
        unique:true
    },
    userId:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    role:{
        type:String,
        enum:["Student","Tutor"],
        required:true
    },
    sessionType:{
        type:String,
        enum:["long","short"],
        required:true
    }
});

sessionSchema.index({expiresAt:1},{expires:0});

const authSessionModel=mongoose.model('authssession',sessionSchema);

module.exports=authSessionModel;


