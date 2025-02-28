const router = require('express').Router()
const {
    studentLogin,
    tutorLogin
} = require('../controllers/loginController')


router.post('/student', studentLogin)
router.post('/tutor', tutorLogin)

module.exports = router;