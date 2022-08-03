const HttpStatusCodes = require('../utils/http')
const userService = require('./userService')

module.exports = {
    create : (async (req, res, next) => {
        try {
            const userCreated = await userService.create(req.body)
            res.status(HttpStatusCodes.CREATED).send(userCreated)          
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        try {
            const id = req.params.id
            const user = req.body
            const userUpdated = await userService.update(user, id)
            res.status(HttpStatusCodes.OK).send(userUpdated)                    
        } catch (error) {
            next(error)
        }
    }),

    get: (async (req, res, next) => {
        try {
            const id = req.params.id
            const filter = {_id:id}
            const userRegistered = await userService.getOne(filter)
            res.status(HttpStatusCodes.OK).send(userRegistered)                
        } catch (error) {
            next(error)            
        }
    }),

    delete: (async (req, res, next) => {
        try {
            const id = req.params.id
            const filter = {_id:id}
            await userService.deleteOne(filter)
            res.status(HttpStatusCodes.NO_CONTENT).send()                    
        } catch (error) {
            next(error)
        }
    }),

    handleErr: (async (error, req, res, next) =>{
        res.status(error.httpStatusCode).send({
            message: error.message, 
            value: error.value
        })
    })
}