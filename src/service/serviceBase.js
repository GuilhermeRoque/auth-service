const {NotFoundError, UnexpectedError, DuplicatedError, ValidationError} = require('./serviceErrors')
const mongoose = require("mongoose")
const mongooseErrors = mongoose.Error
const mongodb = require("mongodb")
const MongoServerError = mongodb.MongoServerError

const MongoErrorCodes = {
    DUPLCIATE: 11000
}

class ServiceBase{
    constructor(model){
        this.model = model
    }

    async findOne(filter) {
        try {
            if (filter._id) return await this.model.findById(filter._id)
            return await this.model.findOne(filter)
        } catch (error) {
            throw this.getServiceError(error)        
        }            
    }

    checkDocumentFound(filter, document) {
        if(document) return document
        throw new NotFoundError(filter)
    }

    async getOne(filter){
        const document = await this.findOne(filter)
        return this.checkDocumentFound(filter, document)
    }

    checkDeleteReport(filter, deleteReport){
        if(deleteReport.deletedCount !==1) throw new NotFoundError(filter)
    }
    
    checkUpdateReport(filter, updateReport){
        if(!updateReport.matchedCount) throw new NotFoundError(filter)
    }

    is_validation_error(error){
        return error instanceof mongooseErrors.ValidationError
    }

    is_duplicated_error(error){
        return error instanceof MongoServerError && error.code === MongoErrorCodes.DUPLCIATE
    }

    async create (document){
        try{
            const newDoc = new this.model(document)
            return await newDoc.save()
        }catch(error){
            throw (this.getServiceError(error))
        }
    }

    async deleteOne(filter){
        const deleteReport = await this.model.deleteOne(filter) 
        return this.checkDeleteReport(filter, deleteReport)
    }

    getServiceError(error){
        console.log("Original error:", error)
        if(this.is_validation_error(error)) return new ValidationError(error)
        if(this.is_duplicated_error(error)) return new DuplicatedError(error)
        return new UnexpectedError(error)
    }

    async update(document, id){
        const filter = {_id:id}
        await this.model.findOne
        const registeredDoc = await this.getOne(filter)
        for(const k of Object.keys(document)){
            registeredDoc[k] = document[k]
        }
        try {
            return await registeredDoc.save()
        } catch (error) {
            throw (getModelError(error))
        }        
    }

}

module.exports = ServiceBase