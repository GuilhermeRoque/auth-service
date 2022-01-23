const model = require('./usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
    create : (async (req, res, next) => {
        user = req.body
        hashPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS))
        const userCreated = await model.create(req.body)
        res.status(201).send(userCreated)
    }),
    
    login: (async (req, res, next) => {
        const id =  req.params.id
        const user =  await model.findById(id)
        if (user){
            const passwordIsValid = await bcrypt.compare(req.body.password, user.hashPassword)
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
        const results = await model.find()
        res.send(results)
    }),
    
    get: (async (req, res, next) => {
        const id =  req.params.id
        const result =  await model.findById(id)
        if (!result){
            res.status(404).send()
        }else{
            res.send(result)    
        }
    
    }),
    
    update: (async (req, res, next) => {
        const id =  req.params.id
        const user =  await model.findById(id)
        user.name = req.body.name
        await user.save()
        res.status(204).send()
    }),
    
    delete: (async (req, res, next) => {
        const id =  req.params.id
        const result =  await model.findById(id)
        await result.delete()
        res.status(204).send()
    })   

}