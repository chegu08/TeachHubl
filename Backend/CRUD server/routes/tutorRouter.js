const Router=require("express").Router();
const multer=require('multer');
const upload=multer();
const {
    getBestTutors,
    createNewTemplateCourse,
    getTemplateCourses,
    getAllTemplateCourses,
    getTemplateDetails,
    getTemplateImage,
    getTutorSchedule,
    getSlots,
    uploadResponse,
    getResponsesForStudent,
    getResponseDetails,
    getRevenueDetails,
    uploadReview,
    getReviews
}=require("../controllers/tutorController");

Router.get('/best',getBestTutors);
Router.get('/alltemplate',getAllTemplateCourses);
Router.get('/template/:tutorId',getTemplateCourses);
Router.get('/template-information/:templateId',getTemplateDetails);
Router.get('/template-image/:templateId',getTemplateImage);
Router.get('/schedule/:tutorId',getTutorSchedule);
Router.get('/slots/:tutorId',getSlots);
Router.get('/response/student/:studId',getResponsesForStudent);
Router.get('/response-details/:responseId',getResponseDetails);
Router.get('/revenue/:tutorId',getRevenueDetails);
Router.get('/reviews/:tutorId',getReviews);
Router.post('/template',upload.array('resources'),createNewTemplateCourse);
Router.post('/response',uploadResponse);
Router.post('/review',uploadReview);


module.exports=Router;