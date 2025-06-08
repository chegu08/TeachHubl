const mongoose=require("mongoose");
const { validate } = require("./tutorTemplateCourseModel");

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
            }
        }
    },
    requestStatus:{
        type:String,
        required:true
    }
});

const classRequestModel=mongoose.model('ClassRequests',classRequestSchema);

module.exports=classRequestModel;