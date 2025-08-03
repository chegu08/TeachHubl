const bcrypt = require('bcrypt');
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const authSessionModel = require("../models/authSessionModel");
const { OAuth2Client } = require("google-auth-library")
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config({ path: "D:/GitHub/TeachHubl/.env" });
const { v4: uuid } = require("uuid");

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

// console.log(student_admin.credential.cert())
const studentLoginWithEmailAndPassword = async (req, res) => {
    try {
        const { email, password, sessionType } = req.body;

        const studentDetail = await student.findOne({ email });
        if (!studentDetail) {
            return res.status(401).json({ Error: "User not found...signup required" });
        }
        // const hashedPassword=await bcrypt.hash(password,saltRound);
        const passwordinDB = studentDetail.password;
        if (!passwordinDB) {
            return res.status(403).json({ Error: "Incorrect password" });
        }
        const isMatchingPassword = await bcrypt.compare(password, studentDetail.password);

        if (!isMatchingPassword) {
            return res.status(403).json({ Error: "Incorrect password" });
        }

        const sessionDetails = {
            sessionId: uuid(),
            userId: studentDetail.uid,
            expiresAt: Date.now() + ((sessionType == "long") ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30),
            role: "Student",
            sessionType
        }
        await authSessionModel.create(sessionDetails);
        const auth_token = jwt.sign({
            sessionId: sessionDetails.sessionId,
            userId: sessionDetails.userId,
            role: "Student",
            expiresAt: sessionDetails.expiresAt
        }, auth_secret);
        res.status(200).json({ Message: "Login successful", auth_token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const tutorLoginWithEmailAndPassword = async (req, res) => {
    try {
        const { email, password, sessionType } = req.body;

        const tutorDetail = await tutor.findOne({ email });
        if (!tutorDetail) {
            return res.status(401).json({ Error: "User not found...signup required" });
        }
        // const hashedPassword=await bcrypt.hash(password,saltRound);
        const passwordinDB = tutorDetail.password;
        if (!passwordinDB) {
            return res.status(403).json({ Error: "Incorrect password" });
        }
        const isMatchingPassword = await bcrypt.compare(password, tutorDetail.password);

        if (!isMatchingPassword) {
            return res.status(403).json({ Error: "Incorrect password" });
        }

        const sessionDetails = {
            sessionId: uuid(),
            userId: tutorDetail.uid,
            expiresAt: Date.now() + ((sessionType == "long") ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30),
            role: "Tutor",
            sessionType
        };
        await authSessionModel.create(sessionDetails);
        const auth_token = jwt.sign({
            sessionId: sessionDetails.sessionId,
            userId: sessionDetails.userId,
            role: "Tutor",
            expiresAt: sessionDetails.expiresAt
        }, auth_secret);
        res.status(200).json({ Message: "Login successful", auth_token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};


const getUserName = async (req, res) => {
    try {
        const { userId, role } = req.query;
        console.log(req.query);

        if (role != "Student" && role != "Tutor") {
            console.log("Ambiguos role mentioned");
            return res.status(400).json({ Error: "Ambiguos role mentioned" });
        }

        if (role == "Student") {
            const user = await student.findOne({ uid: userId });
            if (!user) {
                return res.status(400).json({ Error: "No user found" });
            }
            return res.status(200).json(user.name);
        }

        const user = await tutor.findOne({ uid: userId });
        if (!user) {
            return res.status(400).json({ Error: "No user found" });
        }
        return res.status(200).json(user.name);


    } catch (err) {
        console.log(err);
        return res.status(500).json({ Error: err });
    }
};

const getAuthUrl = async (req, res) => {
    try {
        const { role, sessionType } = req.query;
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.header('Referrer-Policy', 'no-referrer-when-downgrade');

        const redirectUrl = `http://localhost:4000/login/${role}/google`;
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        const auth_url = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
            prompt: "consent",
            state: encodeURIComponent(JSON.stringify({ sessionType: sessionType }))
        });

        res.status(200).json(auth_url);
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const googleStudentLogin = async (req, res) => {
    console.log("Hit wrongly");
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    try {

        const { code } = req.query;
        const state = JSON.parse(decodeURIComponent(req.query.state));
        const redirectUrl = 'http://localhost:4000/login/student/google'
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

        // check whether the user has already registered or not 
        // else redirect the user to signup page

        try {
            const studentDetail = await student.findOne({ email: payload.email });

            if (!studentDetail) {
                return res.redirect('http://localhost:5173/signUp');
            }

            const sessionDetails = {
                sessionId: uuid(),
                userId: studentDetail.uid,
                expiresAt: Date.now() + ((state.sessionType == "long") ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 30),
                role: "Student",
                sessionType: state.sessionType
            }
            // await authSessionModel.create(sessionDetails);
            const auth_token = jwt.sign({
                sessionId: sessionDetails.sessionId,
                userId: sessionDetails.userId,
                role: "Student",
                expiresAt: sessionDetails.expiresAt
            }, auth_secret);

            const auth_token_cache_key = uuid();
            auth_token_cache_for_google_login[auth_token_cache_key] = {
                expiresAt: (new Date()).getTime() + 1000 * 60 * 2,
                sessionDetails,
                auth_token
            };
            return res.redirect(`http://localhost:5173/signIn?signedInWithGoogle=true&key=${auth_token_cache_key}&retryneeded=false`);
        } catch (err) {
            console.log(err);
        }
        res.redirect('http://localhost:5173');

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const googleTutorLogin = async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    console.log("Hit wrongly");
    try {
        const { code } = req.query;
        const state = JSON.parse(decodeURIComponent(req.query.state));
        const redirectUrl = 'http://localhost:4000/login/tutor/google'
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

        // check whether the user has already registered or not 
        // else redirect the user to signup page

        try {
            const tutorDetail = await tutor.findOne({ email: payload.email });

            if (!tutorDetail) {
                return res.redirect('http://localhost:5173/signUp');
            }

            const sessionDetails = {
                sessionId: uuid(),
                userId: tutorDetail.uid,
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
                expiresAt: (new Date()).getTime() + 1000 * 60 * 2,
                sessionDetails,
                auth_token
            };
            return res.redirect(`http://localhost:5173/signIn?signedInWithGoogle=true&key=${auth_token_cache_key}&retryneeded=false`);
        } catch (err) {
            console.log(err);
        }
        res.redirect('http://localhost:5173');

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const fetchAuthTokenFromCache = async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    try {
        const { key } = req.body;
        if (!Object.keys(auth_token_cache_for_google_login).some(val => val == key)) {
            return res.redirect(`http://localhost:5173/signIn?signedInWithGoogle=true&key=${key}&retryneeded=true`);
        }

        const expiry = auth_token_cache_for_google_login[key].expiresAt;
        if (Date.now() > expiry) {
            delete auth_token_cache_for_google_login[key];
            return res.redirect(`http://localhost:5173/signIn?signedInWithGoogle=true&key=${key}&retryneeded=true`);
        }

        // this auth_token and session is valid
        // bacause the client has requested the auth_token correctly with expiration time 
        await authSessionModel.create(auth_token_cache_for_google_login[key].sessionDetails);

        res.status(200).json(auth_token_cache_for_google_login[key].auth_token);

        delete auth_token_cache_for_google_login[key];

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

module.exports = {
    studentLoginWithEmailAndPassword,
    tutorLoginWithEmailAndPassword,
    getUserName,
    getAuthUrl,
    googleStudentLogin,
    googleTutorLogin,
    fetchAuthTokenFromCache
}