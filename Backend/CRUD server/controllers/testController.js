const TestModel = require('../models/testDetailsModel');
const ClassModel = require('../models/classDetailModel');
const axios = require("axios");
const Agenda = require("agenda");
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const aws_config = require("../config/aws-config");


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
            if (!req.file) {
                console.log("Questions for this test is not available")
                return res.status(400).json({ Error: "Questions for this test is not available" });
            }
            const client = new S3Client({
                region: aws_config.region,
                credentials: aws_config.S3credentials
            });

            const objectKey = `questionForCustomTest/${newtestDetails.testId}`

            const command = new PutObjectCommand({
                Bucket: aws_config.s3BucketName,
                Key: objectKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            })

            await client.send(command);
            newtestDetails.questionForCustomTest = objectKey;
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
            scores.forEach((score) => mark += score);
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
    try {
        const { testId, feedback } = req.body;

        const test = await TestModel.findOne({ testId: testId });

        // this has to be implemented after custom testing interface has been implemented
        if (test.testType.toLowerCase() == 'custom') {

        }
        else {
            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    feedback: feedback
                }
            })
            console.log("Modified Test: ", modifiedTest);
            res.status(200).json({ Message: "Feedback uploaded", modifiedTest: modifiedTest });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};


const uploadresponse = async (req, res) => {
    const { testId } = req.body
    try {

        const test = await TestModel.findOne({ testId: testId });

        if (!test) {
            console.log("Invalid testId ...no test found for this test")
            return res.status(404).json({ Error: "Invalid testId ...no test found for this test" })
        }

        if (test.testType.toLowerCase() === 'custom') {
            const response = req.files;

            const client = new S3Client({
                region: aws_config.region,
                credentials: aws_config.S3credentials
            });

            const keysOfAllresponses = await Promise.all(
                response.map(async (file, ind) => {
                    const objectKey = `answerForCustomTest/${testId}/${ind}`;
                    const command = new PutObjectCommand({
                        Bucket: aws_config.s3BucketName,
                        Key: objectKey,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    });
                    await client.send(command);
                    return objectKey;
                })
            );

            const modifiedTest = await TestModel.updateOne({ testId: testId }, {
                $set: {
                    completed: true,
                    response: keysOfAllresponses
                }
            });

            console.log("Response has been uploaded");
            return res.status(200).json({ Message: "Reponse has been uploaded", response: modifiedTest.response })
        }
        else {

            const response = req.body.response;

            if (test.questionForStandardTest.length !== response.length) {
                console.log(test.questionForStandardTest.length, " ", response.length)
                console.log("The length of the responses does not match the length of the questions")
                return res.status(400).json({ Error: 'The length of the responses does not match the length of the questions' })
            }

            //this is the evaluation process for the test
            const scores = []
            for (let i = 0; i < test.questionForStandardTest.length; i++) {
                const factor = test.questionForStandardTest[i].answer.length;
                if (test.questionForStandardTest[i].answerType == 'Numerical') {
                    Number(response[i][0]) == Number(test.questionForStandardTest[i].answer[0]) ? scores.push(test.questionForStandardTest[i].marks) : scores.push(0);
                    continue;
                };
                let curmark = 0;
                for (let j = 0; j < response[i].length; j++) {
                    if (response[i][j] == 0) continue;
                    if (test.questionForStandardTest[i].answer.includes(j)) {
                        curmark += (test.questionForStandardTest[i].marks / factor);
                    }
                    else {
                        curmark = 0;
                        break;
                    }
                }
                scores.push(curmark);
            }

            try {
                const response = await axios.put('/test/result', {
                    testId,
                    scores
                }, { baseURL: "http://localhost:4000" })
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

const getUpcomingtestdetails = async (req, res) => {
    try {
        const studentid = req.params.id;

        const classes = await ClassModel.find({ studId: studentid }).select('classId');
        const classids = classes.map(cls => cls.classId);

        // logic to get all upcoming tests for the student
        const today=new Date();
        today.setHours(0,0,0,0);

        const upcomingtests = await Promise.all(classids.map(classid => {

            return TestModel.find({
                classId: classid,
                completed:false,
                startDate: { $gte : today},
            }).lean()
        }));

        const detailofUpcomingTests = upcomingtests.flat().map((test) => ({
            testId: test.testId,
            startDate: new Date(test.startDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
            startTime: test.startTime,
        }));
        res.status(200).json({ detailofUpcomingTests });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err })
    }
};

const getUncorrectedTestDetails = async (req, res) => {
    try {
        const tutorid = req.params.tutorId;
        // implement the logic to get the class id of the tutor from database

        console.log(tutorid);


        const classes = await ClassModel.find({ tutorId: tutorid }).select('classId');
        const classids = classes.map(cls => cls.classId);

        console.log(classids);

        // logic to get all upcoming tests for the tutor

        const uncorrectedtests = (await Promise.all(classids.map(async classid => await TestModel.find({ classId: classid, completed: true, feedback: { $size: 0 } })))).flat();

        const detailofUncorrectedTests = uncorrectedtests.flat().map((test) => ({
            testId: test.testId,
            startDate: new Date(test.startDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
            startTime: test.startTime,
        }));

        console.log("details of upcoming test", detailofUncorrectedTests);
        res.status(200).json({ detailofUncorrectedTests });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err })
    }
};

const getTestDetails = async (req, res) => {
    try {
        const testId = req.params.id;
        const testDetails = (await TestModel.findOne({ testId: testId }))._doc;
        //console.log("test ID : ",testId);
        const modifiedTestDetials = {
            classId: testDetails.classId,
            testType: testDetails.testType,
            startDate: testDetails.startDate,
            startTime: testDetails.startTime,
            duration: testDetails.duration
        };
        if (testDetails.testType.toLowerCase() == 'standard') {
            modifiedTestDetials['questionForStandardTest'] = testDetails['questionForStandardTest'].map((que, _) => ({
                question: que.question,
                answerType: que.answerType,
                marks: que.marks,
                options: que.options
            }))
        }

        res.status(200).json({ testDetails });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getAllTests = async (req, res) => {
    try {
        const studId = req.params.id;
        // implement the logic to get the class id of the student from database

        const classids = await ClassModel.find({ studId: studId }).select('classId className');
        // console.log("all test informaiton: ",classids);

        // logic to get all tests for the students
        // const classid = 'testclassid' // for testing purposes
        const allTests = (await Promise.all(
            classids.map(async cls => {
                const tests = await TestModel.find({ classId: cls.classId });
                return tests.map(test => ({
                    testId: test.testId,
                    className: cls.className,
                    startDate: test.startDate,
                    status: test.completed ? "Completed" : "Not Completed"
                }))
            })
        )).flat();
        //console.log("allTests: ", allTests);
        res.status(200).json({ allTests });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getAllTutorTests = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;
        // implement the logic to get the class id of the student from database

        const classids = await ClassModel.find({ tutorId: tutorId }).select('classId className');
        // console.log("all test informaiton: ",classids);

        // logic to get all tests for the students
        // const classid = 'testclassid' // for testing purposes
        const allTests = (await Promise.all(
            classids.map(async cls => {
                const tests = await TestModel.find({ classId: cls.classId });
                return tests.map(test => ({
                    testId: test.testId,
                    className: cls.className,
                    startDate: test.startDate,
                    status: !test.completed ? "Live" : (test.feedback.length == 0) ? "Completed/Uncorrected" : "Corrected"
                }))
            })
        )).flat();
        //console.log("allTests: ", allTests);
        res.status(200).json({ allTests });
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTestStatistics = async (req, res) => {
    try {
        const testId = req.params.testId;
        let statistics = await TestModel.findOne({ testId: testId });
        statistics = statistics.toObject();
        //console.log(statistics);
        if (statistics.testType == 'Standard') {
            const status = []
            for (let i = 0; i < statistics.result.scores.length; i++) {
                if (statistics.result.scores[i] != 0) {
                    status.push("correct");
                }
                else {
                    let marked = false;
                    //console.log(`response[${i}]`,statistics.response[i]);
                    for (let j = 0; j < statistics.response[i].length; j++) {
                        if (
                            (statistics.questionForStandardTest[i].answerType != 'Numerical' && statistics.response[i][j] == 1) ||
                            (statistics.questionForStandardTest[i].answerType == 'Numerical' && statistics.response[i].length > 0)
                        ) {
                            console.log(statistics.questionForStandardTest[i].answer[0])
                            marked = true;
                            break;
                        }
                    }
                    status.push(marked ? "incorrect" : "unmarked");
                }
            }
            statistics['status'] = status;
        }
        console.log(statistics);
        res.status(200).json({ statistics });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getQuestionPaperForCustomTest = async (req, res) => {
    try {
        const testId = req.params.testId;

        const client = new S3Client({
            region: aws_config.region,
            credentials: aws_config.S3credentials
        });

        const test = await TestModel.findOne({ testId });

        const command = new GetObjectCommand({
            Bucket: aws_config.s3BucketName,
            Key: test.questionForCustomTest
        });

        const response = await client.send(command);

        res.setHeader('Content-Type', response.ContentType);
        res.setHeader('Content-Length', response.ContentLength);

        response.Body.pipe(res);
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

module.exports = {
    createTest,
    uploadresult,
    uploadfeedback,
    uploadresponse,
    deleteTest,
    getUpcomingtestdetails,
    getTestDetails,
    getAllTests,
    getTestStatistics,
    getUncorrectedTestDetails,
    getAllTutorTests,
    getQuestionPaperForCustomTest
}