require('dotenv').config({ path: 'D:/Github/TeachHubl/.env' });

const aws_config = {
    region: process.env.AWS_REGION,
    S3credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    },
    SEScredentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY
    },
    s3BucketName:process.env.AWS_S3_NAME
};

module.exports = aws_config;
