const HttpStatusCodes = require('../resources/utils/http')

class ValidationError extends Error {
    constructor(error){
        super("Validation failed")
        this.httpStatusCode = HttpStatusCodes.BAD_REQUEST
        const value = []
        for(const err of Object.entries(error.errors)){
            value.push(
                {
                    field: err[0], 
                    error: err[1].kind,
                    input: err[1].value
                })
        }
        this.value = value
    }
}

class DuplicatedError extends Error {
    constructor(error){
        super("Duplicated data")
        this.httpStatusCode = HttpStatusCodes.CONFLICT
        this.value = error.keyValue
    }
}

class NotFoundError extends Error {
    constructor(filter){
        super("Not found"),
        this.httpStatusCode = HttpStatusCodes.NOT_FOUND,
        this.value = filter
    }
}

class UnexpectedError extends Error {
    constructor(error){
        super("Unexpected Error"),
        this.httpStatusCode = HttpStatusCodes.INTERNAL_SERVER
        this.value = {
            message: error.message,
            stack: error.stack
        }
    }
}

module.exports = {
    ValidationError,
    DuplicatedError,
    UnexpectedError,
    NotFoundError,

}