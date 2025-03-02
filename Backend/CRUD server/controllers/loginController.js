const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { getAuth } = require('firebase/auth')

const { adminApp: student_admin, app: student_app } = require('../config/student_config')
const { adminApp: tutor_admin, app: tutor_app } = require('../config/tutor_config')
const student = require('../models/studentDetailModel')
const tutor = require('../models/tutorDetailModel')

// console.log(student_admin.credential.cert())

const studentLogin = async (req, res) => {
    const studentDetails = req.body
    try {
        const decodedToken = await student_admin.auth(student_app).verifyIdToken(studentDetails.idToken)
        if (decodedToken) {
            if (decodedToken.uid == studentDetails.uid) {
                //still lot of stuff is pending
                return res.status(200).json({ Message: "User verified successfully" })
            }
            return res.status(409).json({ Error: "Invalid credentials ...UID mismatch" })
        }
        else {
            console.log("Invalid idToken")
            return res.status(409).json({ Error: "Invalid Idtoken" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }

}

const tutorLogin = async (req, res) => {
    const tutorDetails = req.body
    try {
        const decodedToken = await tutor_admin.auth(tutor_app).verifyIdToken(tutorDetails.idToken)
        if (decodedToken) {
            if (decodedToken.uid == tutorDetails.uid) {
                //still lot of stuff is pending
                return res.status(200).json({ Message: "User verified successfully" })
            }
            return res.status(409).json({ Error: "Invalid credentials ...UID mismatch" })
        }
        else {
            console.log("Invalid idToken")
            return res.status(409).json({ Error: "Invalid Idtoken" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
}

module.exports = {
    studentLogin,
    tutorLogin
}