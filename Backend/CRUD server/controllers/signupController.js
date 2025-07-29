const bcrypt = require('bcrypt');
//const mongoose = require('mongoose')

// const { admin } = require("../config/firebase_config")
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const authSessionModel=require("../models/authSessionModel");
const jwt=require("jsonwebtoken");
const {v4:uuid}=require("uuid");
const dotenv=require('dotenv');
dotenv.config({path:"D:/GitHub/TeachHubl/.env"});

const saltRound = 12;
const auth_secret=process.env.AUTH_SECRET;

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
            uid: uuid(),
            photo:studentDetails.photo||"no photo",
        }


        try {
            const expiresAt=Date.now()+((studentDetails.sessionType=="long")?1000*60*60*24*30:1000*60*60*24);
            const session=await authSessionModel.create({
                sessionId:uuid(),
                sessionType:studentDetails.sessionType,
                role:"Student",
                userId:newStudent.uid,
                expiresAt:new Date(expiresAt)
            });
            await student.create(newStudent);
            const auth_token=jwt.sign({sessionId:session.sessionId,userId:session.userId,expiresAt:session.expiresAt,role:session.role},auth_secret);
            res.status(200).json({ message: "Student signup is successful",auth_token });
        } catch (err) {
            console.log(err)
            res.status(500).json({ Error: "Student Details can not be saved in database" })
        }

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
            photo: mentorDetails.photo||"no photo",
            address: mentorDetails.address,
            yearsofExperience: mentorDetails.yearsofExperience,
            degree: mentorDetails.degree,
            uid: uuid(),
            isActive:true,
            reviewsObtained:0,
            averageRating:0,
            tutorSlots:[
                {
                    day:"Mon",
                    numOfSlots:1,
                    slots:[{startTime:"10:10",endTime:"12:00"}]
                }
            ]
        }

        try {
            const expiresAt=Date.now()+(mentorDetails.sessionType=="long")?1000*60*60*24*30:1000*60*60*24;
            const session=await authSessionModel.create({
                sessionId:uuid(),
                sessionType:mentorDetails.sessionType,
                role:"Tutor",
                userId:newMentor.uid,
                expiresAt:new Date(expiresAt)
            });
            await tutor.create(newMentor);
            const auth_token=jwt.sign({sessionId:session.sessionId,userId:session.userId,expiresAt:session.expiresAt,role:session.role},auth_secret);
            res.status(200).json({ message: "Tutor signup is successful" ,auth_token});

        } catch (err) {
            console.log(err)
            res.status(500).json({ Error: "Tutor Details can not be saved in database" })
        }
        // handle database logic
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