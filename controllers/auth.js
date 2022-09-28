import User from '../models/user.js'
import catchAsync from '../Utils/asyncErr.js'



const signUp = catchAsync(async (request, response, next) => {
    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordChangedAt: request.body.passwordChangedAt,
        role: request.body.role
    });
    createSendToken(newUser, 201, response);
})