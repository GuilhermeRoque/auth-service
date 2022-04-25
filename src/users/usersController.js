const User = require('./usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')

module.exports = {
    create : (async (req, res, next) => {
        try {
            // if(req.body.id){
            //     const user =  await User.findById(req.body.id)
            //     if(user){
            //         return res.status(409).send()
            //     }    
            // }
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
            email = req.body.email
            password = req.body.password
            if ((!email) | (!password)){
                res.status(400).send()
            }else{
                const user =  await User.findOne({email:email})
                if (user){
                    const passwordIsValid = await bcrypt.compare(password, user.password)
                    if (passwordIsValid){
                        const token = jwt.sign(
                            {id: user.id}, 
                            {key:privateKey, passphrase: process.env.GEN_SECRET}, 
                            {algorithm: 'RS256', expiresIn: process.env.TOKEN_EXPIRATION_TIME})
                            res.set("authorization", token).status(204).send()        
                    }else{
                        res.status(401).send()
                    }
                }else{
                    res.status(404).send()
                }        
            }
        } catch (error) {
            console.log(error)
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
        console.log(err)
        if (err.name == "ValidationError"){
            res.status(400).send({error:err.message})
        }else{
            res.status(500).send()
        }
    })
}