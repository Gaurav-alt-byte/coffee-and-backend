class APIError extends Error {
    constructor(message="something went wrong", statuscode , success, data , errors = [] , stack = "")
    {
        super(message)
        this.message = message;
        this.statusCode = statuscode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if(stack)
        {
            this.stack = stack;
        }
        else
        {
            Error.captureStackTrace(this , this.constructor);
        }
    }
}

export {APIError};