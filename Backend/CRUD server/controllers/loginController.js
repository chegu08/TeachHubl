const bcrypt = require('bcrypt')
const { getAuth } = require('firebase/auth')

const { adminApp: student_admin, app: student_app } = require('../config/student_config')
const { adminApp: tutor_admin, app: tutor_app } = require('../config/tutor_config')
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const authSessionModel=require("../models/authSessionModel");
const jwt=require("jsonwebtoken");
const dotenv=require('dotenv');
dotenv.config({path:"D:/GitHub/TeachHubl/.env"});
const {v4:uuid}=require("uuid");

const saltRound = 12;
const auth_secret=process.env.AUTH_SECRET;

// console.log(student_admin.credential.cert())
const studentLoginWithEmailAndPassword=async (req,res)=>{
    try {
        const {email,password,sessionType}=req.body;

        const studentDetail=await student.findOne({email});
        if(!studentDetail) {
            return res.status(401).json({Error:"User not found...signup required"});
        }
        // const hashedPassword=await bcrypt.hash(password,saltRound);
        const passwordinDB=studentDetail.password;
        if(!passwordinDB) {
            return res.status(403).json({Error:"Incorrect password"});
        }
        const isMatchingPassword=await bcrypt.compare(password,studentDetail.password);

        if(!isMatchingPassword) {
            return res.status(403).json({Error:"Incorrect password"});
        }

        const sessionDetails={
            sessionId:uuid(),
            userId:studentDetail.uid,
            expiresAt:Date.now() + (sessionType=="long")?1000*60*60*24:1000*60*60*24*30,
            role:"Student",
            sessionType:"long"
        }
        await authSessionModel.create(sessionDetails);
        const auth_token=jwt.sign({
            sessionId:sessionDetails.sessionId,
            userId:sessionDetails.userId,
            role:"Student",
            expiresAt:sessionDetails.expiresAt
        },auth_secret);
        res.status(200).json({Message:"Login successful",auth_token});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const tutorLoginWithEmailAndPassword=async (req,res) =>{
    try {
        const {email,password,sessionType}=req.body;

        const tutorDetail=await tutor.findOne({email});
        if(!tutorDetail) {
            return res.status(401).json({Error:"User not found...signup required"});
        }
        // const hashedPassword=await bcrypt.hash(password,saltRound);
        const passwordinDB=tutorDetail.password;
        if(!passwordinDB) {
            return res.status(403).json({Error:"Incorrect password"});
        }
        const isMatchingPassword=await bcrypt.compare(password,tutorDetail.password);

        if(!isMatchingPassword) {
            return res.status(403).json({Error:"Incorrect password"});
        }

        const sessionDetails={
            sessionId:uuid(),
            userId:tutorDetail.uid,
            expiresAt:Date.now() + (sessionType=="long")?1000*60*60*24:1000*60*60*24*30,
            role:"Tutor",
            sessionType:"long"
        }
        await authSessionModel.create(sessionDetails);
        const auth_token=jwt.sign({
            sessionId:sessionDetails.sessionId,
            userId:sessionDetails.userId,
            role:"Tutor",
            expiresAt:sessionDetails.expiresAt
        },auth_secret);
        res.status(200).json({Message:"Login successful",auth_token});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

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
};

const getUserName=async (req,res)=>{
    try {
        const {userId,role}=req.query;
        console.log(req.query);

        if(role!="Student"&&role!="Tutor") {
            console.log("Ambiguos role mentioned");
            return res.status(400).json({Error:"Ambiguos role mentioned"});
        }

        if(role=="Student") {
            const user=await student.findOne({uid:userId});
            if(!user) {
                return res.status(400).json({Error:"No user found"});
            }
            return res.status(200).json(user.name);
        }

        const user=await tutor.findOne({uid:userId});
        if(!user) {
                return res.status(400).json({Error:"No user found"});
            }
        return res.status(200).json(user.name);


    } catch(err) {
        console.log(err);
        return res.status(500).json({Error:err});
    }
};

module.exports = {
    studentLogin,
    tutorLogin,
    studentLoginWithEmailAndPassword,
    tutorLoginWithEmailAndPassword,
    getUserName
}