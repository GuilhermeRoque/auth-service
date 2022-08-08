#!/usr/bin/env node
require('dotenv').config();

const mongoose = require("mongoose")
const app = require('./app'); 
const http = require('http');
const {redisClient} = require("./resources/auth/redisClient")

const server = http.createServer(app);

console.log("Connecting to DB...\n")
console.log("  process.env.DB_URL",process.env.DB_URL)
console.log("  process.env.DB_USERNAME",process.env.DB_USERNAME)
console.log("  process.env.DB_PASSWORD",process.env.DB_PASSWORD)
console.log("  process.env.DB_NAME",process.env.DB_NAME)

mongoose.connect(process.env.DB_URL, {
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    autoCreate: true,
    autoIndex: true
})
.then(() => {
    redisClient.connect()
    server.listen(process.env.SERVER_PORT, console.log("Server listening on port", process.env.SERVER_PORT))
})
.catch((err) => console.log("Error connecting to database:\n", err))

module.exports = server