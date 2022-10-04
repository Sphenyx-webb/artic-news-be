import express from 'express';
import {
    signUp,
    activateAcc,
    login
} from '../controllers/auth.js'


const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/login', login)
authRouter.patch('/activate/:token', activateAcc)

export default authRouter