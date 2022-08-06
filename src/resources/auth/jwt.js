const jwt = require('jsonwebtoken');
const User = require('../users/usersModel')
const bcrypt = require('bcrypt')
const redisClient = require('./redisClient')

const ACCESS_TOKEN_TIMEOUT = '300s'
const REFRESH_TOKEN_TIMEOUT = '1d'

const __getToken = (req) => {
    const authString = req.get('Authorization')
    const bearerType = "Bearer "
    if (authString && authString.startsWith(bearerType) && authString.length > bearerType.length){
        const token = authString.split(' ')[1]
        return token
    }
    return null
}

async function verify(req, res, next){
    const token = __getToken(req)
    console.log("VERIFYING TOKEN: ", token)
    if (token){
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err) return res.sendStatus(403); //invalid token
            else{
                const denyToken = await redisClient.getDenyList(token)
                if (denyToken) return res.sendStatus(403)
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
    const passwordIsValid = user?await bcrypt.compare(password, user?.password):false
    if (passwordIsValid){
        const accessToken = jwt.sign(
            {user: user.toJSON()},
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TIMEOUT})

        const refreshToken = jwt.sign(
            {userId: user._id.toString()},
            process.env.REFRESH_TOKEN_SECRET, 
            {expiresIn: REFRESH_TOKEN_TIMEOUT})
            
            const secure = process.env.PRODUCTION? true:null

            // Creates Secure Cookie with refresh token
            res.cookie(
                'jwt', 
                refreshToken, 
                { 
                    httpOnly: true, 
                    secure: secure, 
                    sameSite: 'none', 
                    maxAge: 24 * 60 * 60 * 1000 
                }
            );

            res.status(200).send({
                message: "Successfull authentication",
                user: user, 
                accessToken: accessToken
            })                             

    }else{
        res.status(401).send()
    }
}

async function refresh(req, res, next){
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.sendStatus(403);
            const denyToken = await redisClient.getDenyList(refreshToken)
            if (denyToken) return res.sendStatus(403)
            const user =  await User.findById(decoded.userId)
            const accessToken = jwt.sign(
                {user: user.toJSON()},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_TIMEOUT }
            );
            res.status(200).send({accessToken: accessToken})
        }
    );    
}

async function signout(req){
    const cookies = req.cookies;
    const refreshToken = cookies.jwt;
    if(refreshToken){
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (!err) await redisClient.pushDenyList(refreshToken)
            }
        )    
    }
    const accessToken = __getToken(req)
    if(accessToken){
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (!err) await redisClient.pushDenyList(accessToken)
        })
    }
}

module.exports = {
    verify: verify,
    sign: sign,
    refresh: refresh,
    signout: signout
}