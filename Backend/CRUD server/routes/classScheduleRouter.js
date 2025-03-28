const Router=require("express").Router();

const {
    getTodayScheduleForStudent
}=require('../controllers/classScheduleController');

Router.get('/student/:studId',getTodayScheduleForStudent);

module.exports=Router;