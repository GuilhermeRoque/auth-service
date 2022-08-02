const User = require('./usersModel')
const ServiceBase = require('../../service/serviceBase')

class ServiceUser extends ServiceBase{
    constructor(){
        super(User)
    }
}

module.exports = new ServiceUser()