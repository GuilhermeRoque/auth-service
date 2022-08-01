const UserService = require('./userService')

const handleErr = (error, res) => {
    console.log(error)
    res.status(error.httpStatusCode).send({
        message: error.message, 
        value: error.value
    })
}

module.exports = {
    create : (async (req, res, next) => {
        try {
            const userCreated = await UserService.create(req.body)
            res.status(201).send(userCreated)          
        } catch (error) {
            handleErr(error, res)
        }
    }),
    
    update: (async (req, res, next) => {
        try {
            const id = req.params.id
            const user = req.body
            const userUpdated = await UserService.update(user, id, req.user)
            res.status(204).send(userUpdated)                    
        } catch (error) {
            handleErr(error, res)
        }
    }),

    get: (async (req, res, next) => {
        try {
            const id = req.params.id
            const userRegistered = await UserService.getById(id, req.user)
            res.status(200).send(userRegistered)                
        } catch (error) {
            handleErr(error, res)            
        }
    }),

    // delete: (async (req, res, next) => {
    //     console.log("USER DELETE CONTROLLER", req.params.id, !req.params.id)
    //     try {
    //         const user =  await User.findById(req.params.id)
    //         if (user){
    //             await user.delete()
    //             res.status(204).send()
    //         }else{
    //             res.status(404).send()
    //         }
    //     } catch (error) {
    //         handleErr(error)
    //     }
    // }),
}