const HttpStatusCodes = require('../resources/utils/http')

class ServiceError extends Error {
    constructor(httpStatusCode, message, value){
        super(message)
        this.httpStatusCode = httpStatusCode
        this.message = message
        this.value = value
    }
}

class ValidationError extends ServiceError {
    constructor(error){
        const message = "Validation failed"
        const httpStatusCode = HttpStatusCodes.BAD_REQUEST
        const value = []
        for(const err of Object.entries(error.errors)){
            value.push(
                {
                    field: err[0], 
                    error: err[1].kind,
                    input: err[1].value
                })
        }
        super(httpStatusCode, message, value)
    }
}

class FailedSanityCheckError extends ServiceError{
    constructor(value){
        const message = "Sanity check failed"
        const httpStatusCode = HttpStatusCodes.BAD_REQUEST
        super(httpStatusCode, message, value)
    }
}

class DuplicatedError extends ServiceError {
    constructor(error){
        const message = "Duplicated data"
        const httpStatusCode = HttpStatusCodes.CONFLICT
        const value = error.keyValue
        super(httpStatusCode, message, value)
    }
}

class NotFoundError extends ServiceError {
    constructor(filter){
        const message = "Not found"
        const httpStatusCode = HttpStatusCodes.NOT_FOUND
        const value = filter
        super(httpStatusCode, message, value)
    }
}

class ForbiddenError extends ServiceError {
    constructor(user, reason){
        const message = "You have no permission to do this"
        const httpStatusCode = HttpStatusCodes.FORBIDEN
        const value = {
            user: user,
            reason: reason
        }
        super(httpStatusCode, message, value)
    }
}

class RoleError extends ForbiddenError{
    constructor(member, role){
        super(member, `You must have a role level ${role}`)
    }
}

class UnexpectedError extends ServiceError {
    constructor(error){
        const message = "Unexpected Error"
        const httpStatusCode = HttpStatusCodes.INTERNAL_SERVER
        const value = {
            message: error.message,
            stack: error.stack
        }
        super(httpStatusCode, message, value)        
    }
}



module.exports = {
    ServiceError,
    ValidationError,
    DuplicatedError,
    NotFoundError,
    ForbiddenError,
    RoleError,
    FailedSanityCheckError,
    UnexpectedError

}