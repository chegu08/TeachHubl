// Import the functions you need from the SDKs you need
require('dotenv').config({path:'D:Github/TeachHubl/.env'})
const { initializeApp } = require('firebase/app');
const admin = require("firebase-admin");
const serviceAccount = require(STUDENT_SERVICE_ACCOUNT);
//const test=require('firebase-admin/app')

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpQrHKTLhO-T4MUGQ7I8KWzG20ko0tX6A",
    authDomain: "auth-tut-af184.firebaseapp.com",
    projectId: "auth-tut-af184",
    storageBucket: "auth-tut-af184.firebasestorage.app",
    messagingSenderId: "60573398861",
    appId: "1:60573398861:web:33fed26d1961ec3531e904",
    measurementId: "G-HYQ5L8T1ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "student_app");

const adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}, "student_app");


module.exports = {
    app, adminApp
}

