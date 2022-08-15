const jwt = require('jsonwebtoken');
const {User} = require('../users/usersModel')
const bcrypt = require('bcrypt')
const {promisify} = require('util');
const { UnauthorizedError } = require('web-service-utils/serviceErrors');
const signAsync = promisify(jwt.sign)

const ACCESS_TOKEN_TIMEOUT = process.env.ACCESS_TOKEN_TIMEOUT
const REFRESH_TOKEN_TIMEOUT = process.env.REFRESH_TOKEN_TIMEOUT

async function createAccessToken(user){
    return signAsync(
        {user: user},
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: '30s'})
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

async function refresh(userId){
    const user =  await User.findById(userId)
    const accessToken = await signAsync({user: user.toJSON()}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: ACCESS_TOKEN_TIMEOUT });
    return accessToken
}



module.exports = {
    sign: sign,
    refresh: refresh,
    createAccessToken: createAccessToken
}