const mongoose = require('mongoose');

const ScheduleSchema= new mongoose.Schema({
    date:{
        type:Date,
        required:true
    },
    slots:{
        type:[{
            startTime:{
                type:String,
                required:true, // store it in HH:MM format
                validate:{
                    validator:function (v){
                        const hours=Number(v.substring(0,2));
                        if(hours<0 || hours>=24) return false;
                        const minutes=Number(v.substring(3));
                        if(minutes<0||minutes>=60) return false;
                        return true;
                    },
                    message:"Incorrect format of startTime ...Expected HH:MM format"
                }
            },
            endTime:{
                type:String,
                required:true,  // store it in HH:MM format
                validate:{
                    validator:function (v){
                        const hours=Number(v.substring(0,2));
                        if(hours<0 || hours>=24) return false;
                        const minutes=Number(v.substring(3));
                        if(minutes<0||minutes>=60) return false;
                        return true;
                    },
                    message:"Incorrect format of endTime ...Expected HH:MM format"
                }
            }
        }],
        required:true
    }
});

const classScheduleSchema = new mongoose.Schema({
    scheduleId: {
        type: String,
        required: true,
        unique: true
    },
    classId: {
        type: String,
        required: true,
        unique: true
    },
    className: {
        type: String,
        required: true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    numberOfClasses:{
        type:Number,
        required:true
    },
    schedule:{
        type:[ScheduleSchema],
        required:true
    }
});

const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);
module.exports = ClassSchedule;