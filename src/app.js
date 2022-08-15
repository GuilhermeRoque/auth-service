const express = require('express');
const logger = require('morgan');

// const swaggerUi = require('swagger-ui-express')
// const swaggerFile = require('./resources/doc/swagger_output.json')
// const cookieParser = require('cookie-parser');
// swaggerFile.host = process.env.SWAGGER_HOST

const { HttpStatusCodes } = require('web-service-utils/enums');
const { ServiceError } = require('web-service-utils/serviceErrors');
const usersRouter = require("./resources/users/usersRoutes");
const authRouter = require("./resources/auth/authRoutes")
const organizationsRouter = require("./resources/organizations/organizationsRoutes");


const app = express(); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((async(req, res, next)=>{
    req.user=req.headers.user?JSON.parse(req.headers.user):null
    req.user_refresh = req.headers.user_refresh
    console.log("USER REFRESH",req.user_refresh)
    next()
}))
app.use('/users', usersRouter);
app.use("/auth", authRouter);
app.use('/organizations', organizationsRouter);
app.use(async (error, req, res, next) =>{
    console.log("Handling error...")
    console.log(error)
    console.log(error.message)
    console.log(error.value)

    if (error instanceof ServiceError){
        res.status(error.httpStatusCode).send({
            message: error.message, 
            value: error.value
        })    
    }else{
        const message = 'Unexpected error'
        console.log(message)
        res.status(HttpStatusCodes.INTERNAL_SERVER).send({
            message: message, 
        })    
    }
})

// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app