const ClassRequestModel=require("../models/classRequestsModel");
const TutorTemplateCourseModel=require("../models/tutorTemplateCourseModel");
const StudentModel=require("../models/studentDetailModel");
const TutorModel=require("../models/tutorDetailModel");
const {v4:uuidv4} =require("uuid");
const student = require("../models/studentDetailModel");

const BASE64PREFIX="data:image/jpeg;base64,"

const sendRequestToTutor=async (req,res)=>{
    try{
        const {studId,templateId,chapters}=req.body;
        
        const tutorId = await TutorTemplateCourseModel.findOne({templateCourseId:templateId}).select(" tutorId -_id");
        const newRequest={
            studId,
            templateId,
            tutorId:tutorId.tutorId,
            chaptersRequested:chapters,
            requestId:uuidv4(),
            requestStatus:"pending"
        }
        await ClassRequestModel.create(newRequest);
        res.status(200).json({Message:"Request succesfully sent to tutor"});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err})
    }
};

const getStudentRequests=async (req,res) =>{
    try{
        const {studId,status}=req.params;
        
        let requests;

        if(status!="all") {
            requests=await ClassRequestModel.find({studId,requestStatus:status});
        }
        else {
            requests=await ClassRequestModel.find({studId});
        }

        const requestResults=await Promise.all(
            requests.map(async (req)=>{
                const tutorName=(await TutorModel.findOne({uid:req.tutorId})).name;
                const template=await TutorTemplateCourseModel.findOne({templateCourseId:req.templateId});
                const templateThumbnail=template.thumbnailForImage;
                const templateName=template.name;

                return {
                    ...req._doc,tutorName,templateThumbnail,templateName
                }
            })
        );

        const studentResults=requestResults.map(result=>({
            requestId:result.requestId,
            studId,
            tutorId:result.tutorId,
            templateId:result.templateId,
            chaptersRequested:result.chaptersRequested,
            requestStatus:result.requestStatus,
            tutorName:result.tutorName,
            templateThumbnail:BASE64PREFIX+result.templateThumbnail,
            templateName:result.templateName
        }))

        res.status(200).json(studentResults);

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const getTutorRequests=async (req,res) =>{
    try{
        const {tutorId,status}=req.params;
        
        let requests;

        if(status!="all") {
            requests=await ClassRequestModel.find({tutorId,requestStatus:status});
        }
        else {
            requests=await ClassRequestModel.find({tutorId});
        }

        const requestResults=await Promise.all(
            requests.map(async (req)=>{
                const student=await StudentModel.findOne({uid:req.studId});
                const template=await TutorTemplateCourseModel.findOne({templateCourseId:req.templateId});
                const templateThumbnail=template.thumbnailForImage;
                const templateName=template.name;

                return {
                    ...req._doc,studentName:student.name,templateThumbnail,templateName,studId:student.uid
                }
            })
        );

        const tutorResults=requestResults.map(result=>({
            requestId:result.requestId,
            studId:result.studId,
            tutorId:result.tutorId,
            templateId:result.templateId,
            chaptersRequested:result.chaptersRequested,
            requestStatus:result.requestStatus,
            studentName:result.studentName,
            templateThumbnail:BASE64PREFIX+result.templateThumbnail,
            templateName:result.templateName
        }))

        res.status(200).json(tutorResults);

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const cancelStudentRequest=async (req,res)=>{
    try {
        const {requestId}=req.body;
        
        const studentRequest=await ClassRequestModel.findOne({requestId:requestId});

        if(!studentRequest) {
            return res.status(400).json({Error:"The request does not exist"});
            
        }

        if(studentRequest.requestStatus!="pending") {
            return res.status(400).json({Error:"This request can't be cancelled anymore"});
        }

        await ClassRequestModel.updateOne({requestId:requestId},{
            $set:{
                requestStatus:"cancelled"
            }
        });

        //console.log(reponse);
        
        res.status(200).json({Message:"Successfully cancelled the request"});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};  

const rejectStudentRequest=async (req,res)=>{
    try{
        const {requestId}=req.body;
        
        const studentRequest=await ClassRequestModel.findOne({requestId:requestId});

        if(!studentRequest) {
            return res.status(400).json({Error:"The request does not exist"});
        }

        if(studentRequest.requestStatus!="pending") {
            return res.status(400).json({Error:"This request can't be rejected anymore"});
        }

        const reponse=await ClassRequestModel.updateOne({requestId:requestId},{
            $set:{
                requestStatus:"rejected"
            }
        });

        //console.log(reponse);
        
        res.status(200).json({Message:"Successfully rejected the request"});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});       
    }
};

const getMaxClassesAndPrice=async (req,res) => {
    try  {
        const {templateId}=req.params;
        
        const templateCourse=await TutorTemplateCourseModel.findOne({templateCourseId:templateId});

        if(!templateCourse) {
            console.log(templateId," This is the template Id");
            return res.status(400).json({Error:"The template you are trying to request is not found"});
        }

        res.status(200).json({maxClasses:templateCourse.maxClasses,maxPrice:templateCourse.maxPrice});

    } catch (err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

module.exports={
    sendRequestToTutor,
    getStudentRequests,
    cancelStudentRequest,
    getTutorRequests,
    rejectStudentRequest,
    getMaxClassesAndPrice
};