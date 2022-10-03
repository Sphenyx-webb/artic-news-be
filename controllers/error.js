import customErr from "../Utilities/customErr.js";

//Formatting errors during development
const devErr = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
};

//Formatting Production errors
const prodErr = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
};

//Special Non-Operational errors
const castErr = (err) => {

};

const duplicateErr = (err) => {

};

const validationErr = (err) => {

}

const invalidJwtErr = (err) => {

}

const expiredJwtErr = (err) => {

}


//Express global error
const globalErr = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    if (process.env.NODE_ENV === 'development') {
        devErr(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = {
            ...err
        }
        if (error.name === 'CastError') err = castErr(err);
        if (error.code === 11000) err = duplicateErr(err);
        if (error.name === 'ValidationError') err = validationErr(err);
        if (error.name === 'JsonWebTokenError') err = invalidJwtErr();
        if (error.name === 'TokenExpiredError') err = expiredJwtErr();
    }
};

export default globalErr