const mongoose=require("mongoose");

const subscriptionSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    subscription:{
        type:Object,
        required:true,
    }
});

const subscriptionModel=mongoose.model('pushSubscription',subscriptionSchema);

module.exports=subscriptionModel;