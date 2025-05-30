const mongoose=require("mongoose");

const tutorTemplateCourseSchema=new mongoose.Schema({
    templateCourseId:{
        type:String,
        required:true,
        unique:true
    },
    tutorId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    imageKey:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    overview:{
        type:String
    },
    agenda:{
        type:String
    },
    chapters:{
        type:[String],
        required:true,
        validate:{
            validator:function (v) {
                return v.length>0
            },
            message:"There must be atleast one chapter in this template"
        }
    },
    resourceKeys:{
        type:[String]
    },
    thumbnailForImage:{
        type:String,
        required:true
    }
});

const TutorTemplateCourseModel=mongoose.model('TutorTemplateCourse',tutorTemplateCourseSchema);

module.exports=TutorTemplateCourseModel;