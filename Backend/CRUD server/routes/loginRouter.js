const router = require('express').Router()
const {
    studentLogin,
    tutorLogin,
    studentLoginWithEmailAndPassword,
    tutorLoginWithEmailAndPassword
} = require('../controllers/loginController')

router.post('/student', studentLogin)
router.post('/tutor', tutorLogin)
router.post('/student/emailandpassword',studentLoginWithEmailAndPassword);
router.post('/tutor/emailandpassword',tutorLoginWithEmailAndPassword);

module.exports = router;