const { sendEmailForNewTest, sendEmailForTestResult } = require('./Email')
const {agenda}=require('../config/config')

const jobs = []


const ReminderForNewTest = async (jobName, studId, tutorId, startDate, startTime) => {
    const tut = "cheguevera"
    const stud = "Yogesh"
    try {
        let message = "Successfully defined Job"
        agenda.define(jobName, async (job) => {
            const status = await sendEmailForNewTest(stud, tut, startDate, startTime)
            if (status == 200) {
                console.log("Succesfully defined job")
            }
            else message = "Error in sendEmail function"
        })
        await agenda.now(jobName)
        return message

    }
    catch (err) {
        console.log(err)
        return "Error defining job"
    }

}

const RemainderForResultUpload = async (jobName, stu, tut, score, maxScore, testDate) => {
    tut = "cheguevera"
    stu = "Yogesh"
    try {
        let Message = "Successfully defined the job"
        agenda.define(jobName, async () => {
            const status = await sendEmailForTestResult(stu, tut, score, maxScore, testDate);
            if (status == 200) {
                console.log(Message)
            }
            else Message = "Error in sendEmail function"
        })
        await agenda.now(jobName)
        return Message
    } catch (err) {
        console.log(err)
        return "Error defining job"
    }
}

module.exports = {jobs, ReminderForNewTest, RemainderForResultUpload }