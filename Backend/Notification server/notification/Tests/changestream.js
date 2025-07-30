const TestModel = require('../../models/TestModel');
const classDetailsModel=require("../../models/ClassDetailsModel");
// const authSessionModel=require("../../models/authSessionModel");
const pushSubscriptionModel=require("../../models/pushSubscriptionModel");
const webpush = require("web-push");
webpush.setVapidDetails(
    "mailto:cheguevera597@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);


const { ReminderForNewTest, RemainderForResultUpload } = require('./schedule')

const changeStream = TestModel.watch()

function listentoChangeStream() {
    //console.log("came in to the function")
    changeStream.on('change', async (change) => {
        switch (change.operationType) {
            case 'insert':
                {
                    // console.log(change.fullDocument)
                    console.log("change is triggered")
                    // const student = change.fullDocument.studId
                    // const tutor = change.fullDocument.tutorId
                    const classId=change.fullDocument.classId;
                    const date = change.fullDocument.startDate;
                    const time = change.fullDocument.startTime;
                    try{
                        const class_=await classDetailsModel.findOne({classId:classId});
                        const student=class_.studId;
                        const tutor=class_.tutorId;
                        // const response = await ReminderForNewTest(`New Test for ${student} by ${tutor}:`, student, tutor, date, time);
                        // console.log(response);
                        const subscribedStudents=await pushSubscriptionModel.find({userId:student});
                        console.log(student);
                        console.log(subscribedStudents);
                        await Promise.all(
                            subscribedStudents.map(stud => (
                                webpush.sendNotification(stud.subscription,JSON.stringify({
                                    title:"New Test created",
                                    message:`New Test for ${student} by ${tutor} on ${date} at ${time}`
                                }))
                            ))
                        )
                    } catch(err) {
                        console.log(err);
                    }
                    
                    break;
                }

            case 'update':
                {
                    console.log("change has been triggered")
                    //console.log(change.updateDescription.updatedFields)
                    //console.log(String(change.documentKey._id))
                    const test = await TestModel.findOne({ _id: String(change.documentKey._id) })
                    console.log(test)
                    const response = await RemainderForResultUpload(`Test result for :${test.testId}`, "chegue", "jdnto", test.result.totalScore, test.maxScore, test.startDate)
                    console.log(response)
                    break;
                }

            case 'delete':
                {
                    console.log("change has been triggered")
                    console.log(change)
                    break;
                }

            default:
                {
                    console.log("Other change has occurred")
                    break;
                }
        }
    })
    changeStream.on('error', (err) => console.log(err))
}

module.exports = { listentoChangeStream }