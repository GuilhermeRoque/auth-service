const redis = require('redis')
const jwt = require("jsonwebtoken")
const { createHash } = require('crypto')

const createTokenHash = (token) => {
    return createHash("sha256").update(token).digest('hex')
}
const redisClient = redis.createClient(
    {
        prefix: 'denylist:',
        url: process.env.REDIS_URL
    })

module.exports = {
    redisClient : redisClient,    
    
    pushDenyList : async (token) => {
        const expireAt = jwt.decode(token).exp
        const tokenHash = createTokenHash(token)
        await redisClient.set(tokenHash, '')
        await redisClient.expireAt(tokenHash, expireAt)
    },
    
    getDenyList :  async (token) => {
        const tokenHash = createTokenHash(token)
        const exists = await redisClient.exists(tokenHash)
        return exists === 1
    }
}



    