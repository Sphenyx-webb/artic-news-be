import User from '../models/user.js';
import catchAsync from '../Utils/asyncErr.js';
import customErr from '../Utils/customErr.js'
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import {
    actAccEmail,
    resetAccEmail
} from '../Utils/email.js';

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
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    if (newUser) {
        const activationToken = newUser.actToken()
        const activateURL = `${req.protocol}://${req.get('host')}/api/v1/auth/activate/${activationToken}`;
        actAccEmail(req, newUser, activateURL)
        res.status(201).json({
            status: 'success',
            meesage: 'User created successfully'
        })
        await newUser.save()
    } else {
        res.status(400).json({
            status: 'fail',
            message: 'Error creating account'
        })
    }
});

const activateAcc = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        activationToken: hashedToken,
        activationTokenExpires: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return next(new customErr('Invalid or Expired Token', 400))
    } else {
        user.activated = true;
        user.activationToken = undefined;
        user.activationTokenExpires = undefined
        await user.save()
        res.status(200).json({
            status: 'success',
            message: 'Account activated'
        })
    }
})

const login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body

    if (!email || !password) {
        return next(new customErr('Enter an email and password', 400))
    }
    const user = await User.findOne({
        email: email
    }).select('+password') //Overriding schema level select=false for password field

    if (!user || !(await user.checkPass(password, user.password))) {
        return next(new customErr('Email or password incorrect', 401))
    }
    //Send jwt and user data to confirm successful login
    const token = signJwt(user.id)
    user.password = undefined //To avoid leaking user password
    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        data: {
            user
        }
    })
});

const authorize = catchAsync(async (req, res, next) => {
    let accessToken;
    //Get Token else throw error
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        accessToken = req.headers.authorization.split(` `)[1]
    } else {
        return next(new customErr('User unauthenticated!!!', 401))
    }
    //Verify Token
    const verified = await promisify(jwt.verify)(accessToken.process.env.JWT_SECRET)

    //Get user
    const user = await User.findById(verified.id)
    if (!user) {
        return next(new customErr('User no longer exists', 404))
    }
    //Check if user has changed password since previous login
    if (user.currentPass(verified.iat)) {
        return next(new customErr('Password has been recently changed, Kindly login', 401))
    }
    //Grant access
    req.user = user;
    next()
});

const forgotPassword = catchAsync(async (req, res, next) => {
    let token = '';
    const {
        email
    } = req.body
    const user = await User.findOne({
        email
    })
    if (!user) return next(new customErr('User does not exist', 404))
    else {
        token = user.resetToken()
    }
    const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${token}`;
    resetAccEmail(req, user, resetLink)
    res.status(200).json({
        status: 'success',
        message: 'Reset token sent to user\'s email'
    })
    await user.save()
})

const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenRxpires: {
            $gt: Date.now()
        }
    })
    if (!user) return next(new customErr('Invalid or Expired Token', 400))
    else {
        user.password = req.body.password
        user.passwordResetToken = undefined
        user.passwordResetTokenRxpires = undefined
        await user.save()
    }
    //  const token = signJwt(user.id)
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully',
        //  token,
        data: {
            user //Think about user field to exclude when actually in production
            //Do we sign in user after they reset password or do we ask them to login with the newly created password
        }
    })
});

const restrict = (...roles) => {
    //Closure at work 
    return (request, response, next) => {
        if (!roles.includes(request.user.role)) {
            return next(new customErr('You do not have permission for this action', 403));
        }
        next()
    }
};


export {
    signUp,
    activateAcc,
    login,
    authorize,
    forgotPassword,
    resetPassword,
    restrict
    //Note to update user roles in schema and implement in routes, fix chores and check test before further implementations
}