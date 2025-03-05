const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')


dotenv.config({path:'D:/Github/TeachHubl/.env'})
const mongourl = process.env.MONGO_CRUD_URL
console.log(mongourl)

const corsOptions = {
    orgin: '*',
    //allowedHeaders: ['Content-Type', 'Authorization']
    methods: ["GET", "PUT", "POST", "DELETE"]
}

//middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//middleware for routes
const signupRouter = require('./routes/signupRouter')
app.use('/signup', signupRouter)
const loginRouter = require('./routes/loginRouter')
app.use('/login', loginRouter)
const testRouter=require('./routes/testRouter')
app.use('/test',testRouter)


const port = process.env.PORT || 4000



const init = async () => {
    try {
        const connection = await mongoose.connect(mongourl,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50, // Increase pool size if needed
            serverSelectionTimeoutMS: 30000, // Increase timeout
          });
        //console.log(connection)
        console.log("database connected successfully")
        app.listen(port, () => {
            console.log(`server is runnning on port ${port}`)
        })
    }
    catch (err) {
        console.log(err)
    }
}

init()

