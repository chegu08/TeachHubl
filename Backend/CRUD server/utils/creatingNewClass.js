const tutorScheduleModel=require("../models/tutorScheduleModel");
const ClassModel=require("../models/classDetailModel");
const ClassScheduleModel=require("../models/classScheduleModel");
const {v4:uuidv4} =require("uuid");
const bcrypt=require("bcrypt");

// this function updates the tutors schedule and return the class Id for creating class
async function UpdateTutorScheule(tutorId,schedule,className) {
    try{
        const tutor=await tutorScheduleModel.findOne({tutorId}).lean();
        const tutorschedule=(tutor)?tutor.schedule:[];
        const classId=uuidv4();
        const oldScheduleAppendedWithNewSchedule=[
            ...tutorschedule,
            ...schedule.map(sch=>{
                const date=new Date(sch.date);
                date.setHours(0,0,0,0);
                return {
                    date,
                    eventDetail:sch.slots.map(slot=>({startTime:slot.startTime,endTime:slot.endTime,classId,className}))
                }
            })
        ];
        const slotsMergedByDate={};
        oldScheduleAppendedWithNewSchedule.forEach(sch=>{
            const date=new Date(sch.date);
            date.setHours(0,0,0,0);
            const dateKey=date.toISOString().split('T')[0];
            if(!slotsMergedByDate[dateKey]) {
                slotsMergedByDate[dateKey]=[];
            }
            slotsMergedByDate[dateKey]=[...slotsMergedByDate[dateKey],...sch.eventDetail]
        });
        const slotsArray=[];
        Object.keys(slotsMergedByDate).forEach(key=>{
            slotsArray.push({date:key,eventDetail:slotsMergedByDate[key]});
        });
        const slotsSortedByDates=slotsArray.sort((a,b)=>{
            const d1=new Date(a.date);
            const d2=new Date(b.date);
            return d1-d2;
        });

        slotsSortedByDates.forEach(slot=>{
            slot.eventDetail.sort((a,b)=>{
                const s1=Number(a.startTime.split(':')[0])*1000+Number(a.endTime.split(':')[1]);
                const s2=Number(b.startTime.split(':')[0])*1000+Number(b.endTime.split(":")[1]);
                return s1-s2;
            });
        });

        const FinalScheduleObject=slotsSortedByDates.map(slot=>{
            return slot.toObject === 'function'? slot.toObject() : slot;
        });

        // this is an important case here...
        // if the tutor has no previous schedule (first time a class is created for the tutor)
        // then update would not work as there would be no record with tutorId
        // so we have to insert a document in that case

        if(!tutor) {
            await tutorScheduleModel.insertOne({tutorId,schedule:FinalScheduleObject});
        }
        else {
            await tutorScheduleModel.updateOne({tutorId},{
                $set:{
                    schedule:FinalScheduleObject
                }
            });
        }

        return classId;

    } catch(err) {
        throw new Error(err);
    }
}

async function CreateClass({studId,tutorId,startDate,className,endDate,paymentId,classCount,subject,schedule,templateId,classId,chaptersRequested}) {
    try {
        const newClass={
            classId,
            studId,
            tutorId,
            startDate,
            className,
            endDate,
            // duration,
            paymentId,
            cancelled:false,
            classCount,
            subject,
            completedClasses:0,
            templateId,
            schedule,
            chaptersRequested
        }

        const scheduleWithLinks=await Promise.all(schedule.map(async (sch)=>{
            const hashedStudentId=await bcrypt.hash(studId,10);
            const hashedTutorId=await bcrypt.hash(studId,10);
            const slotsWithLinks=sch.slots.map(slot=>({
                ...slot,
                classLink:`http://localhost:5173/liveClass?student=${encodeURIComponent(hashedStudentId)}&tutor=${encodeURIComponent(hashedTutorId)}`
            }));
            return {...sch,slots:slotsWithLinks};
        }));

        const class_schedule={
            scheduleId:uuidv4(),
            classId:newClass.classId,
            className,
            startDate,
            endDate,
            numberOfClasses:classCount,
            schedule:scheduleWithLinks
        };


        try{
            await ClassModel.create(newClass);
            await ClassScheduleModel.create(class_schedule);
            
        } catch(err) {
            console.log(err);
            throw new Error("Cannot insert class into database");
        } 
        
        
    } catch(err) {
        throw new Error(err);
    }
}

module.exports={
    UpdateTutorScheule,
    CreateClass
}

