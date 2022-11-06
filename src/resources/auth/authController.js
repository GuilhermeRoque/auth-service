const { HttpStatusCodes } = require('web-service-utils/enums')
const authService = require('./authService')
module.exports = {
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
        if (!req.user_refresh) return res.status(HttpStatusCodes.UNAUTHORIZED).send({message: "Token missing"});
        try {
            const credentials = await authService.refresh(req.user_refresh)
            return res.status(HttpStatusCodes.OK).send({
                message: "Successfull authentication",
                user: credentials.user, 
                accessToken: credentials.accessToken
            })
        } catch (error) {
            next(error)            
        }
    }),
}
