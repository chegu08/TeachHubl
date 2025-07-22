const Router=require("express").Router();
const multer=require("multer");
const upload=multer();

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
    getUncorrectedTestDetails,
    getAllTutorTests,
    getQuestionPaperForCustomTest
} = require('../controllers/testController')


Router.get('/statistics/:testId',getTestStatistics);
Router.get('/all/:id',getAllTests);
Router.get('/all/tutor/:tutorId',getAllTutorTests);
Router.get('/tutor/:tutorId',getUncorrectedTestDetails);
Router.get('/:id/upcoming',getUpcomingtestdetails);
Router.get('/:id',getTestDetails);
Router.get('/custom-test-question-paper/:testId',getQuestionPaperForCustomTest);
Router.post('/',upload.single('questionForCustomTest'), createTest);
Router.put('/result', uploadresult);
Router.put('/feedback', uploadfeedback);
Router.put('/response',upload.array("answersheet"), uploadresponse);
Router.delete('/', deleteTest);

module.exports = Router

