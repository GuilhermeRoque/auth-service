const HttpStatusCodes = require('./http')
const mongoose = require("mongoose")
const mongooseErrors = mongoose.Error
const mongodb = require("mongodb")
const MongoServerError = mongodb.MongoServerError

const MongoErrorCodes = {
    DUPLCIATE: 11000
}
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
    constructor(message){
        super(message),
        this.httpStatusCode = HttpStatusCodes.INTERNAL_SERVER
    }
}

const is_validation_error = (error) => {
    return error instanceof mongooseErrors.ValidationError
}
const is_duplicated_error = (error) => {
    return error instanceof MongoServerError && error.code === MongoErrorCodes.DUPLCIATE
}

const getModelError = (error) => {
    console.log("Original error:", error)
    if(is_validation_error(error)) return new ValidationError(error)
    if(is_duplicated_error(error)) return new DuplicatedError(error)
    return new UnexpectedError(error)
}


module.exports = {
    ValidationError,
    DuplicatedError,
    UnexpectedError,
    NotFoundError,
    is_duplicated_error,
    is_validation_error,
    getModelError
}