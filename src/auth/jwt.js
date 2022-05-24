const jwt = require('jsonwebtoken');
const User = require('../users/usersModel')
const bcrypt = require('bcrypt')
const fs = require('fs')
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY, 'utf8')
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')

async function verify(req, res, next){
    const authString = req.get('Authorization')
    const bearerType = "Bearer "
    console.log("BODY in verify", req.body)
    if (authString && authString.startsWith(bearerType) && authString.length > bearerType.length){
        const token = authString.split(' ')[1]
        await jwt.verify(token, publicKey, (err, payload) =>{
            if (err){
                next(err)
            }else{
                req.user = payload.user
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
                {user: user.toJSON()}, //payload
                {key:privateKey, passphrase: process.env.GEN_SECRET}, 
                {algorithm: 'RS256', expiresIn: process.env.TOKEN_EXPIRATION_TIME})
                res.status(200).send({
                    email: user.email,
                    _id: user._id,
                    name: user.name,
                    lastName: user.lastName,    
                    token: token,
                })                             
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