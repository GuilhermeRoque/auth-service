const jwt = require('jsonwebtoken');
const User = require('../users/usersModel')
const bcrypt = require('bcrypt')
const fs = require('fs')
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY, 'utf8')
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')

async function verify(req, res, next){
    const authString = req.get('Authorization')
    const bearerType = "Bearer "
    if (authString && authString.startsWith(bearerType) && authString.length > bearerType.length){
        const token = authString.split(' ')[1]
        await jwt.verify(token, publicKey, (err, payload) =>{
            if (err){
                next(err)
            }else{
                req.idUser = payload.id
                next()    
            }
        })
    }else{
        res.status(401).send()
        return
    }
}

async function sign(req, res, next){
    const user =  await User.findOne({email:email})
    if (user){
        const passwordIsValid = await bcrypt.compare(password, user.password)
        if (passwordIsValid){
            const token = jwt.sign(
                {id: user.id}, 
                {key:privateKey, passphrase: process.env.GEN_SECRET}, 
                {algorithm: 'RS256', expiresIn: process.env.TOKEN_EXPIRATION_TIME})
                res.set("Authorization", token).status(200).send()                             
        }else{
            res.status(401).send()
        }
    }else{
        res.status(404).send()
    }        

}

module.exports = {
    verify: verify,
    sign: sign
}