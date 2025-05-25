const Class=require('../models/classDetailModel');
const student=require('../models/studentDetailModel');
const tutor=require('../models/tutorDetailModel');
const {v4:uuid}=require('uuid');
const bcrypt =require('bcrypt');
const ClassSchedule = require('../models/classScheduleModel');

const createClass=async (req,res)=>{
    try{
        const {
            studId,
            tutorId,
            startDate,
            className,
            endDate,
            duration,
            paymentId,
            cancelled,
            cancelledDate,
            refundDetailId,
            classCount, 
            subject,
            schedule
        }=req.body;

        const studentIdFromdatabase=await student.findOne({uid:studId});
        if(!studentIdFromdatabase) { 
            return res.status(400).json({Error:"The provided student does not exist"});
        }

        const tutorIdFromDatabase=await tutor.findOne({uid:tutorId});
        if(!tutorIdFromDatabase) {
            return res.status(400).json({Error:"The provided tutor does not exist"});
        }
        
        if(classCount<=0) {
            return res.status(400).json({Error:"The count of classes cannot be less than or equal to zero"});
        }

        const newClass={
            classId:uuid(),
            studId,
            tutorId,
            startDate,
            className,
            endDate,
            duration,
            paymentId,
            cancelled,
            cancelledDate,
            refundDetailId,
            classCount,
            subject,
            completedClasses:0
        }

        const scheduleWithLinks=await Promise.all(schedule.map(async (sch)=>{
            const hashedStudentId=await bcrypt.hash(studentIdFromdatabase.uid,10);
            const hashedTutorId=await bcrypt.hash(tutorIdFromDatabase.uid,10);
            const slotsWithLinks=sch.slots.map(slot=>({
                ...slot,
                classLink:`http://localhost:5173/liveClass?student=${encodeURIComponent(hashedStudentId)}&tutor=${encodeURIComponent(hashedTutorId)}`
            }));
            return {...sch,slots:slotsWithLinks};
        }));

        console.dir(scheduleWithLinks,{depth:4});

        
        const class_schedule={
            scheduleId:uuid(),
            classId:newClass.classId,
            className,
            startDate,
            endDate,
            numberOfClasses:classCount,
            schedule:scheduleWithLinks
        };

        //console.dir(schedule,{depth:5});

        // this logic is incomplete yet...
        // also store the tutor schedule from the schedule available

        try{
            await Class.create(newClass);
            await ClassSchedule.create(class_schedule);
            
        } catch(err) {
            console.log(err);
            return res.status(500).json({Error:"Cannot insert class into database"});
        }

        res.status(200).json({Message:"Successfully created an class"})

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const getClassDetailsForStudent=async (req,res)=>{
    try{
        const studId=req.params.studId;
        const classes=await Class.find({studId:studId});
        const classDetails=classes.map((val,_)=>({
            courseName:val.className,
            totalClasses:val.classCount,
            completed:val.completedClasses
        }));
        res.status(200).json({classDetails:classDetails});
    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const getClassDetailsForTutors= async (req,res) =>{
    try {
        const tutorId=req.params.tutorId;
        const classes=await Class.find({tutorId:tutorId});
        const classDetails=classes.map((val,_)=>({
            courseName:val.className,
            totalClasses:val.classCount,
            completed:val.completedClasses
        }));
        res.status(200).json({classDetails:classDetails});
    } catch (err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};


const getAllCourseInformation=async (req,res)=>{
    try{
        const studId=req.params.studId;
        const courseInfo=await Class.find({studId:studId});
        const dateOptions={day:"numeric",month:"long",year:"numeric"};
        function dateDiffInDays(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        }
        const courseListDetails=await Promise.all(courseInfo.map(async (course,_)=>{
            const tutorName=(await tutor.findOne({uid:course.tutorId})).name;
            return {
                subject:course.subject,
                coursename:course.className,
                tutorName,
                startDate:new Date(course.startDate).toLocaleDateString("en-GB",dateOptions),
                status:(dateDiffInDays(new Date(), new Date(course.endDate))>0)?"current":"completed"
            }
        }));
        res.status(200).json({allCourses:courseListDetails});
    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

const getAllCourseInformationForTutor = async (req,res)=>{
    try {
        const tutorId=req.params.tutorId;
        const courseInfo=await Class.find({tutorId:tutorId});
        const dateOptions={day:"numeric",month:"long",year:"numeric"};
        function dateDiffInDays(date1, date2) {
            const diffTime = Math.abs(date2 - date1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        }
        const courseListDetails=await Promise.all(courseInfo.map(async (course,_)=>{
            const studentName=(await student.findOne({uid:course.studId})).name;
            return {
                subject:course.subject,
                coursename:course.className,
                studentName,
                startDate:new Date(course.startDate).toLocaleDateString("en-GB",dateOptions),
                status:(dateDiffInDays(new Date(), new Date(course.endDate))>0)?"current":"completed"
            }
        }));
        console.log(courseListDetails);
        res.status(200).json({allCourses:courseListDetails});
    } catch (err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

module.exports={
    createClass,
    getClassDetailsForStudent,
    getAllCourseInformation,
    getClassDetailsForTutors,
    getAllCourseInformationForTutor
}