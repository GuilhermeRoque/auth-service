#!/usr/bin/env node
require('dotenv').config();

const mongoose = require("mongoose")
const app = require('./app'); 
const http = require('http');

const server = http.createServer(app);

mongoose.connect(process.env.DB_URL, {
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    autoCreate: true,
    autoIndex: true
})
.then(() => server.listen(process.env.SERVER_PORT, console.log("Server listening on port", process.env.SERVER_PORT)))
.catch(() => console.log("Error connecting to database"))

module.exports = server