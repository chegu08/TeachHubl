const Router=require("express").Router();

const { 
    createTest, 
    uploadresult, 
    uploadfeedback, 
    uploadresponse, 
    deleteTest,
    getUpcomingtestdetails,
    getTestDetails,
    getAllTests,
    getTestStatistics,
    getUncorrectedTestDetails
} = require('../controllers/testController')


Router.get('/statistics/:testId',getTestStatistics)
Router.get('/all/:id',getAllTests)
Router.get('/tutor/:tutorId',getUncorrectedTestDetails);
Router.get('/:id/upcoming',getUpcomingtestdetails);
Router.get('/:id',getTestDetails)
Router.post('/', createTest)
Router.put('/result', uploadresult)
Router.put('/feedback', uploadfeedback)
Router.put('/response', uploadresponse)
Router.delete('/', deleteTest)

module.exports = Router

