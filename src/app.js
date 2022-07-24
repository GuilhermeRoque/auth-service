const logger = require('morgan');
const usersRouter = require("./resources/users/usersRoutes");
const authRouter = require("./resources/auth/authRoutes")
const organizationsRouter = require("./resources/organizations/organizationsRoutes");
const express = require('express');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./resources/doc/swagger_output.json')
const cookieParser = require('cookie-parser');

swaggerFile.host = process.env.SWAGGER_HOST

const app = express(); 

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "authorization, content-type");
    res.header("Access-Control-Expose-Headers", "authorization, content-type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Credentials", "true")
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.options("*", (async (req, res, next) => {res.status(200).send()}))


app.use('/users', usersRouter);
app.use("/auth", authRouter);
app.use('/organizations', organizationsRouter);

// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app