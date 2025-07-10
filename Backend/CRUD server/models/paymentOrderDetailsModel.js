const mongoose=require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    slots: {
        type: [{
            startTime: {
                type: String,
                required: true, // store it in HH:MM format
                validate: {
                    validator: function (v) {
                        const hours = Number(v.substring(0, 2));
                        if (hours < 0 || hours >= 24) return false;
                        const minutes = Number(v.substring(3));
                        if (minutes < 0 || minutes >= 60) return false;
                        return true;
                    },
                    message: "Incorrect format of startTime ...Expected HH:MM format"
                }
            },
            endTime: {
                type: String,
                required: true,  // store it in HH:MM format
                validate: {
                    validator: function (v) {
                        const hours = Number(v.substring(0, 2));
                        if (hours < 0 || hours >= 24) return false;
                        const minutes = Number(v.substring(3));
                        if (minutes < 0 || minutes >= 60) return false;
                        return true;
                    },
                    message: "Incorrect format of endTime ...Expected HH:MM format"
                }
            }
        }],
        required: true
    }
});

const paymentOrderDetailSchema=new mongoose.Schema({
    orderId:{
        type:String,
        unique:true,
        required:[true,"Order Id is required"]
    },
    courseName:{
        type:String,
        required:[true,"Course Name is required"]
    },
    studId:{
        type:String,
        required:[true,"Student ID is required"]
    },
    startDate:{
        type:Date,
        required:[true,"Start Date of the class is required"]
    },
    endDate:{
        type:Date,
        required:[true,"End Date of the class is required"]
    },
    amount:{
        type:Number,
        required:[true,"Amount to pay is required"]
    },
    tutorName:{
        type:String,
        required:[true,"Tutor Name is required"]
    },
    tutorId:{
        type:String,
        required:[true,"Tutor Id is required"]
    },
    templateId:{
        type:String,
        required:[true,"Template Id is required"]
    },
    schedule:[ScheduleSchema],
    classCount:{
        type:Number,
        required:[true,"Count of total classes is required"]
    },
    subject:{
        type:String,
        required:[true,"Subject is required"]
    },
    chaptersRequested:{
        type:[String],
        required:[true,"Chapters Requested is required"]
    }
});

const OrderDetailsModel=mongoose.model('Orderdetails',paymentOrderDetailSchema);

module.exports=OrderDetailsModel;
