const Agenda=require('agenda');
const {SESClient} =require('@aws-sdk/client-ses');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config({path:'D:/Github/TeachHubl/.env'});

const agenda = new Agenda({
    db: {
        collection: "notification",
        address: process.env.MONGO_URL
    }
});

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    },
})

const sesclient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY
    }
})

module.exports={
    agenda,sesclient,s3Client
}