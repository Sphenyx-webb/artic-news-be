import express from 'express'
import * as morgan from 'morgan'
import authRouter from './routes/auth.js'

const app = express();

//Middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json())

app.use((req, res, next) => {
    req.reqTime = (new Date()).toISOString();
    next();
})

app.use('/api/v1/auth', authRouter)

app.all('*', (req, res, next) => {
    console.log('Wtf am I doing here....')
})

export default app