const Router=require("express").Router();

const { createTest, uploadresult, uploadfeedback, uploadresponse, deleteTest } = require('../controllers/testController')

Router.post('/', createTest)
Router.put('/result', uploadresult)
Router.put('/feedback', uploadfeedback)
Router.put('/response', uploadresponse)
Router.delete('/', deleteTest)

module.exports = Router

