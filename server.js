#!/usr/bin/env node
require('dotenv').config();

const mongoose = require("mongoose")
const express = require('express');
const logger = require('morgan');
const usersRouter = require("./users/usersController");
const app = express(); 


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', usersRouter);

mongoose.connection
.on('error', console.log)
.on('disconnected', connect)
.once('open', () => {
    const port = process.env.SERVER_PORT;
    app.listen(port, () => console.log(`App listening on port ${port}`));
});

// ENTRYPOINT
connect();
 
function connect() {
    return mongoose.connect(process.env.DB_URL, {
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        autoCreate: true,
        autoIndex: true
    })   
}