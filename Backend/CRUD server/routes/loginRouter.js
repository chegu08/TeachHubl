const router = require('express').Router()
const {
    studentLoginWithEmailAndPassword,
    tutorLoginWithEmailAndPassword,
    getUserName,
    getAuthUrl,
    googleTutorLogin,
    googleStudentLogin,
    fetchAuthTokenFromCache
} = require('../controllers/loginController')

router.get('/userName',getUserName);
router.get('/authUrl',getAuthUrl);
router.get('/student/google',googleStudentLogin);
router.get('/tutor/google',googleTutorLogin);
router.post("/authToken",fetchAuthTokenFromCache);
router.post('/student/emailandpassword',studentLoginWithEmailAndPassword);
router.post('/tutor/emailandpassword',tutorLoginWithEmailAndPassword);

module.exports = router;