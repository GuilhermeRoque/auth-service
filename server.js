#!/usr/bin/env node
require('dotenv').config();

const mongoose = require("mongoose")
const app = require('./app'); 
const http = require('http');

const server = http.createServer(app);

mongoose.connection
.on('error', console.log)
.on('disconnected', connectDB)

function connectDB(){
    return mongoose.connect(process.env.DB_URL, {
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        autoCreate: true,
        autoIndex: true
    })
} 

const port = process.env.SERVER_PORT
connectDB().then(server.listen(port, () => console.log(`Server listening on port ${port}`)))

module.exports = server