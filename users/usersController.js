const express = require('express')
const router = express.Router()
const model = require('./usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/', async (req, res, next)=>{
    user = req.body
    user.hashPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS))
    const userCreated = await model.create(req.body)
    res.status(201).send(userCreated)
})

router.post('/:id/login', async (req, res, next)=>{
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
})

router.get('/', async function(req, res, next) {
    const results = await model.find()
    res.send(results)
});

router.get('/:id', async (req, res, next)=>{
    const id =  req.params.id
    const result =  await model.findById(id)
    if (!result){
        res.status(404).send()
    }else{
        res.send(result)    
    }

})

router.put('/:id', async (req, res, next)=>{
    const id =  req.params.id
    const user =  await model.findById(id)
    user.name = req.body.name
    await user.save()
    res.status(204).send()
})

router.delete('/:id', async (req, res, next)=>{
    const id =  req.params.id
    const result =  await model.findById(id)
    await result.delete()
    res.status(204).send()
})

module.exports = router;
