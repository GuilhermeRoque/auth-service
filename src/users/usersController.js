const model = require('./usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// async function buildUser(req){
//     return  {
//     }
// }

module.exports = {
    create : (async (req, res, next) => {
        try {
            hashPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS))
            user = {
                name: req.body.name,
                email: req.body.email,
                hashPassword: hashPassword        
            }
            model.create(user,(err,userCreated) => {
                if (err){
                    res.status(400).send({message:err.message})
                }else {
                    res.status(201).send(userCreated)                
                }
            })
        } catch (error) {
            res.status(500).send()
        }
    }),
    
    update: (async (req, res, next) => {
        const id =  req.params.id
        try {
            const user =  await model.findById(id)
            user.name = req.body.name
            await user.save()
            res.status(204).send()                
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
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

    delete: (async (req, res, next) => {
        const id =  req.params.id
        const result =  await model.findById(id)
        await result.delete()
        res.status(204).send()
    })   

}