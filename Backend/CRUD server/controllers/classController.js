const Class = require('../models/classDetailModel');
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const templateModel = require("../models/tutorTemplateCourseModel");
const ClassScheduleModel = require("../models/classScheduleModel");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const aws_config = require("../config/aws-config");
const NotesModel = require("../models/noteBookModel");
const { renderNotesAsPdf } = require("../utils/renderNotesAsPdf");

const BASE64PREFIX = "data:image/jpeg;base64,"

const getClassDetailsForStudent = async (req, res) => {
    try {
        const studId = req.params.studId;
        const classes = await Class.find({ studId: studId });
        const classDetails = classes.map((val, _) => ({
            courseName: val.className,
            totalClasses: val.classCount,
            completed: val.completedClasses
        }));
        res.status(200).json({ classDetails: classDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getClassDetailsForTutors = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;
        const classes = await Class.find({ tutorId: tutorId });
        const classDetails = classes.map((val, _) => ({
            courseName: val.className,
            totalClasses: val.classCount,
            completed: val.completedClasses
        }));
        res.status(200).json({ classDetails: classDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};


const getAllCourseInformation = async (req, res) => {
    try {
        const studId = req.params.studId;
        const courseInfo = await Class.find({ studId: studId });
        const dateOptions = { day: "numeric", month: "long", year: "numeric" };
        function dateDiffInDays(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        }
        const courseListDetails = await Promise.all(courseInfo.map(async (course, _) => {
            const tutorName = (await tutor.findOne({ uid: course.tutorId })).name;
            const templateId = course.templateId;
            const image = (await templateModel.findOne({ templateCourseId: templateId })).thumbnailForImage;
            return {
                subject: course.subject,
                coursename: course.className,
                tutorName,
                startDate: new Date(course.startDate).toLocaleDateString("en-GB", dateOptions),
                status: (dateDiffInDays(new Date(), new Date(course.endDate)) > 0) ? "current" : "completed",
                image: BASE64PREFIX + image,
                classId: course.classId,
                templateId
            }
        }));
        res.status(200).json({ allCourses: courseListDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getAllCourseInformationForTutor = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;
        const courseInfo = await Class.find({ tutorId: tutorId });
        const dateOptions = { day: "numeric", month: "long", year: "numeric" };
        function dateDiffInDays(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        }
        const courseListDetails = await Promise.all(courseInfo.map(async (course, _) => {
            const studentName = (await student.findOne({ uid: course.studId })).name;
            const templateId = course.templateId;
            const image = (await templateModel.findOne({ templateCourseId: templateId })).thumbnailForImage;
            return {
                subject: course.subject,
                coursename: course.className,
                studentName,
                startDate: new Date(course.startDate).toLocaleDateString("en-GB", dateOptions),
                status: (dateDiffInDays(new Date(), new Date(course.endDate)) > 0) ? "current" : "completed",
                image: BASE64PREFIX + image,
                classId: course.classId,
                templateId
            }
        }));
        // console.log(courseListDetails);
        res.status(200).json({ allCourses: courseListDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getClassDetailsForAboutPage_Student = async (req, res) => {
    try {

        const { classId } = req.params;
        const classDetail = await Class.findOne({ classId });

        const InfoToSend = {
            startDate: classDetail.startDate,
            endDate: classDetail.endDate,
            classCount: classDetail.classCount,
            chaptersRequested: classDetail.chaptersRequested
        };

        const classschedule = await ClassScheduleModel.findOne({ classId });
        const schedule = classschedule.schedule.map((sch) => {
            return {
                date: sch.date,
                slots: sch.slots.map(slot => ({ startTime: slot.startTime, endTime: slot.endTime }))
            }
        });

        res.status(200).json({ ...InfoToSend, schedule });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getClassResources = async (req, res) => {
    try {
        const { classId } = req.params;

        const templateId = (await Class.findOne({ classId })).templateId;

        const resourceKeys = (await templateModel.findOne({ templateCourseId: templateId })).resourceKeys;

        const resources = resourceKeys.map(key => {
            const splitarray = key.split('_');
            return {
                key,
                name: splitarray[splitarray.length - 1]
            }
        });

        res.status(200).json(resources);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getResourceContent = async (req, res) => {
    try {

        const { resourceKey: encodedResourceKey, contentType } = req.query;

        // console.log(req.query);

        const client = new S3Client({
            region: aws_config.region,
            credentials: aws_config.S3credentials
        });


        const command = new GetObjectCommand({
            Bucket: aws_config.s3BucketName,
            Key: decodeURIComponent(encodedResourceKey)
        });

        const response = await client.send(command);
        const stream = response.Body;

        // console.log(response.ContentType);

        res.setHeader('Content-Type', response.ContentType || contentType);
        res.setHeader('Content-Length', response.ContentLength);
        // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

        stream.pipe(res);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getNotesContent = async (req, res) => {
    try {
        const { classId } = req.params;

        const noteBook = await NotesModel.findOne({ classId });

        const pdfStream=renderNotesAsPdf(noteBook.pages);

        res.setHeader('Content-Type','application/pdf');
        pdfStream.pipe(res);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

module.exports = {
    getClassDetailsForStudent,
    getAllCourseInformation,
    getClassDetailsForTutors,
    getAllCourseInformationForTutor,
    getClassDetailsForAboutPage_Student,
    getClassResources,
    getResourceContent,
    getNotesContent
}