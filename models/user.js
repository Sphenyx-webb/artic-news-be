import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

//Defining User Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must provide a name']
    },
    userName: {
        type: String,
    },
    photo: String,
    email: {
        type: String,
        required: [true, 'User must provide an email'],
        unique: true,
        lowercase: true,
        validator: [validator.isEmail, 'Submit a valid email']
    },
    roles: {
        type: String,
        default: 'user',
        enum: ['user']
    },
    shortBio: {
        type: String,
        maxLength: 1000
    },
    password: {
        type: String,
        required: [true, 'User must enter a password'],
        minLength: 8,
        select: false
    },
    activated: {
        type: Boolean,
        default: false,
        select: false
    },
    passwordChangedAt: Date,
    activationToken: String,
    activationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});

//Mongoose pre-save hook for activation token generation 
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const actToken = crypto.randomBytes(32).toString('hex');
        this.activationToken = crypto.createHash('sha256').update(actToken).digest('hex')
        this.activationTokenExpires = (Date.now() + 3 * 60 * 1000); //Set to 48 hours for production
    }
})

//Mongoose pre-save hook for password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 8)
    next()
})

//Pre-save hook to record timestamp of password modification
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = (Date.now() - 1000)
})


const User = mongoose.model('User', userSchema)

export default User