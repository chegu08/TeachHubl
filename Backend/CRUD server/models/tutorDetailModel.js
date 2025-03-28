const mongoose = require('mongoose')
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
        requird: true
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
    }
})

const tutor = mongoose.model("tutorDetail", tutorSchema)
module.exports = tutor

