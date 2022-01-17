const logger = require('morgan');
const usersRouter = require("./users/usersRoutes");
const express = require('express');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./doc/swagger_output.json')

const app = express(); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerFile))

module.exports = app