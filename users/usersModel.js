const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    hashPassword: String
}, { collection: 'users' }
);


module.exports = mongoose.model("User", userSchema)
