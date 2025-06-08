const Router=require("express").Router();
const {
    sendRequestToTutor,
    getStudentRequests,
    cancelStudentRequest
}=require("../controllers/classRequestController");

Router.post("/",sendRequestToTutor);
Router.get("/student/:studId/:status",getStudentRequests);
Router.delete("/",cancelStudentRequest);



module.exports=Router;