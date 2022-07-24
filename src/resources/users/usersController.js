const User = require('./usersModel')

module.exports = {
    create : (async (req, res, next) => {
        console.log("11111111")
        try {
            const user = new User(req.body)
            const userCreated = await user.save()
            res.status(201).send(userCreated)                    
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        console.log("12222222")
        try {
            const id =  req.params.id
            const user =  await User.findById(id)
            if(user){
                user.name = req.body.name
                await user.save()
                res.status(204).send()                    
            }else{
                res.status(404).send()
            }
        } catch (error) {
            next(error)
        }
    }),
    
    getAll: (async (req, res, next) => {
        console.log("55555")
        try {
            const users = await User.find()
            res.send(users)
        } catch (error) {
            next(error)            
        }
    }),
    
    skip: (async (req, res, next) => {
        res.status(200).send()
    }),

    get: (async (req, res, next) => {
        console.log("USER GET CONTROLLER", req.params.id, !req.params.id)
        if (!req.params.id){
            res.status(400).send({message: "ID param is needed"})
        }else{
            try {
                const user =  await User.findById(req.params.id)
                if (user){
                    res.send(user)    
                }else{
                    res.status(404).send()
                }   
            } catch (error) {
                next(error)            
            }    
        }
    }),

    delete: (async (req, res, next) => {
        console.log("USER DELETE CONTROLLER", req.params.id, !req.params.id)
        try {
            const user =  await User.findById(req.params.id)
            if (user){
                await user.delete()
                res.status(204).send()
            }else{
                res.status(404).send()
            }
        } catch (error) {
            next(error)
        }
    }),
    
    handleError:(async (err, req, res, next) => {
        console.log("888888")
        console.log(err)
        if (err.name == "ValidationError"){
            res.status(400).send({error:err.message})
        }else{
            res.status(500).send()
        }
    })
}