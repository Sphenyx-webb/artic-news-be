class customErr extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
        this.isOperational = true //Operational errors are predicatble and inevitable. if false, hide from client.
        Error.captureStackTrace(this, this.constructor) //Ensures that the error stack trace excludes the constructor call
    }
}

export default customErr