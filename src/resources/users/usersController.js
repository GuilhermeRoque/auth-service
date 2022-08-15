const { signout } = require('../auth/authService')
const userService = require('./userService')
const { HttpStatusCodes } = require('web-service-utils/enums')

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
            const userRegistered = await userService.getById(id, req.user)
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