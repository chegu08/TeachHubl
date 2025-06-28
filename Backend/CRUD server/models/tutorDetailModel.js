const mongoose = require('mongoose');

const slotSchema=new mongoose.Schema({
    day:{
        type:String,
        required:true,
        unique:true
    },
    numOfSlots:{
        type:Number,
        required:true,
    },
    slots:{
        type:[{
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
        required:true,
        validate:{
            validator: function (v) {
                return v.length==this.numOfSlots
            },
            message:"The number of slots does not match with the actual slots given"
        }
    }
});

const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Converts email to lowercase before saving
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address',
        ],
    },
    password: String,
    phoneNumber: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    yearsofExperience: {
        type: Number,
        required: true
    },
    photo: String,
    uid: {
        type: String,
        required: true,
        unique:true
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true
    },
    tutorSlots:{
        type:[slotSchema],
        default:[]
    }

})

const tutor = mongoose.model("tutorDetail", tutorSchema)
module.exports = tutor

