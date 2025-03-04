const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config({ path: 'D:/Github/TeachHubl/.env' })
const { jobs } = require('./notification/schedule')
const { listentoChangeStream } = require('./notification/changestream')
const { agenda } = require('./config/config')

const mongoose = require('mongoose')

const corsOptions = {
    origin: '*',
    Headers: ['AllowedOrigin', 'Content-Type']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


async function termination() {
    await agenda.stop()
    //set all the canceling logic here
    for (const jobName of jobs) {
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
        await listentoChangeStream()
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


