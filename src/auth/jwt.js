const jwt = require('jsonwebtoken');
const User = require('../resources/users/usersModel')
const bcrypt = require('bcrypt')

const ACCESS_TOKEN_TIMEOUT = '300s'
const REFRESH_TOKEN_TIMEOUT = '1d'

async function verify(req, res, next){
    const authString = req.get('Authorization')
    const bearerType = "Bearer "
    console.log("VERIFYING TOKEN")
    if (authString && authString.startsWith(bearerType) && authString.length > bearerType.length){
        const token = authString.split(' ')[1]
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, payload) =>{
            if (err) return res.sendStatus(403); //invalid token
            else{
                console.log("PAYLOAD: ", payload)
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
    let email = req.body.email
    let password = req.body.password
    const user =  await User.findOne({email: email})
    if (user){
        const passwordIsValid = await bcrypt.compare(password, user.password)
        if (passwordIsValid){
            const accessToken = jwt.sign(
                {user: user.toJSON()}, //payload
                process.env.ACCESS_TOKEN_SECRET, 
                {expiresIn: ACCESS_TOKEN_TIMEOUT})

            const refreshToken = jwt.sign(
                {user: user.toJSON()}, //payload
                process.env.REFRESH_TOKEN_SECRET, 
                {expiresIn: REFRESH_TOKEN_TIMEOUT})

                // Creates Secure Cookie with refresh token
                res.cookie(
                    'jwt', 
                    refreshToken, 
                    { 
                        httpOnly: true, 
                        secure: true, 
                        sameSite: 'none', 
                        maxAge: 24 * 60 * 60 * 1000 
                    }
                );

                res.status(200).send({
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    lastName: user.lastName,    
                    token: accessToken,
                    organizations: user.organizations
                })                             

        }else{
            res.status(401).send()
        }

    }else{
        res.status(404).send()
    }        

}

async function refresh(req, res, next){
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {user: {...decoded.user}},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_TIMEOUT }
            );
            res.status(200).send({token: accessToken})
        }
    );    
}

module.exports = {
    verify: verify,
    sign: sign,
    refresh: refresh
}