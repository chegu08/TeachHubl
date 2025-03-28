const { unique } = require('agenda/dist/job/unique')
const mongoose = require('mongoose')
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    profession: String,
    preferredSubjects: Array,
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
    uid: {
        type: String,
        required: true,
        unique:true
    }
})

const student = mongoose.model("studentDetail", studentSchema)

module.exports = student