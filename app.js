const logger = require('morgan');
const usersRouter = require("./users/usersController");
const express = require('express');

const app = express(); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);

module.exports = app