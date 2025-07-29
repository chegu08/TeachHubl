const router = require('express').Router()
const {
    studentLogin,
    tutorLogin,
    studentLoginWithEmailAndPassword,
    tutorLoginWithEmailAndPassword,
    getUserName
} = require('../controllers/loginController')

router.get('/userName',getUserName);
router.post('/student', studentLogin);
router.post('/tutor', tutorLogin);
router.post('/student/emailandpassword',studentLoginWithEmailAndPassword);
router.post('/tutor/emailandpassword',tutorLoginWithEmailAndPassword);

module.exports = router;