class APIresponse {
    constructor(statusCode , message , data , success){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.sucess = statusCode<400;
    }
}

export {APIresponse}