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

    login: (async (req, res, next) => {
        try {
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
        } catch (error) {
            next(error)            
        }
    }),
    
    getAll: (async (req, res, next) => {
        try {
            const users = await User.find()
            res.send(users)
        } catch (error) {
            next(error)            
        }
    }),
    
    get: (async (req, res, next) => {
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
    }),

    delete: (async (req, res, next) => {
        try {
            const user =  await User.findById(req.params.id)
            if (user){
                await result.delete()
                res.status(204).send()
            }else{
                res.status(404).send()
            }                
        } catch (error) {
            next(error)
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