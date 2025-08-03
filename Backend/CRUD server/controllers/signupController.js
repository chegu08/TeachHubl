const bcrypt = require('bcrypt');
//const mongoose = require('mongoose')

// const { admin } = require("../config/firebase_config")
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const authSessionModel = require("../models/authSessionModel");
const { OAuth2Client } = require('google-auth-library');
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const dotenv = require('dotenv');
dotenv.config({ path: "D:/GitHub/TeachHubl/.env" });

const saltRound = 12;
const auth_secret = process.env.AUTH_SECRET;

const auth_token_cache_for_google_login = {};

async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`, {
        method: "POST"
    });
    const res = await response.json();
    return res;
};

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
            photo: studentDetails.photo || "no photo",
        }


        try {
            const expiresAt = Date.now() + ((studentDetails.sessionType == "long") ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24);
            const session = await authSessionModel.create({
                sessionId: uuid(),
                sessionType: studentDetails.sessionType,
                role: "Student",
                userId: newStudent.uid,
                expiresAt: new Date(expiresAt)
            });
            await student.create(newStudent);
            const auth_token = jwt.sign({ sessionId: session.sessionId, userId: session.userId, expiresAt: session.expiresAt, role: session.role }, auth_secret);
            res.status(200).json({ message: "Student signup is successful", auth_token });
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
            photo: mentorDetails.photo || "no photo",
            address: mentorDetails.address,
            yearsofExperience: mentorDetails.yearsofExperience,
            degree: mentorDetails.degree,
            uid: uuid(),
            isActive: true,
            reviewsObtained: 0,
            averageRating: 0,
            tutorSlots: [ // this is just temporary ...change the logic later
                {
                    day: "Mon",
                    numOfSlots: 1,
                    slots: [{ startTime: "10:10", endTime: "12:00" }]
                }
            ]
        }

        try {
            const expiresAt = Date.now() + (mentorDetails.sessionType == "long") ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24;
            const session = await authSessionModel.create({
                sessionId: uuid(),
                sessionType: mentorDetails.sessionType,
                role: "Tutor",
                userId: newMentor.uid,
                expiresAt: new Date(expiresAt)
            });
            await tutor.create(newMentor);
            const auth_token = jwt.sign({ sessionId: session.sessionId, userId: session.userId, expiresAt: session.expiresAt, role: session.role }, auth_secret);
            res.status(200).json({ message: "Tutor signup is successful", auth_token });

        } catch (err) {
            console.log(err)
            res.status(500).json({ Error: "Tutor Details can not be saved in database" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: err })
    }
};

const getAuthUrl = async (req, res) => {
    try {
        const { role, name, age, phoneNumber, profession, preferredSubjects, gender, address, yearsofExperience, degree, sessionType } = req.body;
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Referrer-Policy', 'no-referrer-when-downgrade');

        const redirectUrl = `http://localhost:4000/signup/${role}/google`;
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        const userInformation = {
            name,
            age,
            phoneNumber,
            profession,
            preferredSubjects,
            uid: uuid(),
            role,
            sessionType
        };

        if (String(role).toLowerCase() == "tutor") {
            userInformation.gender = gender;
            userInformation.address = address;
            userInformation.yearsofExperience = yearsofExperience;
            userInformation.degree = degree;
        }

        const auth_url = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
            prompt: "consent",
            state: encodeURIComponent(JSON.stringify(userInformation))
        });

        res.status(200).json(auth_url);
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const studentGoogleSignup = async (req, res) => {
    res.header('Access-Control-Allow-Origin','http://localhost:5173');
    console.log("Hit correctly");
    try {

        const { code } = req.query;
        const state=JSON.parse(decodeURIComponent(req.query.state));
        const redirectUrl = 'http://localhost:4000/signup/student/google'
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        )
        const tokenres = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokenres.tokens);
        const user = oAuth2Client.credentials;
        const userData = await getUserData(user.access_token);
        console.log("credentials ", user);
        console.log("user Data ", userData);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: user.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = await ticket.getPayload();
        console.log("payload ", payload);
        // console.log("state ", JSON.parse(decodeURIComponent(state)));

        // register the student

        try {

            const studentInformation = {
                name: state.name,
                age: state.age,
                profession: state?.profession,
                phoneNumber: state.phoneNumber,
                preferredSubjects: state.preferredSubjects,
                uid: state.uid,
                email: payload.email,
                photo: payload.picture
            };

            await student.create(studentInformation);

            const sessionDetails = {
                sessionId: uuid(),
                userId: studentInformation.uid,
                expiresAt: Date.now() + ((state.sessionType == "long") ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30),
                role: "Student",
                sessionType: state.sessionType
            }

            const auth_token = jwt.sign({
                sessionId: sessionDetails.sessionId,
                userId: sessionDetails.userId,
                role: "Student",
                expiresAt: sessionDetails.expiresAt
            }, auth_secret);

            const auth_token_cache_key = uuid();
            auth_token_cache_for_google_login[auth_token_cache_key] = {
                expiresAt: Date.now() + 1000 * 60 * 2,
                sessionDetails,
                auth_token
            };
            return res.redirect(`http://localhost:5173/signUp?signedInWithGoogle=true&key=${auth_token_cache_key}&retryneeded=false`);
        } catch (err) {
            console.log(err);
        }
        res.redirect('http://localhost:5173');

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};


const tutorGoogleSignup = async (req, res) => {
    res.header('Access-Control-Allow-Origin','http://localhost:5173');
    console.log("Hit correctly");
    try {

        const { code } = req.query;
        const state=JSON.parse(decodeURIComponent(req.query.state));
        const redirectUrl = 'http://localhost:4000/signup/tutor/google'
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        )
        const tokenres = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokenres.tokens);
        const user = oAuth2Client.credentials;
        const userData = await getUserData(user.access_token);
        console.log("credentials ", user);
        console.log("user Data ", userData);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: user.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = await ticket.getPayload();
        console.log("payload ", payload);
        console.log("state ",state);
    
        // register the tutor

        try {

            const tutorInformation = {
                name: state.name,
                age: state.age,
                profession: state?.profession,
                phoneNumber: state.phoneNumber,
                preferredSubjects: state.preferredSubjects,
                uid: state.uid,
                email: payload.email,
                photo: payload.picture,
                gender: state.gender,
                address: state.address,
                yearsofExperience: state.yearsofExperience,
                degree: state.degree,
                isActive: true,
                reviewsObtained: 0,
                averageRating: 0,
                tutorSlots: [ // this is just temporary ...change the logic later
                    {
                        day: "Mon",
                        numOfSlots: 1,
                        slots: [{ startTime: "10:10", endTime: "12:00" }]
                    }
                ]
            };
            await tutor.create(tutorInformation);

            const sessionDetails = {
                sessionId: uuid(),
                userId: tutorInformation.uid,
                expiresAt: Date.now() + ((state.sessionType == "long") ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30),
                role: "Tutor",
                sessionType: state.sessionType
            }

            const auth_token = jwt.sign({
                sessionId: sessionDetails.sessionId,
                userId: sessionDetails.userId,
                role: "Tutor",
                expiresAt: sessionDetails.expiresAt
            }, auth_secret);

            const auth_token_cache_key = uuid();
            auth_token_cache_for_google_login[auth_token_cache_key] = {
                expiresAt: Date.now() + 1000 * 60 * 2,
                sessionDetails,
                auth_token
            };
            console.log("redirected correctly");
            return res.redirect(`http://localhost:5173/signUp?signedInWithGoogle=true&key=${auth_token_cache_key}&retryneeded=false`);
        } catch (err) {
            console.log(err);
        }
        res.redirect('http://localhost:5173');

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const fetchAuthTokenFromCache=async (req,res) =>{
    res.header('Access-Control-Allow-Origin','http://localhost:5173');
    console.log("Finally hit fetch");
    try {
        const {key}=req.body;
        if(!Object.keys(auth_token_cache_for_google_login).some(val=>val==key)) {
            console.log("Cache key is the problem");
            return res.redirect(`http://localhost:5173/signUp?signedInWithGoogle=true&key=${key}&retryneeded=true`);
        }

        const expiry=auth_token_cache_for_google_login[key].expiresAt;
        if(Date.now()>expiry) {
            delete auth_token_cache_for_google_login[key];
            console.log("Cache expiry is the problem");
            return res.redirect(`http://localhost:5173/signUp?signedInWithGoogle=true&key=${key}&retryneeded=true`);
        }

        // this auth_token and session is valid
        // bacause the client has requested the auth_token correctly with expiration time 
        await authSessionModel.create(auth_token_cache_for_google_login[key].sessionDetails);

        res.status(200).json(auth_token_cache_for_google_login[key].auth_token);

        delete auth_token_cache_for_google_login[key];

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};


module.exports = {
    studentSignupWithEmailPassword,
    mentorSignupWithEmailPassword,
    studentGoogleSignup,
    tutorGoogleSignup,
    getAuthUrl,
    fetchAuthTokenFromCache
}