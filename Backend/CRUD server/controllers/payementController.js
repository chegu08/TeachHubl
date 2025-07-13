const crypto=require("crypto");
const {razorpay_instance} = require("../config/razorpay-config");
const paymentModel=require("../models/paymentModel");
const OrderDetailsModel=require("../models/paymentOrderDetailsModel");
const StudModel=require("../models/studentDetailModel");
require('dotenv').config({path:"D:/GitHub/TeachHubl/.env"});
const { UpdateTutorScheule,CreateClass }=require("../utils/creatingNewClass");
// const {v4:uuidv4}=require("uuid");


const createOrder=async (req,res) =>{
    try {

        const {amount,receipt,currency,studId,courseName,startDate,tutorName,tutorId,templateId,schedule,endDate,classCount,subject,chaptersRequested}=req.body;
        const order=await razorpay_instance.orders.create({amount,receipt,currency});
        const OrderDetails={orderId:order.id,studId,courseName,startDate,amount,tutorName,tutorId,templateId,schedule,endDate,classCount,subject,chaptersRequested};

        // insert order details into database
        try{
            await OrderDetailsModel.insertOne(OrderDetails);
        } catch(err) {
            console.log(err);
            return res.status(500).json({Error:"Error inserting order into database"});
        }
        res.status(200).json(order);
    } catch(err) {
        console.log(err);
        res.status(500).json({Err:err});
    }
};

const verifySignature=async (req,res) =>{
    try {
        const {razorpay_order_id,razorpay_payment_id,razorpay_signature}= req.body;

        const order = await OrderDetailsModel.findOne({orderId:razorpay_order_id});

        console.log(order);
        if(!order) {
            // render failure page couse this is temporary
            return res.status(400).json({Error:"Invalid details for payment"});
        }

        const sha = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

        const generated_signature=sha.digest("hex");
        if(generated_signature!=razorpay_signature ) {
            // render failure page cause this is temporary
            return res.status(400).json({Message:"Transaction is not legit"});
        }

        // inserting payment record in db
        const paymentDetails={
            paymentId:razorpay_payment_id,
            orderId:razorpay_order_id,
            studId:order.studId,
            amount:order.amount,
            description:"Initial payment",
            tutorId:order.tutorId,
            templateId:order.templateId,
            paymentDate:new Date()
        };

        try{ 
            await paymentModel.insertOne(paymentDetails);
            const classId=await UpdateTutorScheule(order.tutorId,order.schedule,order.courseName);
            const studName=(await StudModel.findOne({uid:order.studId})).name;
            await CreateClass({
                studId:order.studId,
                tutorId:order.tutorId,
                startDate:order.startDate,
                endDate:order.endDate,
                paymentId:razorpay_payment_id,
                classCount:order.classCount,
                className:order.courseName,
                schedule:order.schedule,
                templateId:order.templateId,
                subject:order.subject,
                classId,
                chaptersRequested:order.chaptersRequested,
                tutorName:order.tutorName,
                studName
            });
        } catch(err) {
            console.log(err);
            // render failure page cause this is temporary
            return res.status(500).json({Error:"Error inserting payment details into database"}); 
        }

        res.render('payment-success',{
            studId:order.studId,
            courseName:order.courseName,
            startDate:order.startDate,
            razorpay_payment_id,
            amount:order.amount,
            tutorName:order.tutorName
        });  

    } catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};



module.exports={
    createOrder,
    verifySignature
}