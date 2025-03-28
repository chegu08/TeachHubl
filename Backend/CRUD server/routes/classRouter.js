const Router=require("express").Router();
const {
    createClass,
    getClassDetailsForStudent,
    getAllCourseInformation
}=require('../controllers/classController');


Router.get('/student/getInfo/:studId',getAllCourseInformation)
Router.get('/student/:studId',getClassDetailsForStudent)
Router.post('/newClass',createClass);

module.exports=Router;