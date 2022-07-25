const jwt = require('../../auth/jwt')

module.exports = {
    login: (async (req, res, next) => {
        console.log("\nLogin CONTROLER\n", "BODY: \n", req.body, '\nMETHOD: ', req.method)
        try {
            let email = req.body.email
            let password = req.body.password
            if ((!email) | (!password)){
                res.status(400).send()
            }else{
                await jwt.sign(req, res, next)
            }
        } catch (error) {
            console.log(error)
            next(error)            
        }
    }),
    
    refresh: (async (req, res, next) => {
        console.log("\nREFRESH CONTROLER\n")
        try {
            await jwt.refresh(req, res, next)
        } catch (error) {
            console.log(error)
            next(error)            
        }
    }),

    logout: (async (req, res, next) => {
        console.log("LOGOUT TOKENS")
        try {
            await jwt.signout(req, res, next)
            res.sendStatus(200)
        } catch (error) {
           next(error) 
        }
    })
}
