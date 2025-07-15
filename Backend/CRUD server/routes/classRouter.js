const Router=require("express").Router();
const {
    getClassDetailsForStudent,
    getAllCourseInformation,
    getClassDetailsForTutors,
    getAllCourseInformationForTutor,
    getClassDetailsForAboutPage_Student,
    getClassResources,
    getResourceContent,
    getNotesContent,
    getConnectedChatUsers
}=require('../controllers/classController');


Router.get('/student/getInfo/:studId',getAllCourseInformation);
Router.get('/student/:studId',getClassDetailsForStudent);
Router.get('/tutor/getInfo/:tutorId',getAllCourseInformationForTutor);
Router.get('/tutor/:tutorId',getClassDetailsForTutors);
Router.get('/student/aboutPage/:classId',getClassDetailsForAboutPage_Student);
Router.get('/class-resources/:classId',getClassResources);
Router.get('/resource-content',getResourceContent);
Router.get('/notes-content/:classId',getNotesContent);
Router.get('/connectedChatUsers/:userId',getConnectedChatUsers);

module.exports=Router;