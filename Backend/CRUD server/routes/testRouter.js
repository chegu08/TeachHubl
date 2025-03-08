const Router=require("express").Router();

const { 
    createTest, 
    uploadresult, 
    uploadfeedback, 
    uploadresponse, 
    deleteTest,
    getUpcomingtestdetails,
    getTestDetails,
    getAllTests
} = require('../controllers/testController')

Router.get('/all/:id',getAllTests)
Router.get('/:id/upcoming',getUpcomingtestdetails)
Router.get('/:id',getTestDetails)
Router.post('/', createTest)
Router.put('/result', uploadresult)
Router.put('/feedback', uploadfeedback)
Router.put('/response', uploadresponse)
Router.delete('/', deleteTest)

module.exports = Router

