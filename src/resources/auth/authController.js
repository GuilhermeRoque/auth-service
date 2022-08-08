const HttpStatusCodes = require('../utils/http')
const authService = require('./authService')

const _getToken = (req) => {
    const authString = req.get('Authorization')
    const bearerType = "Bearer "
    if (authString && authString.startsWith(bearerType) && authString.length > bearerType.length){
        const token = authString.split(' ')[1]
        return token
    }
    return null
}

module.exports = {
    verifyAccessToken: (async (req, res, next) => {
        try {
            const accessToken = _getToken(req)
            const userToken = await authService.verify(accessToken)
            console.log("userToken", userToken)
            req.user = userToken.user
            req.accessToken = userToken.accessToken
            next()                
        } catch (error) {
            next(error)
        }
    }),
    login: (async (req, res, next) => {
        try {
            const email = req.body.email
            const password = req.body.password
            if ((!email) | (!password)) return res.status(400).send({message: "Email and password required"})
            const credentials = await authService.sign(email, password)
            const secure = process.env.PRODUCTION? true:null
            
            // Creates Secure Cookie with refresh token
            res.cookie(
                'jwt', 
                credentials.refreshToken, 
                { 
                    httpOnly: true, 
                    secure: secure, 
                    sameSite: 'none', 
                    maxAge: 24 * 60 * 60 * 1000 
                }
            );
    
            res.status(200).send({
                message: "Successfull authentication",
                user: credentials.user, 
                accessToken: credentials.accessToken
            })                             
    
        } catch (error) {
            next(error)            
        }
    }),
    
    refresh: (async (req, res, next) => {
        const cookies = req.cookies;
        const refreshToken = cookies?.jwt;
        if (!refreshToken) return res.status(HttpStatusCodes.UNAUTHORIZED).send({message: "Token missing"});
        try {
            const acessToken = await authService.refresh(refreshToken)
            return res.status(HttpStatusCodes.OK).send({accessToken: acessToken})
        } catch (error) {
            next(error)            
        }
    }),

    logout: (async (req, res, next) => {
        const cookies = req.cookies;
        const refreshToken = cookies?.jwt;
        const accessToken = _getToken(req)
        try {
            await authService.signout(accessToken, refreshToken)
            res.sendStatus(HttpStatusCodes.OK)
        } catch (error) {
           next(error) 
        }
    })
}
