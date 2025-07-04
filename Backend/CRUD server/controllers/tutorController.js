const { name } = require('agenda/dist/agenda/name');
const Tutor = require('../models/tutorDetailModel');
const TutorTemplateCourseModel = require('../models/tutorTemplateCourseModel');
const TutorScheduleModel=require("../models/tutorScheduleModel");
const ClassRequestModel=require("../models/classRequestsModel");
const tutorResponseModel=require("../models/tutorReponseModel");
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand, GetO, GetObjectCommand } = require('@aws-sdk/client-s3');
const aws_config = require("../config/aws-config");
const { compressFile } = require('../utils/fileCompression');
const classRequestModel = require('../models/classRequestsModel');

const BASE64PREFIX="data:image/jpeg;base64,"

const getBestTutors = async (req, res) => {
    try {
        const allTutors = await Tutor.find();
        const bestTutors = [];
        for (let i = 0; i < Math.min(10, allTutors.length); i++) {
            bestTutors.push(
                {
                    tutorName: allTutors[i].name,
                    location: allTutors[i].address,
                    photo: allTutors[i].photo
                }
            )
        }
        res.status(200).json(bestTutors);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const createNewTemplateCourse = async (req, res) => {
    try {

        const { name, overview, description, subject, agenda, chapters, tutorId,maxPrice } = req.body;
        const files = req.files;

        // always the first file from the files array is the course Image
        // and the rest is resources for the course... this is the convention...
        // do not change this

        const courseImage = files[0];

        const client = new S3Client({
            region: aws_config.region,
            credentials: aws_config.S3credentials
        });

        const s3ObjectKeys = await Promise.all(
            files.map(async (file) => {

                const objectKey = `template-courses/${tutorId}/${uuidv4()}_${file.originalname}`;

                const command = new PutObjectCommand({
                    Bucket: aws_config.s3BucketName,
                    Key: objectKey,
                    Body: file.buffer,
                    ContentType: file.mimetype
                });

                await client.send(command);
                return objectKey;
            })
        );

        const compressionOptions = {
            finalSize: 50
        };

        const ThumbnailBuffer = await compressFile(courseImage.buffer, courseImage.mimetype, compressionOptions);
        console.log("new size: ", ThumbnailBuffer.length / 1024);
        console.log("Old Size: ", courseImage.buffer.length / 1024);

        const base64Thumbnail = ThumbnailBuffer.toString('base64');

        const newTemplateCourseDetails = {
            templateCourseId: uuidv4(),
            tutorId: tutorId,
            name: name,
            subject: subject,
            imageKey: s3ObjectKeys[0],
            description: description,
            overview: overview,
            agenda: agenda,
            chapters: chapters,
            thumbnailForImage: base64Thumbnail,
            resourceKeys: s3ObjectKeys.filter((_, ind) => ind != 0),
            maxPrice:maxPrice
        };

        const newTemplateCourse = await TutorTemplateCourseModel.create(newTemplateCourseDetails);

        res.status(200).json({ newCourse: newTemplateCourse });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getAllTemplateCourses = async (req, res) => {
    try {
        const { limit, offset } = req.query;

        const templateCoursesDetails = await TutorTemplateCourseModel.find().skip(offset * 10).limit(limit).select('templateCourseId name subject thumbnailForImage maxPrice maxClasses -_id');

        const templateCourses = await Promise.all(
            templateCoursesDetails.map(template => (
                {
                    courseId: template.templateCourseId,
                    courseName: template.name,
                    subject: template.subject,
                    image: "data:image/jpeg;base64," + template.thumbnailForImage,
                    maxPrice:template.maxPrice,
                    maxClasses:template.maxClasses
                }
            ))
        );

        res.status(200).json(templateCourses);


    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTemplateCourses = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;

        const templateCourses = await TutorTemplateCourseModel.find({ tutorId: tutorId })
            .select('templateCourseId name subject thumbnailForImage -_id');

        res.status(200).json(templateCourses);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTemplateDetails = async (req, res) => {
    try {
        const templateId = req.params.templateId;

        const templateDetails = await TutorTemplateCourseModel.findOne({ templateCourseId: templateId });

        const tutorDetails = await Tutor.findOne({ uid: templateDetails.tutorId });

        const tutor = {
            name: tutorDetails.name,
            yearsOfExperience: tutorDetails.yearsofExperience,
            image: tutorDetails?.photo
        }

        const course = {
            name: templateDetails.name,
            subject: templateDetails.subject,
            description: templateDetails.description,
            overview: templateDetails?.overview,
            agenda: templateDetails?.agenda,
            chapters: templateDetails.chapters,
            resources: templateDetails.resourceKeys.map(name => (name.split('_')[1])),
            maxPrice:templateDetails.maxPrice,
            maxClasses:templateDetails.maxClasses
        };

        res.status(200).json({ tutor, course });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTemplateImage = async (req, res) => {
    try {
        const templateId = req.params.templateId;

        const templateImageKey = await TutorTemplateCourseModel.findOne({ templateCourseId: templateId }).select('imageKey -_id');

        const client = new S3Client({
            region: aws_config.region,
            credentials: aws_config.S3credentials
        });

        const command = new GetObjectCommand({
            Bucket: aws_config.s3BucketName,
            Key: templateImageKey.imageKey
        });

        const response = await client.send(command);

        const stream = response.Body;

        res.setHeader("Content-Type", response.ContentType || "image/jpeg");
        res.setHeader("Content-Length", response.ContentLength);

        stream.pipe(res);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTutorSchedule=async (req,res)=>{
    try {

        const tutorId=req.params.tutorId;
        const {startDate,endDate}=req.query;

        const schedule=await TutorScheduleModel.findOne({tutorId:tutorId});
        
        const scheduleWithMatchedDates=schedule?.schedule.filter(sch => {
            const date=new Date(sch.date);
            return (new Date(startDate))<=date&&date<=(new Date(endDate));
        })

        res.status(200).json({Message:"db logic is fine",scheduleWithMatchedDates});
    } catch (err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const getSlots=async (req,res)=>{
    try {
        const tutorId=req.params.tutorId;

        const tutor=await Tutor.findOne({uid:tutorId});

        const slots=tutor.tutorSlots.map(sl=>({
            day:sl.day,
            numOfSlots:sl.numOfSlots,
            slots:sl.slots
        }));

        res.status(200).json({tutorSlots:slots});

    } catch (err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
}

const uploadResponse=async (req,res) =>{
    try {

        const {requestId,templateId}=req.query;
        const {price,classes,schedule,startDate,endDate}=req.body;

        const request=await ClassRequestModel.findOne({requestId});

        if(!request) {
            res.status(400).json({Error:"The request for this class doesnot exist"});
            return ;
        }

        if(request.requestStatus=="cancelled") {
            res.status(400).json({Error:"The student has cancelled the request for this class"});
            return ;
        }

        const valid_till=new Date(startDate);
        valid_till.setDate(valid_till.getDate()-1);
        const response={
            responseId:uuidv4(),
            requestId,
            templateId,
            studId:request.studId,
            tutorId:request.tutorId,
            price,
            classes,
            schedule,
            startDate:new Date(startDate),
            endDate:new Date(endDate),
            valid_till
        }

        try {
            await classRequestModel.updateOne({requestId},{
                $set:{
                    requestStatus:"accepted",
                    responseId:response.responseId
                }
            });

            await tutorResponseModel.create(response);

        } catch (err) {
            console.log(err);
            res.status(500).json({Error:"Error updating database ... try again later"});
            return;
        }
        // console.log(schedule);

        res.status(200).json({Message:"AllGood",response});

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
}

const getResponsesForStudent=async (req,res) =>{
    try{
        const {studId}=req.params;

        const responses=await tutorResponseModel.find({studId})

        const responseResults=await Promise.all(
            responses.map(async (res)=>{
                const tutorName=(await Tutor.findOne({uid:res.tutorId})).name;
                const template=await TutorTemplateCourseModel.findOne({templateCourseId:res.templateId});
                const templateThumbnail=template.thumbnailForImage;
                const templateName=template.name;
                const chaptersRequested=(await ClassRequestModel.findOne({requestId:res.requestId})).chaptersRequested;
                return {
                    ...res._doc,tutorName,templateThumbnail,templateName,chaptersRequested
                }
            })
        );

        const studentResults=responseResults.map(result=>({
            responseId:result.responseId,
            requestId:result.requestId,
            studId,
            tutorId:result.tutorId,
            templateId:result.templateId,
            chaptersRequested:result.chaptersRequested,
            tutorName:result.tutorName,
            templateThumbnail:BASE64PREFIX+result.templateThumbnail,
            templateName:result.templateName,
            classes:result.classes,
            price:result.price
        }))

        // console.log(studentResults);

        res.status(200).json(studentResults);

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

module.exports = {
    getBestTutors,
    createNewTemplateCourse,
    getTemplateCourses,
    getAllTemplateCourses,
    getTemplateDetails,
    getTemplateImage,
    getTutorSchedule,
    getSlots,
    uploadResponse,
    getResponsesForStudent
};

