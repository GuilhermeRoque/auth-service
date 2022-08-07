const {NotFoundError, DuplicatedError, ValidationError, UnexpectedError} = require('./serviceErrors')
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

    async _findOne(filter) {
        try {
            if (filter._id) return await this.model.findById(filter._id)
            return await this.model.findOne(filter)
        } catch (error) {
            throw this.getServiceError(error)        
        }            
    }

    async _create (document){
        try{
            const newDoc = new this.model(document)
            return await newDoc.save()
        }catch(error){
            throw (this.getServiceError(error))
        }
    }

    async _getOne(filter){
        const document = await this._findOne(filter)
        return this.checkDocumentFound(filter, document)
    }

    async _getById(id){
        const filter = {_id: id}        
        return await this._getOne(filter)
    }

    async _getAll(filter){
        return await this.model.find(filter)
    }

    async _deleteOne(filter){
        const deleteReport = await this.model.deleteOne(filter) 
        return this.checkDeleteReport(filter, deleteReport)
    }

    async _deleteById(id){
        const filter = {_id:id}
        return await this._deleteOne(filter)
    }

    async _update(document, id){
        const registeredDoc = await this._getById(id)
        for(const k of Object.keys(document)){
            registeredDoc[k] = document[k]
        }
        try {
            return await registeredDoc.save()
        } catch (error) {
            throw (getModelError(error))
        }        
    }
    
    checkDocumentFound(filter, document) {
        if(document) return document
        throw new NotFoundError(filter)
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

    getServiceError(error){
        console.log("Original error:", error)
        if(this.is_validation_error(error)) return new ValidationError(error)
        if(this.is_duplicated_error(error)) return new DuplicatedError(error)
        return error
    }

}

module.exports = ServiceBase