const studentModel=require('../models/studentDetailModel');
const tutorModel=require('../models/tutorDetailModel');
const classSchedule=require('../models/classScheduleModel');
const Class=require('../models/classDetailModel');



const getTodayScheduleForStudent = async (req, res) => {
    try {
        const studId = req.params.studId;

        // Fetch class IDs for the student
        const allClasses = (await Class.find({ studId })).map(_class => _class.classId);

        const todaysDate = new Date();
        const today = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());

        // Fetch schedules for all classes
        const todaysclasses = await Promise.all(
            allClasses.map(async classid => {
                const scheduleArray = await classSchedule.find({ classId: classid });

                if (!scheduleArray || scheduleArray.length === 0) return null;

                return scheduleArray.flatMap(schedule => {
                    const startDate = new Date(schedule.startDate);
                    const endDate = new Date(schedule.endDate);

                    // Normalize start and end date to YYYY-MM-DD
                    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                    if (today < start || today > end) return [];

                    // Find today's schedule in the schedule array
                    return schedule.schedule.flatMap(sch => {
                        const fullDate = new Date(sch.date);
                        const onlyDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());

                        if (onlyDate.getTime() !== today.getTime()) return [];

                        return sch.slots.map(slot => ({
                            classId: schedule.classId,
                            className: schedule.className,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            Link:slot.classLink
                        }));
                    });
                });
            })
        );

        // Remove null values and flatten the array
        const todaysSlots = todaysclasses.flat().filter(Boolean);

        return res.status(200).json({ todaysSlots });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
};

const getTodayScheduleForTutor=async (req,res) =>{
    try {
        const tutorId = req.params.tutorId;

        // Fetch class IDs for the tutor
        const allClasses = (await Class.find({ tutorId })).map(_class => _class.classId);

        const todaysDate = new Date();
        const today = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());

        // Fetch schedules for all classes
        const todaysclasses = await Promise.all(
            allClasses.map(async classid => {
                const scheduleArray = await classSchedule.find({ classId: classid });

                if (!scheduleArray || scheduleArray.length === 0) return null;

                return scheduleArray.flatMap(schedule => {
                    const startDate = new Date(schedule.startDate);
                    const endDate = new Date(schedule.endDate);

                    // Normalize start and end date to YYYY-MM-DD
                    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                    if (today < start || today > end) return [];

                    // Find today's schedule in the schedule array
                    return schedule.schedule.flatMap(sch => {
                        const fullDate = new Date(sch.date);
                        const onlyDate = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate());

                        if (onlyDate.getTime() !== today.getTime()) return [];

                        return sch.slots.map(slot => ({
                            classId: schedule.classId,
                            className: schedule.className,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            Link:slot.classLink
                        }));
                    });
                });
            })
        );

        // Remove null values and flatten the array
        const todaysSlots = todaysclasses.flat().filter(Boolean);

        // console.log("Today's slots : ",todaysSlots);

        return res.status(200).json({ todaysSlots });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
};

const markAttendanceAndGetClassId=async (req,res) =>{
    try {
        const {role,studId,tutorId}=req.body;

        const class_=await Class.findOne({studId,tutorId});
        const classId=class_.classId;
        res.status(200).json(classId);

        // send the class Id first for smoother UX and then update the attendance

        const schedule=(await classSchedule.findOne({classId})).schedule;
        const today=new Date();
        today.setHours(0,0,0,0);

        const modifiedSchedule=schedule.map(sch=>{
            const curDate=new Date(sch.date);
            curDate.setHours(0,0,0,0);

            if(curDate.getTime()!=today.getTime()) return sch;
            const modifiedSlots=sch.slots.map(slot=>{
                const start=new Date(today);
                start.setHours(Number(slot.startTime.split(':')[0]),Number(slot.startTime.split(':')[1]),0,0);
                const end=new Date(today);
                end.setHours(Number(slot.endTime.split(':')[0]),Number(slot.endTime.split(':')[1]),0,0);

                const now=Date.now();

                if(start.getTime()<=now&&now<=end.getTime()) {
                    return {...slot,studAttended:(role=='student')?true:slot.studAttended,tutorAttended:(role=="tutor")?true:slot.tutorAttended}
                }
                return slot;
            });

            return {...sch,slots:modifiedSlots};
        });

        await classSchedule.updateOne({classId},{
            $set:{
                schedule:modifiedSchedule
            }
        });

    } catch(err) {
        console.error("Attendance marking error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Server error", details: err });
        }
    }
};

const getAttendanceReport=async (req,res) =>{
    try {
        const {student,userId,week}=req.query;
        
        const searchOption=(student=="true")?{studId:userId}:{tutorId:userId};
        const classIdsOfUser=await Class.find(searchOption).select("classId -_id");
        const today=new Date();
        today.setHours(0,0,0,0);
        const day=new Date(today).getDay();
        const report=new Array(7).fill(null).map((_,ind)=>{
            const diffInDay=ind-day-((week=="This week")?0:7);
            const curDay=new Date(today);
            curDay.setDate(curDay.getDate()+diffInDay);
            return {
                totalClasses:0,
                attendedClasses:0,
                percentage:0,
                curDay:curDay.toLocaleString()
            }
        });
        const startDayForProgressChart=new Date(report[0].curDay);
        startDayForProgressChart.setHours(0,0,0,0);

        classIdsOfUser.forEach(async ({classId})=>{
            const schedule=(await classSchedule.findOne({classId}))?.schedule;
            schedule?.forEach(sch =>{
                const curDay=new Date(sch.date);
                curDay.setHours(0,0,0,0);
                const diffInDays=(curDay.getTime()-startDayForProgressChart.getTime())/1000*60*60*24;
                if(diffInDays>=0&&diffInDays<=6) {
                    sch.slots.forEach(slot=>{
                        report[diffInDays].totalClasses=report[diffInDays].totalClasses+1;
                        report[diffInDays].attendedClasses=report[diffInDays].attendedClasses+(
                            (student=="true"&&slot.studAttended==true)||(student!="true"&&slot.tutorAttended==true)
                        );
                        report[diffInDays].percentage=(report[diffInDays].attendedClasses/report[diffInDays].totalClasses)/100
                    })
                }
            });

        })
        res.status(200).json(report);
    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

module.exports={
    getTodayScheduleForStudent,
    getTodayScheduleForTutor,
    markAttendanceAndGetClassId,
    getAttendanceReport
}