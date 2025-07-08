const mongoose=require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId:{
        type:String,
        unique:true,
        required:true
    },
    orderId:{
        type:String,
        unique:true,
        required:true
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
    amount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        default:"Initial payment"
    }
});

const paymentModel=mongoose.model('payment',paymentSchema);

module.exports=paymentModel;