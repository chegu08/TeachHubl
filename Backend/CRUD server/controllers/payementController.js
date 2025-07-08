const crypto=require("crypto");
const {razorpay_instance} = require("../config/razorpay-config");
const paymentModel=require("../models/paymentModel");
require('dotenv').config({path:"D:/GitHub/TeachHubl/.env"});
// const {v4:uuidv4}=require("uuid");

const cache={};

const createOrder=async (req,res) =>{
    try {

        const {amount,receipt,currency,studId,courseName,startDate,tutorName,tutorId,templateId}=req.body;
        const order=await razorpay_instance.orders.create({amount,receipt,currency});
        cache[order.id]={studId,courseName,startDate,amount,tutorName,tutorId,templateId};
        res.status(200).json(order);

    } catch(err) {
        console.log(err);
        res.status(500).json({Err:err});
    }
};

const verifySignature=async (req,res) =>{
    try {
        const {razorpay_order_id,razorpay_payment_id,razorpay_signature}= req.body;

        if(!cache[razorpay_order_id]) {
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
            studId:cache[razorpay_order_id].studId,
            amount:cache[razorpay_order_id].amount,
            description:"Initial payment",
            tutorId:cache[razorpay_order_id].tutorId,
            templateId:cache[razorpay_order_id].templateId
        };

        await paymentModel.insertOne(paymentDetails);

        res.render('payment-success',{
            studId:cache[razorpay_order_id].studId,
            courseName:cache[razorpay_order_id].courseName,
            startDate:cache[razorpay_order_id].startDate,
            razorpay_payment_id,
            amount:cache[razorpay_order_id].amount,
            tutorName:cache[razorpay_order_id].tutorName
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