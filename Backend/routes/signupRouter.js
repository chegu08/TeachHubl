const router = require('express').Router()
const {
    studentSignupWithEmailPassword,
    mentorSignupWithEmailPassword,
    studentGoogleSignup,
    tutorGoogleSignup
} = require('../controllers/signupController')

router.post('/student/emailAndPassword', studentSignupWithEmailPassword)
router.post('/tutor/emailandpassword', mentorSignupWithEmailPassword)
router.post('/student/googleAuth', studentGoogleSignup)
router.post('/tutor/googeAuth', tutorGoogleSignup)


module.exports = router