const TestModel =require('../models/TestModel')

const { ReminderForNewTest, RemainderForResultUpload } = require('./schedule')

const changeStream = TestModel.watch()

async function listentoChangeStream() {
    //console.log("came in to the function")
    changeStream.on('change', async (change) => {
        switch (change.operationType) {
            case 'insert':
                {
                    //console.log(change.fullDocument)
                    console.log("change is triggered")
                    const student = change.fullDocument.studId
                    const tutor = change.fullDocument.tutorId
                    const date = change.fullDocument.startDate
                    const time = change.fullDocument.startTime
                    const response = await ReminderForNewTest(`New Test for ${student} by ${tutor}:`, student, tutor, date, time)
                    console.log(response);
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