const Router=require("express").Router();
const {
    sendRequestToTutor,
    getStudentRequests,
    cancelStudentRequest,
    getTutorRequests,
    rejectStudentRequest
}=require("../controllers/classRequestController");

Router.post("/",sendRequestToTutor);
Router.get("/student/:studId/:status",getStudentRequests);
Router.get("/tutor/:tutorId/:status",getTutorRequests);
Router.delete("/",cancelStudentRequest);
Router.put("/reject",rejectStudentRequest);



module.exports=Router;