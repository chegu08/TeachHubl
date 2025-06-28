const Router=require("express").Router();
const {
    sendRequestToTutor,
    getStudentRequests,
    cancelStudentRequest,
    getTutorRequests,
    rejectStudentRequest,
    getMaxClassesAndPrice
}=require("../controllers/classRequestController");

Router.post("/",sendRequestToTutor);
Router.get('/template-information/max-classes-and-price/:templateId',getMaxClassesAndPrice);
Router.get("/student/:studId/:status",getStudentRequests);
Router.get("/tutor/:tutorId/:status",getTutorRequests);
Router.delete("/",cancelStudentRequest);
Router.put("/reject",rejectStudentRequest);



module.exports=Router;