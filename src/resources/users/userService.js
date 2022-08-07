const {User} = require('./usersModel')
const ServiceBase = require('../../service/serviceBase')
const { ForbiddenError } = require('../../service/serviceErrors')

class ServiceUser extends ServiceBase{
    USER_AUTHORIZATION_MESSAGE = "User can only perform read, update and delete operations on itself"
    
    constructor(){
        const model = User
        super(model)
    }


    checkUserAuthorization(id, caller){
        if(id !== caller._id) throw new ForbiddenError(caller, {message: this.USER_AUTHORIZATION_MESSAGE, value:{callerId: caller._id, userId: id}})
    } 

    async getById(id, caller){
        console.log("id", id)
        console.log("caller", caller)
        this.checkUserAuthorization(id, caller)
        return await super._getById(id)
    }

    async deleteById(id, caller){
        this.checkUserAuthorization(id, caller)
        return await super._deleteById(id)
    }

    async update(user, id, caller){
        this.checkUserAuthorization(id, caller)
        return await super._update(user, id)
    }

    async create(user){
        return await super._create(user)
    }

}

module.exports = new ServiceUser()