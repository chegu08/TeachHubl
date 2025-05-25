const Router=require("express").Router();
const {
    createClass,
    getClassDetailsForStudent,
    getAllCourseInformation,
    getClassDetailsForTutors
}=require('../controllers/classController');


Router.get('/student/getInfo/:studId',getAllCourseInformation);
Router.get('/student/:studId',getClassDetailsForStudent);
Router.get('/tutor/:tutorId',getClassDetailsForTutors);
Router.post('/newClass',createClass);


module.exports=Router;