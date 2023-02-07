const jwt = require('jsonwebtoken');
const {User} = require('../users/usersModel')
const bcrypt = require('bcrypt')
const {promisify} = require('util');
const { UnauthorizedError, NotFoundError } = require('web-service-utils/serviceErrors');
const signAsync = promisify(jwt.sign)

const ACCESS_TOKEN_TIMEOUT = process.env.ACCESS_TIMEOUT
const REFRESH_TOKEN_TIMEOUT = process.env.REFRESH_TIMEOUT
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

async function createAccessToken(user){
    return signAsync(
        {user: user},
        ACCESS_TOKEN_SECRET, 
        {expiresIn: ACCESS_TOKEN_TIMEOUT})
}

async function createRefreshToken(user){
    return signAsync(
        {userId: user._id.toString()},
        REFRESH_TOKEN_SECRET, 
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
    if(!user) throw new NotFoundError({_id: userId})
    const accessToken = await signAsync({user: user.toJSON()}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TIMEOUT, algorithm: "RS256"});
    return {user: user, accessToken: accessToken}
}



module.exports = {
    sign: sign,
    refresh: refresh,
    createAccessToken: createAccessToken
}