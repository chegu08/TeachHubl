const Class = require('../models/classDetailModel');
const student = require('../models/studentDetailModel');
const tutor = require('../models/tutorDetailModel');
const templateModel = require("../models/tutorTemplateCourseModel");
const ClassScheduleModel = require("../models/classScheduleModel");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const aws_config = require("../config/aws-config");
const NotesModel = require("../models/noteBookModel");
const { renderNotesAsPdf } = require("../utils/renderNotesAsPdf");
const fs = require("fs");
const path = require("path");

const BASE64PREFIX = "data:image/jpeg;base64,"

const getClassDetailsForStudent = async (req, res) => {
    try {
        const studId = req.params.studId;
        const classes = await Class.find({ studId: studId }).lean();

        // the completed classes is purely indicated by number of classes that has passed
        // there is no mechanism until now to update the completedClasses once the window has passed
        // only update this collection in db is either student or tutor wants to see this
        // there might be stale records in DB unless the user wants to use

        // to update this when the user needs 
        // compare the slots in classSchedule Model with current time

        const curTime = Date.now();
        const classDetails = await Promise.all(
            classes.map(async ({ classId, classCount, className }) => {
                let completedClasses = 0;
                const schedule = (await ClassScheduleModel.findOne({ classId }))?.schedule;
                schedule?.forEach(sch => {
                    const schDay = new Date(sch.date);
                    schDay.setHours(0, 0, 0, 0);
                    sch.slots.forEach(slot => {
                        const [endH, endM] = slot.endTime.split(':').map(Number);

                        const slotTime = new Date(schDay);
                        slotTime.setHours(endH, endM, 0, 0);
                        if (curTime > slotTime.getTime()) {
                            completedClasses++;
                        }
                    })
                })
                return {
                    classId,
                    courseName: className,
                    totalClasses: classCount,
                    completed: completedClasses
                }
            })
        )

        // now that we have processed the completed classes 
        // we can send it to the user first and then 
        // update it on DB as DB updation network calls 
        // take longer time
        res.status(200).json({ classDetails: classDetails });

        Promise.all(
            classDetails.map(
                ({ classId, completed }) =>
                (
                    Class.updateOne({ classId }, {
                                $set: { completedClasses: completed }
                            })
                )
            )
        ).catch(err=>{
            console.log(err);
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getClassDetailsForTutors = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;
        const classes = await Class.find({ tutorId: tutorId }).lean();

        // the completed classes is purely indicated by number of classes that has passed
        // there is no mechanism until now to update the completedClasses once the window has passed
        // only update this collection in db is either student or tutor wants to see this
        // there might be stale records in DB unless the user wants to use

        // to update this when the user needs 
        // compare the slots in classSchedule Model with current time

        const curTime = Date.now();
        const classDetails = await Promise.all(
            classes.map(async ({ classId, classCount, className }) => {
                let completedClasses = 0;
                const schedule = (await ClassScheduleModel.findOne({ classId }))?.schedule;
                schedule?.forEach(sch => {
                    const schDay = new Date(sch.date);
                    schDay.setHours(0, 0, 0, 0);
                    sch.slots.forEach(slot => {
                        const [endH, endM] = slot.endTime.split(':').map(Number);

                        const slotTime = new Date(schDay);
                        slotTime.setHours(endH, endM, 0, 0);
                        if (curTime > slotTime.getTime()) {
                            completedClasses++;
                        }
                    })
                })
                return {
                    classId,
                    courseName: className,
                    totalClasses: classCount,
                    completed: completedClasses
                }
            })
        )

        // now that we have processed the completed classes 
        // we can send it to the user first and then 
        // update it on DB as DB updation network calls 
        // take longer time
        res.status(200).json({ classDetails: classDetails });

        Promise.all(
            classDetails.map(
                ({ classId, completed }) =>
                (
                    Class.updateOne({ classId }, {
                                $set: { completedClasses: completed }
                            })
                )
            )
        ).catch(err=>{
            console.log(err);
        })

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

        res.setHeader('Content-Type', 'application/pdf');
        if (!noteBook) {
            const filePath = path.join(__dirname, "..", "public", "teachhubl_note_message.pdf");
            const stream = fs.createReadStream(filePath);
            return stream.pipe(res);
        }

        const pdfStream = renderNotesAsPdf(noteBook.pages);

        pdfStream.pipe(res);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getConnectedChatUsers = async (req, res) => {
    try {
        const userId = req.params.userId;

        const allusers = await Class.find({
            $or: [
                { tutorId: userId },
                { studId: userId }
            ]
        }, "studId tutorId -_id");

        const connectedUserIds = allusers.map(({ studId, tutorId }) => (studId == userId ? tutorId : studId));

        res.status(200).json([...new Set(connectedUserIds)]);

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
    getNotesContent,
    getConnectedChatUsers
}