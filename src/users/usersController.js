const User = require('./usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
    create : (async (req, res, next) => {
        try {
            const user = new User(req.body)
            const userCreated = await user.save()
            res.status(201).send(userCreated)                
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        const id =  req.params.id
        try {
            const user =  await User.findById(id)
            user.name = req.body.name
            await user.save()
            res.status(204).send()                
        } catch (error) {
            res.status(500).send()
        }
    }),

    login: (async (req, res, next) => {
        const user =  await User.findById(req.params.id)
        if (user){
            const passwordIsValid = await bcrypt.compare(req.body.password, user.password)
            if (passwordIsValid){
                const token = jwt.sign({id: user.id}, process.env.JWT_KEY, { expiresIn: process.env.TOKEN_EXPIRATION_TIME })
                res.set("Authorization", token).status(204).send()        
            }else{
                res.status(401).send()
            }
        }else{
            res.status(404).send()
        }
    }),
    
    getAll: (async (req, res, next) => {
        const users = await User.find()
        res.send(users)
    }),
    
    get: (async (req, res, next) => {
        const user =  await User.findById(req.params.id)
        if (!user){
            res.status(404).send()
        }else{
            res.send(user)    
        }
    
    }),

    delete: (async (req, res, next) => {
        const user =  await User.findById(req.params.id)
        if (!user){
            res.status(404).send()
        }else{
            await result.delete()
            res.status(204).send()
        }
    }),
    
    handleError:(async (err, req, res, next) => {
        if (err.name == "ValidationError"){
            res.status(400).send({error:err.message})
        }else{
            res.status(500).send()
        }
})
}