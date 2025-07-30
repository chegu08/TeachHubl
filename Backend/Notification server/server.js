const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config({ path: 'D:/Github/TeachHubl/.env' });
const { jobs: testJobs } = require('./notification/Tests/schedule');
const { jobs: classJobs } = require("./notification/Classes/schedule");
const { listentoChangeStream: testListenToChangeStream } = require('./notification/Tests/changestream');
const { listentoChangeStream: classListenToChangeStream } = require('./notification/Classes/changestream');
const { agenda } = require('./config/config');
const authSessionModel = require("./models/authSessionModel");
const pushSubscriptionModel = require("./models/pushSubscriptionModel");
const jwt = require("jsonwebtoken");


const mongoose = require('mongoose')

const corsOptions = {
    origin: '*',
    Headers: ['AllowedOrigin', 'Content-Type']
}

app.use(cors(corsOptions))
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.post('/save-subscription', async (req, res) => {
    try {
        const { subscription, userId, auth_token } = req.body;

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(auth_token, process.env.AUTH_SECRET, async (err, decoded) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else resolve(decoded);
            });
        });
        const { sessionId } = decoded;
        const session = await authSessionModel.findOne({ sessionId });

        if (!session) {
            return res.status(403).json({ Error: "Session expired...signin required" });
        }

        await pushSubscriptionModel.create({ userId, subscription });

        res.status(200).json({ message: "Success" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: err });
    }
});

async function termination() {
    await agenda.stop()
    //set all the canceling logic here
    for (const jobName of testJobs) {
        await agenda.cancel({ name: jobName })
        console.log(`${jobName} has been cancelled`)
    }
    for (const jobName of classJobs) {
        await agenda.cancel({ name: jobName })
        console.log(`${jobName} has been cancelled`)
    }
    process.exit(0)
}


const init = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to database ...")
        await agenda.start()
        testListenToChangeStream();
        classListenToChangeStream();
        console.log("Change Stream is set...")
        app.listen(4001, console.log("server is running on port 4001..."))
    }
    catch (err) {
        console.log(err)
    }
}


process.on('SIGINT', termination)
process.on('SIGTERM', termination)

init()


