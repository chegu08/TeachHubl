const mongoose=require("mongoose");

const tutorReviewSchema=new mongoose.Schema({
    reviewId:{
        type:String,
        unique:true,
        required:true
    },
    review:{
        type:String,
        required:true
    },
    stars:{
        type:Number,
        required:true,
    },
    tutorId:{
        type:String,
        required:true
    },
    studId:{
        type:String,
        required:true
    },
    postedAt:{
        type:Date,
        required:true
    }
});

const tutorReviewModel=mongoose.model('tutorReviews',tutorReviewSchema);

module.exports=tutorReviewModel;