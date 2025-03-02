// Import the functions you need from the SDKs you need
require('dotenv').config({path:'D:/Github/TeachHubl/.env'})
const firebaseapp = require('firebase/app')
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDQ3nh0LH_RZ1kYSPFo0wv3Leu-3IW-6oM",
    authDomain: "auth-tut-teacher.firebaseapp.com",
    projectId: "auth-tut-teacher",
    storageBucket: "auth-tut-teacher.firebasestorage.app",
    messagingSenderId: "826643067187",
    appId: "1:826643067187:web:7846632c2ad04b0d40ce46",
    measurementId: "G-Z0KC1PPXBX"
};

// Initialize Firebase
const app = firebaseapp.initializeApp(firebaseConfig, "tutor_app");
//const app=firebaseapp.getApp("tutor_app")
//const analytics = getAnalytics(app);
const admin = require("firebase-admin");

const serviceAccount = require(process.env.TUTOR_SERVICE_ACCOUNT);

const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}, "tutor_app");
module.exports = { app, adminApp }