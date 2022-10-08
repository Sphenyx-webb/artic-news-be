import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config({
    path: './config.env'
});

const sendEmail = async function (options) {

    //Create a transporter
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    //Define transport Object
    let mailOptions = {
        from: 'dev, <backend.artic-news.com>', // sender address
        to: options.to, // list of receivers
        subject: options.subject,
        text: options.text,
        // html - HTML can be specified - Will be done later via a template, also custom
    };

    //Send email
    let emailInfo = await transporter.sendMail(mailOptions)
    if (emailInfo) console.log(emailInfo.messageId)
};

const actAccEmail = async function (req, user, link) {
    const message = `Dear ${user.name}
            You have successfully registered on artic-news. To activate your account please click the following link or copy and paste it into a browser.
            ${link}
            This link expires in 48hours and your registration will be deleted from the database.`
    try {
        await sendEmail({
            to: user.email,
            subject: 'Notification to Activate Account',
            text: message
        })
    } catch (err) {
        console.log(err)
        user.activationToken = undefined;
        user.activationTokenExpires = undefined;
        await user.save() //Use validate only modified option and check why this alternative was created
    }
}

const resetAccEmail = async function (req, user, link) {
    const message = `Dear ${user.name}
        A request was made to reset your password, click the link below to reset your password
        ${link}

        if you did not make this request, kindly ignore this email`
    try {
        await sendEmail({
            to: user.email,
            subject: 'Reset Password',
            text: message
        })
    } catch (err) {
        console.log(err)
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined
        await user.save()
    }
}

export {
    actAccEmail,
    resetAccEmail
}