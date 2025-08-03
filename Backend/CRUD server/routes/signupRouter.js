const router = require('express').Router()
const {
    studentSignupWithEmailPassword,
    mentorSignupWithEmailPassword,
    studentGoogleSignup,
    tutorGoogleSignup,
    getAuthUrl,
    fetchAuthTokenFromCache
} = require('../controllers/signupController')

router.post('/authUrl',getAuthUrl);
router.post('/student/emailAndPassword', studentSignupWithEmailPassword)
router.post('/tutor/emailandpassword', mentorSignupWithEmailPassword)
router.get('/student/google', studentGoogleSignup)
router.get('/tutor/google', tutorGoogleSignup)
router.post('/authToken',fetchAuthTokenFromCache);


module.exports = router