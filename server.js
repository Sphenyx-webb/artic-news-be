import mongoose, {
    connect
} from "mongoose";
import * as dotenv from 'dotenv'

//Handling uncuaght exceptions
process.on('uncaughtException', err => {
    console.log(err) //Log the error (Only while in dev)
    process.exit(1)
})

dotenv.config({
    path: './config.env'
});

import app from './app.js'

const dbUri = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connection successful...')
})


const port = process.env.PORT || 5000

const server = app.listen(port, () => {
    console.log(`App is running on server port ${port}`)
})

//Handling unhandled async errors
process.on('unhandledRejection', err => {
    console.log(err) //Only log error during dev
    server.close(() => {
        process.exit(1)
    })
})