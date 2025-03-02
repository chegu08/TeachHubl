const mongoose = require("mongoose")

const classSchema = new mongoose.Schema({
    classId: {
        type: String,
        required: true,
        unique: true
    },
    studId: {
        type: String,
        required: true
    },
    tutorId: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Starting date of the class is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'Ending date of the class is required']
    },
    duration: {
        //Duration is the number of hours the class is going to be held
        type: Number,
        required: [true, 'Class duration is required']
    },
    paymentId: {
        type: String,
        required: [true, 'Payment Id is required']
    },
    cancelled: {
        type: Boolean,
        required: [true, 'This is a mandatory field indicating whether the ongoing class is cancelled or not']
    },
    cancelledDate: {
        type: Date,
        validate: {
            validator: function (v) {
                if (this.cancelled === false) return !v
                else if (this.cancelled === true) return v && v.getTime() <= this.endDate.getTime()
                return true
            }
        }
    },
    refundDetailId: {
        type: String,
        validate: {
            validator: function (v) {
                if (this.cancelled === true) return v && v.length > 0
                return true
            }
        }
    },
    classCount: {
        type: Number,
        required: true
    }
})

const Class = mongoose.model("class",classSchema);

module.exports =  Class