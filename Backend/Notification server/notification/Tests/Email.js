const { SendEmailCommand } = require('@aws-sdk/client-ses')
const { sesclient } = require('../../config/config')



const sendEmailForNewTest = async (stu, tut, startDate, startTime) => {
    //console.log("aws is triggered")

    const emailOptions = {
        Source: "yogeshpandi857@gmail.com",
        Destination: {
            ToAddresses: ['cheguevera597@gmail.com']
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                    <h1>You have an Test that is due at ${startTime} on ${startDate}
                    All the best!</h1>
                    `
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Reminder for the upcoming test"
            }
        }
    }
    try {
        const email = new SendEmailCommand(emailOptions)
        const Response = await sesclient.send(email)
        console.log("Email successfully setup ", Response)
        return 200;
    }
    catch (err) {
        console.log(err)
        return 500;
    }

}


const sendEmailForTestResult = async (stu, tut, score, maxScore, testDate) => {

    //these are sample variables used for testing

    tut = "Ravi"
    const emailOptions = {
        Source: "yogeshpandi857@gmail.com",
        Destination: {
            ToAddresses: ['cheguevera597@gmail.com']
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                    <h1>Your Result for the test by ${tut} on ${testDate} has been published...
                    <br/>
                    <h1> Result : ${score} <span>/${maxScore}<span/><h1/>
                    </h1>
                    `
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test result has been published"
            }
        }
    }
    try {
        const email = new SendEmailCommand(emailOptions)
        const Response = await sesclient.send(email)
        console.log("Email successfully setup ", Response)
        return 200;
    }
    catch (err) {
        console.log(err)
        return 500;
    }

}

const sendEmailForCancelledTest = async (stu, tut, testDate) => {
    //these are sample variables used for testing

    tut = "Ravi"
    const emailOptions = {
        Source: "cheguevera597@gmail.com",
        Destination: {
            ToAddresses: ['oswald.mecse@gmail.com']
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                    <h1>The test by ${tut} on ${testDate} has been cancelled.
                    </h1>
                    `
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test has been cancelled"
            }
        }
    }
    try {
        const email = new SendEmailCommand(emailOptions)
        const Response = await sesclient.send(email)
        console.log("Email successfully setup ", Response)
        return 200;
    }
    catch (err) {
        console.log(err)
        return 500;
    }
}

module.exports = {
    sendEmailForCancelledTest,
    sendEmailForNewTest,
    sendEmailForTestResult
}