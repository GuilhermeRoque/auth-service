const jwt = require('jsonwebtoken');
const {User} = require('../users/usersModel')
const bcrypt = require('bcrypt')
const {redisClient} = require('./redisClient');
const { UnauthorizedError } = require('../../service/serviceErrors');
const {promisify} = require('util')
const ACCESS_TOKEN_TIMEOUT = '300s'
const REFRESH_TOKEN_TIMEOUT = '1d'
const verifyAsync = promisify(jwt.verify)
const signAsync = promisify(jwt.sign)

// check if token is in deny list -> check if token is valid -> check if user is in deny list
async function verify(accessToken){
    console.log("VERIFYING TOKEN: ", accessToken)

    if (!accessToken) throw new UnauthorizedError("Access token missing")
    const isInDenyListJWT = await redisClient.isInDenyListJWT(accessToken)
    if (isInDenyListJWT) throw new UnauthorizedError("Access token is in deny list", {accessToken: accessToken})

    let user = undefined
    try {
        const payload = await verifyAsync(accessToken, process.env.ACCESS_TOKEN_SECRET)
        console.log("PAYLOAD: ", payload)
        user = payload.user
    } catch (error) {
        throw new UnauthorizedError("Access token is invalid", {accessToken: accessToken})        
    }
    const userId = user._id
    const isInDenyUserList = await redisClient.isInDenyListUserId(userId)
    if (isInDenyUserList) throw new UnauthorizedError("User is in deny list", {accessToken: accessToken, user: user})
    return {user: user, accessToken: accessToken}

}

async function createAccessToken(user){
    return signAsync(
        {user: user},
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: ACCESS_TOKEN_TIMEOUT})
}

async function createRefreshToken(user){
    return signAsync(
        {userId: user._id.toString()},
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: REFRESH_TOKEN_TIMEOUT})
}

async function sign(email, password){
    const user =  await User.findOne({email: email})
    const passwordIsValid = user?await bcrypt.compare(password, user?.password):false
    if (!passwordIsValid) throw new UnauthorizedError("Invalid email or password", {email: email, password: password})

    const accessToken = await createAccessToken(user.toJSON())
    const refreshToken = await createRefreshToken(user)
    
    const credentials = {accessToken: accessToken, refreshToken: refreshToken, user: user}

    return credentials
}

async function refresh(refreshToken){
    console.log("refresh", refreshToken)
    const denyToken = await redisClient.isInDenyListJWT(refreshToken)
    if (denyToken) throw new UnauthorizedError("Token is in deny list", {token: refreshToken})

    let userId = undefined
    try {
        const payload = await verifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET)            
        userId = payload.userId
    } catch (error) {
        throw new UnauthorizedError("Token is invalid", {token: refreshToken})  
    }
    const user =  await User.findById(userId)
    const accessToken = await signAsync({user: user.toJSON()}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: ACCESS_TOKEN_TIMEOUT });
    return accessToken
}

async function removeAccessToken(accessToken){
    if(accessToken){
        try {
            await verifyAsync(accessToken, process.env.ACCESS_TOKEN_SECRET)        
            await redisClient.pushDenyListJWT(accessToken)
        } catch (error) {console.log("Error! accessToken will not be added to deny list", accessToken)}
    }
}

async function removeRefreshToken(refreshToken){
    if(refreshToken){
        try {
            await verifyAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET,)        
            await redisClient.pushDenyListJWT(refreshToken)
        } catch (error) {console.log("Error! refreshToken will not be added to deny list", refreshToken)}
    }
}

async function signout(accessToken, refreshToken){
    removeAccessToken(accessToken)
    removeRefreshToken(refreshToken)
}

module.exports = {
    verify: verify,
    sign: sign,
    refresh: refresh,
    signout: signout,
    removeAccessToken: removeAccessToken,
    removeRefreshToken: removeRefreshToken,
    createAccessToken: createAccessToken
}