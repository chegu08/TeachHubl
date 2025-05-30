const Router=require("express").Router();
const multer=require('multer');
const upload=multer();
const {
    getBestTutors,
    createNewTemplateCourse,
    getTemplateCourses
}=require("../controllers/tutorController");

Router.get('/best',getBestTutors);
Router.get('/template/:tutorId',getTemplateCourses);
Router.post('/template',upload.array('resources'),createNewTemplateCourse);

module.exports=Router;