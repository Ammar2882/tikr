class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const SuccessResponse = (res,success,message,data)=>{
    res.status(200).json({
        success,
        message,
        data
    })
}

export {ErrorResponse , SuccessResponse}