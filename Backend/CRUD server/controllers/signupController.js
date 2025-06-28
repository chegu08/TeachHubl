const bcrypt = require('bcrypt')
//const mongoose = require('mongoose')

// const { admin } = require("../config/firebase_config")
const student = require('../models/studentDetailModel')
const tutor = require('../models/tutorDetailModel')

const saltRound = 12;

const studentSignupWithEmailPassword = async (req, res) => {
    const studentDetails = req.body;
    try {
        const hashedPassword = await bcrypt.hash(studentDetails.password, saltRound);
        const newStudent = {
            name: studentDetails.name,
            age: studentDetails.age,
            phoneNumber: studentDetails.phoneNumber,
            profession: studentDetails.profession,
            preferredSubjects: studentDetails.preferredSubjects,
            email: studentDetails.email,
            password: hashedPassword,
            uid: studentDetails.uid,
            photo:studentDetails.photo
        }

        try {
            await student.create(newStudent)
        } catch (err) {
            console.log(err)
            return res.status(500).json({ Error: "Student Details can not be saved in database" })
        }

        return res.status(200).json({ message: "Student signup is successful" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}

const mentorSignupWithEmailPassword = async (req, res) => {
    const mentorDetails = req.body;
    try {
        const hashedPassword = await bcrypt.hash(mentorDetails.password, saltRound);
        const newMentor = {
            name: mentorDetails.name,
            age: mentorDetails.age,
            phoneNumber: mentorDetails.phoneNumber,
            profession: mentorDetails.profession,
            preferredSubjects: mentorDetails.preferredSubjects,
            email: mentorDetails.email,
            password: hashedPassword,
            gender: mentorDetails.gender,
            photo: mentorDetails.photo,
            address: mentorDetails.address,
            yearsofExperience: mentorDetails.yearsofExperience,
            degree: mentorDetails.degree,
            uid: mentorDetails.uid,
            isActive:mentorDetails.isActive
        }

        try {
            await tutor.create(newMentor)
        } catch (err) {
            console.log(err)
            return res.status(500).json({ Error: "Tutor Details can not be saved in database" })
        }
        // handle database logic
        return res.status(200).json({ message: "Tutor signup is successful" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}



const studentGoogleSignup = async (req, res) => {
    const studentDetails = req.body;
    try {
        const newStudent = {
            name: studentDetails.name,
            age: studentDetails.age,
            phoneNumber: studentDetails.phoneNumber,
            profession: studentDetails.profession,
            preferredSubjects: studentDetails.preferredSubjects,
            email: studentDetails.email,
            uid: studentDetails.uid,
            photo:studentDetails.photo
        }

        try {
            await student.create(newStudent)
        } catch (err) {
            console.log(err)
            return res.status(500).json({ Error: "Student Details can not be saved in database" })
        }

        return res.status(200).json({ message: "Student signup is successful" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}



const tutorGoogleSignup = async (req, res) => {
    const mentorDetails = req.body;
    try {
        const newMentor = {
            name: mentorDetails.name,
            age: mentorDetails.age,
            phoneNumber: mentorDetails.phoneNumber,
            email: mentorDetails.email,
            gender: mentorDetails.gender,
            photo: mentorDetails.photo,
            address: mentorDetails.address,
            yearsofExperience: mentorDetails.yearsofExperience,
            degree: mentorDetails.degree,
            uid: mentorDetails.uid,
            isActive:mentorDetails.isActive
        }

        try {
            await tutor.create(newMentor)
        } catch (err) {
            console.log(err)
            return res.status(500).json({ Error: "Tutor Details can not be saved in database" })
        }
        // handle database logic
        return res.status(200).json({ message: "Tutor signup is successful" });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
}


module.exports = {
    studentSignupWithEmailPassword,
    mentorSignupWithEmailPassword,
    studentGoogleSignup,
    tutorGoogleSignup
}