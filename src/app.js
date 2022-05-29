const logger = require('morgan');
const usersRouter = require("./resources/users/usersRoutes");
const organizationsRouter = require("./resources/organizations/organizationsRoutes");
const express = require('express');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./resources/doc/swagger_output.json')
swaggerFile.host = process.env.SWAGGER_HOST

const app = express(); 

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Expose-Headers", "*")
    next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);
app.use('/organizations', organizationsRouter);
// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app