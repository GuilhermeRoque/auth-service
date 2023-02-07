#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');

if(!process.env.ACCESS_TOKEN_SECRET){
    const ACCESS_TOKEN_SECRET  = fs.readFileSync(process.env.ACCESS_SECRET)
    process.env.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET
    console.log("Reading access token from file", process.env.ACCESS_SECRET, "and setting into env var ACCESS_TOKEN_SECRET")
}
if(!process.env.REFRESH_TOKEN_SECRET){
    process.env.REFRESH_TOKEN_SECRET  = fs.readFileSync(process.env.REFRESH_SECRET)
    console.log("Reading refresh token from file", process.env.REFRESH_SECRET, "and setting into env var REFRESH_TOKEN_SECRET")
}
console.log(process.env)

const mongoose = require("mongoose")
const app = require('./app'); 
const http = require('http');



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
    server.listen(process.env.SERVER_PORT, console.log("Server listening on port", process.env.SERVER_PORT))
})
.catch((err) => console.log("Error connecting to database:\n", err))

module.exports = server