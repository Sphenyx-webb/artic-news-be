import express from 'express';
import {
    signUp,
    activateAcc
} from '../controllers/auth.js'


const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.patch('/activate/:token', activateAcc)

export default authRouter