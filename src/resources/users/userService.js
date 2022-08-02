const User = require('./usersModel')
const ServiceBase = require('../../service/serviceBase')

class ServiceUser extends ServiceBase{
    constructor(){
        super(User)
    }

    async update(user, id){
        const filter = {_id:id}
        const registeredUser = await this.getOne(filter)
        registeredUser.name = user.name
        registeredUser.email = user.email
        registeredUser.password = user.password
        registeredUser.lastName = user.lastName
        try {
            return await registeredUser.save()
        } catch (error) {
            throw (getModelError(error))
        }        
    }
}

module.exports = new ServiceUser()