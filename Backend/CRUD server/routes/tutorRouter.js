const Router=require("express").Router();
const multer=require('multer');
const upload=multer();
const {
    getBestTutors,
    createNewTemplateCourse,
    getTemplateCourses,
    getAllTemplateCourses,
    getTemplateDetails,
    getTemplateImage
}=require("../controllers/tutorController");

Router.get('/best',getBestTutors);
Router.get('/alltemplate',getAllTemplateCourses);
Router.get('/template/:tutorId',getTemplateCourses);
Router.get('/template-information/:templateId',getTemplateDetails);
Router.get('/template-image/:templateId',getTemplateImage);
Router.post('/template',upload.array('resources'),createNewTemplateCourse);

module.exports=Router;