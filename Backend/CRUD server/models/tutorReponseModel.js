
const mongoose = require("mongoose");

const tutorResponseSchema = new mongoose.Schema({
    responseId: {
        type: String,
        required: true,
        unique: true
    },
    requestId: {
        required: true,
        type: String
    },
    templateId: {
        type: String,
        required: true
    },
    studId: {
        required: true,
        type: String
    },
    tutorId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    classes: {
        type: Number,
        required: true
    },
    valid_till: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                const endDateIgnoringTime = new Date(v);
                endDateIgnoringTime.setHours(0, 0, 0, 0);
                const startDateIgnoringTime = new Date(this.startDate);
                startDateIgnoringTime.setHours(0, 0, 0, 0);
                return startDateIgnoringTime <= endDateIgnoringTime
            },
            message: "End Date must not precede start Date"
        }
    },
    schedule: {
        type: [{
            date: {
                type: Date,
                required: true
            },
            slots: {
                required: true,
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
                }]
            }

        }],
        required: true
    }
});

const tutorResponseModel = mongoose.model('TutorResponse', tutorResponseSchema);

module.exports = tutorResponseModel;