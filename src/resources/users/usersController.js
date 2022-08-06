const { ServiceError } = require('../../service/serviceErrors')
const { signout } = require('../auth/jwt')
const HttpStatusCodes = require('../utils/http')
const userService = require('./userService')

module.exports = {
    create : (async (req, res, next) => {
        try {
            const user = req.body
            const userCreated = await userService.create(user)
            res.status(HttpStatusCodes.CREATED).send(userCreated)          
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        try {
            const id = req.params.id
            const user = req.body
            const caller = req.user
            const userUpdated = await userService.update(user, id, caller)
            res.status(HttpStatusCodes.OK).send(userUpdated)                    
        } catch (error) {
            next(error)
        }
    }),

    get: (async (req, res, next) => {
        try {
            const id = req.params.id
            const caller = req.user
            console.log('user', req.user)
            console.log('userId', req.userId)
            const userRegistered = await userService.getById(id, caller)
            res.status(HttpStatusCodes.OK).send(userRegistered)                
        } catch (error) {
            next(error)            
        }
    }),

    delete: (async (req, res, next) => {
        try {
            const id = req.params.id
            const caller = req.user
            await userService.deleteById(id, caller)
            await signout(req)
            res.status(HttpStatusCodes.NO_CONTENT).send()                    
        } catch (error) {
            next(error)
        }
    }),
}