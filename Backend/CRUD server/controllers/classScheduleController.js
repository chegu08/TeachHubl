const student=require('../models/studentDetailModel');
const tutor=require('../models/tutorDetailModel');
const classSchedule=require('../models/classScheduleModel');
const Class=require('../models/classDetailModel')


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

        console.log("Today's slots : ",todaysSlots);

        return res.status(200).json({ todaysSlots });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || err });
    }
};

module.exports={
    getTodayScheduleForStudent,
    getTodayScheduleForTutor
}