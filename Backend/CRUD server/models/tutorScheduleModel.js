const mongoose = require('mongoose');


const scheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    eventDetail: {
        type: [{
            classId: {
                type: String,
                required: true
            },
            className: {
                type: String,
                required: true
            },
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
        }]
    }

});

const tutorScheduleSchema = new mongoose.Schema({
    tutorId: {
        type: String,
        required: true,
        unique: true
    },
    schedule: {
        type: [scheduleSchema],
        required: true
    }
});

const tutorSchedule = mongoose.model('tutorSchedule', tutorScheduleSchema);
module.exports = tutorSchedule;   