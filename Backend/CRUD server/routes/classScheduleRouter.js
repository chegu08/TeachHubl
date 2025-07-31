const Router=require("express").Router();

const {
    getTodayScheduleForStudent,
    getTodayScheduleForTutor,
    markAttendanceAndGetClassId,
    getAttendanceReport
}=require('../controllers/classScheduleController');

Router.get('/student/:studId',getTodayScheduleForStudent);
Router.get('/tutor/:tutorId',getTodayScheduleForTutor);
Router.get('/attendance',getAttendanceReport);
Router.post('/attendance',markAttendanceAndGetClassId);

module.exports=Router;