const { name } = require('agenda/dist/agenda/name');
const Tutor = require('../models/tutorDetailModel');
const TutorTemplateCourseModel = require('../models/tutorTemplateCourseModel');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const aws_config = require("../config/aws-config");
const { compressFile } = require('../utils/fileCompression');




const getBestTutors = async (req, res) => {
    try {
        const allTutors = await Tutor.find();
        const bestTutors = [];
        for (let i = 0; i < Math.min(10, allTutors.length); i++) {
            bestTutors.push(
                {
                    tutorName: allTutors[i].name,
                    location: allTutors[i].address,
                    photo: allTutors[i].photo
                }
            )
        }
        res.status(200).json(bestTutors);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const createNewTemplateCourse = async (req, res) => {
    try {

        const { name, overview, description, subject, agenda, chapters, tutorId } = req.body;
        const files = req.files;

        // always the first file from the files array is the course Image
        // and the rest is resources for the course... this is the convention...
        // do not change this

        const courseImage = files[0];

        const client = new S3Client({
            region: aws_config.region,
            credentials: aws_config.S3credentials
        });

        const s3ObjectKeys = await Promise.all(
            files.map(async (file) => {

                const objectKey = `template-courses/${tutorId}/${uuidv4()}_${file.originalname}`;

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

        const compressionOptions = {
            finalSize: 50
        };

        const ThumbnailBuffer = await compressFile(courseImage.buffer, courseImage.mimetype, compressionOptions);
        console.log("new size: ", ThumbnailBuffer.length / 1024);
        console.log("Old Size: ", courseImage.buffer.length / 1024);

        const base64Thumbnail = ThumbnailBuffer.toString('base64');

        const newTemplateCourseDetails = {
            templateCourseId: uuidv4(),
            tutorId: tutorId,
            name: name,
            subject: subject,
            imageKey: s3ObjectKeys[0],
            description: description,
            overview: overview,
            agenda: agenda,
            chapters: chapters,
            thumbnailForImage: base64Thumbnail,
            resourceKeys: s3ObjectKeys.filter((_, ind) => ind != 0)
        };

        const newTemplateCourse = await TutorTemplateCourseModel.create(newTemplateCourseDetails);

        res.status(200).json({ newCourse: newTemplateCourse });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

const getTemplateCourses = async (req, res) => {
    try {
        const tutorId = req.params.tutorId;

        const templateCourses = await TutorTemplateCourseModel.find({ tutorId: tutorId })
            .select('templateCourseId name subject thumbnailForImage -_id');

        res.status(200).json(templateCourses);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
};

module.exports = {
    getBestTutors,
    createNewTemplateCourse,
    getTemplateCourses
};

