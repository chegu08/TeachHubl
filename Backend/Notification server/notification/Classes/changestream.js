const ClassDetailModel=require("../../models/ClassDetailsModel");
const studDetailModel=require("../../models/studDetailsModel");
const tutorDetailModel=require("../../models/tutorDetailsModel");
const paymentModel=require("../../models/paymentDetailsModel");

const {RemainderForCancelledClass ,RemainderForNewClass}=require("../Classes/schedule")

const changeStream=ClassDetailModel.watch();

function listentoChangeStream() {
    changeStream.on('change', async (change) =>{
        switch(change.operationType) {
            case 'insert' : {
                const studId=change.fullDocument.studId;
                const tutorId=change.fullDocument.tutorId;
                const stud=await studDetailModel.findOne({uid:studId});
                const tutor=await tutorDetailModel.findOne({uid:tutorId});
                const amount=(await paymentModel.findOne({paymentId:change.fullDocument.paymentId})).amount;
                const response=await RemainderForNewClass({
                    studName:stud.name,
                    tutorName:tutor.name,
                    studEmail:stud.email,
                    tutorEmail:tutor.email,
                    className:change.fullDocument.className,
                    subject:change.fullDocument.subject,
                    startDate:change.fullDocument.startDate,
                    endDate:change.fullDocument.endDate,
                    amount,
                    jobName:`New Class created for ${this.studName} and ${this.tutorName}`
                });
                console.log(response);
                break; 
            }
            case 'update' : {
                break; 
            }
        }
    });

    changeStream.on('error',err => console.log(err));
}


module.exports={
    listentoChangeStream
}