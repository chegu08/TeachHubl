const TestModel= require('../models/testDetailsModel');
const axios =require("axios");
const Agenda=require("agenda");
const {v4:uuidv4} =require("uuid");


const createTest = async (req, res) => {
    const testDetails = req.body
    try {
        if (!(testDetails.classId && testDetails.testType && testDetails.startDate && testDetails.startTime && testDetails.duration && testDetails.maxScore)) {
            console.log("Not all mondatory fields are present to create test")
            return res.status(400).json({ Error: "Not all mondatory fields are present to create test" })
        }
        const newtestDetails = {
            testId: uuidv4(),
            classId: testDetails.classId,
            testType: testDetails.testType,
            startDate: testDetails.startDate,
            startTime: testDetails.startTime,
            duration: testDetails.duration,
            completed: false,
            maxScore: testDetails.maxScore
        }
        if (testDetails.testType.toLowerCase() === 'custom') {
            if (!testDetails.questionForCustomTest) {
                console.log("Questions for this test is not available")
                return res.status(400).json({ Error: "Questions for this test is not available" })
            }
            newtestDetails.questionForCustomTest = testDetails.questionForCustomTest;
        }
        else if (testDetails.testType.toLowerCase() === 'standard') {
            if (!testDetails.questionForStandardTest) {
                console.log("Questions for this test is not available")
                return res.status(400).json({ Error: "Questions for this test is not available" })
            }
            newtestDetails.questionForStandardTest = testDetails.questionForStandardTest;
        }
        else {
            console.log(`testType expects "Standard" or "custom" value but has value ${testDetails.testType}`)
            return res.status(400).json({ Error: `testType expects "Standard" or "custom" value but has value ${testDetails.testType}` })
        }

        await TestModel.create(newtestDetails)
        console.log("New Test has been created successfully")
        return res.status(200).json({ Message: "New Test has been created successfully", testId: newtestDetails.testId })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
}


const uploadresult = async (req, res) => {
    const { testId, scores } = req.body
    console.log("came here by axios request")
    console.log(scores)
    try {

        if (!testId || !scores) {
            console.log("Some mandatory fields are missing")
            return res.status(400).json({ Error: "Some mandatory fields are missing" })
        }

        const test = await TestModel.findOne({ testId: testId })

        if (!test) {
            console.log("Invalid testId ...no test found for this test")
            return res.status(404).json({ Error: "Invalid testId ...no test found for this test" })
        }

        if (test.testType.toLowerCase() === 'custom') {
            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    result: {
                        totalScore: scores[0]
                    }
                }
            })
            console.log("Result has been uploaded")
            return res.status(200).json({ Message: "Result has been uploaded", result: modifiedTest.result })
        }
        else {
            let mark = 0;
            scores.forEach((score) => mark += score)
            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    result:
                    {
                        scores: scores,
                        totalScore: mark
                    }
                }
            })
            console.log("Result has been uploaded")
            return res.status(200).json({ Message: "Result has been uploaded", testId })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
}

const uploadfeedback = async (req, res) => {

}


const uploadresponse = async (req, res) => {
    const { testId, response } = req.body
    try {
        if (!testId || !response) {
            console.log("Some mandatory fields are missing")
            return res.status(400).json({ Error: "Some mandatory fields are missing" })
        }

        const test = await TestModel.findOne({ testId: testId })

        if (!test) {
            console.log("Invalid testId ...no test found for this test")
            return res.status(404).json({ Error: "Invalid testId ...no test found for this test" })
        }

        if (test.testType.toLowerCase() === 'custom') {
            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    completed: true,
                    response: response
                }
            })
            console.log("Response has been uploaded")
            return res.status(200).json({ Message: "Reponse has been uploaded", response: modifiedTest.response })
        }
        else {

            if (test.questionForStandardTest.length !== response.length) {
                console.log(test.questionForStandardTest.length, " ", response.length)
                console.log("The length of the responses does not match the length of the questions")
                return res.status(400).json({ Error: 'The length of the responses does not match the length of the questions' })
            }

            //this is the evaluation process for the test
            const scores = []


            for (const i in response) {
                // console.log(test.questionForStandardTest[i]['answer'])
                // console.log(response[i])

                if (JSON.stringify(test.questionForStandardTest[i]['answer']) == JSON.stringify(response[i]))
                    console.log("true")


                let mark = (JSON.stringify(test.questionForStandardTest[i]['answer']) == JSON.stringify(response[i])) ? test.questionForStandardTest[i].marks : 0;
                scores.push(mark)
            }



            try {
                const response = await axios.put('/test/result', {
                    testId,
                    scores
                }, { baseURL: "http://localhost:3000" })
                if (response) {
                    console.log(response.data)
                    console.log("Result for the standard test has been calculated and uploaded")
                }
            }
            catch (err) {
                console.log("Error uploading the result for Standard test", err)
                return res.status(500).json({ Error: err })
            }

            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    completed: true,
                    response: response
                }
            })

            //console.log(modifiedTest)
            console.log("Response has been uploaded")
            return res.status(200).json({ Message: "Response has been uploaded", response: modifiedTest.response })

        }

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
}

const deleteTest = async (req, res) => {
    const { testId } = req.body
    try {
        const test = await TestModel.findOne({ testId: testId })
        if (!test) {
            console.log("The provided test cannot be found ...")
            return res.status(404).json({ Error: "The provided test cannot be found ...", testId })
        }
        // const testYear=test.startDate.getFullYear()
        // const testMonth=test.startDate.getMonth()
        const testDate = new Date(test.startDate)
        const curDate = new Date()

        if (curDate >= testDate) {
            console.log("The test cannot be cancelled,it has already started")
            return res.status(400).json({ Error: "The test cannot be cancelled,it has already started", testId })
        }

        await TestModel.deleteOne({ testId: testId })
        const response = await sendEmailForCancelledTest("ojdrno", "jrenor", testDate)


        //The name for the job should be updated dynamically
        //For the name of the job ...refer changeStream on changeType 'insert'
        await agenda.cancel({ name: "New Test for undefined by undefined:" })

        return (response == 200) ?
            res.status(200).json({ Message: "Test has been deleted successfully" }) :
            res.status(500).json({ Error: "Error while sending notification" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })
    }
}

module.exports = {
    createTest,
    uploadresult,
    uploadfeedback,
    uploadresponse,
    deleteTest
}