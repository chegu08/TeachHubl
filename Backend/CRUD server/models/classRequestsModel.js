const mongoose=require("mongoose");

const classRequestSchema = new mongoose.Schema({
    requestId:{
        type:String,
        required:true,
        unique:true
    },
    studId:{
        type:String,
        required:true
    },
    tutorId:{
        type:String,
        required:true
    },
    templateId:{
        type:String,
        required:true
    },
    chaptersRequested:{
        type:[String],
        required:true,
        validate:{
            validator:function (v){
                return v.length>0
            },
            message:"Atleast one chapter must be requested"
        }
    },
    requestStatus:{
        type:String,
        required:true
    },
    responseId:{
        type:String,
        validate:{
            validator: function (v) {
                if(this.requestStatus=="accepted") {
                    return typeof v==="string" && v.length>0
                }
                return true;
            },
            message:"Response Id not found for the accepted request"
        }
    }
});

const classRequestModel=mongoose.model('ClassRequests',classRequestSchema);

module.exports=classRequestModel;