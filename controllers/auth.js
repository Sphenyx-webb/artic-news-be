import User from '../models/user.js';
import catchAsync from '../Utils/asyncErr.js';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import emailTemplate from '../Utils/email.js';

const signJwt = (id) => jwt.sign({
    id
}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})



const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        userName: req.body.userName,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    //Check that user is successfully created before sending email
    if (newUser) {
        console.log(newUser)
        const activateURL = `${req.protocol}://${req.get('host')}/api/v1/auth/activate/${newUser.activationToken}`;
        emailTemplate(req, newUser, activateURL)
        res.status(201).json({
            status: 'success',
            meesage: 'User created successfully'
        })
    } else {
        res.status(200).json({
            status: 'fail',
            message: 'Error creating account'
        })
    }
});

export {
    signUp
}