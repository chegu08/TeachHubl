const Router=require("express").Router();

const {
    getTodayScheduleForStudent,
    getTodayScheduleForTutor
}=require('../controllers/classScheduleController');

Router.get('/student/:studId',getTodayScheduleForStudent);
Router.get('/tutor/:tutorId',getTodayScheduleForTutor);

module.exports=Router;