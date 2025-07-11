const { agenda } = require("../../config/config");
const { sendEmailForNewClass, sendEmailForCancelledClass } = require("../Classes/Email");

const jobs = [];

const RemainderForNewClass = async ({ studName, className, tutorName, startDate, endDate, amount, subject, studEmail, tutorEmail, jobName }) => {
    try {
        let message = "Successfully defined Job";

        agenda.define(jobName, async (job) => {
            const status=await sendEmailForNewClass({studName, className, tutorName, startDate, endDate, amount, subject, studEmail, tutorEmail});
            if (status==200) {
                console.log(message);
            } else {
                message = "Error in sendEmail function";
            }
        });

        await agenda.now(jobName);
        return message;
    } catch (err) {
        console.log(err);
        return "Error defining job";
    }
};

const RemainderForCancelledClass = async ({ }) => {

};

module.exports = { jobs, RemainderForNewClass, RemainderForCancelledClass }