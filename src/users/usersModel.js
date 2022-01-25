const mongoose = require('mongoose');
const emailValidator = require('email-validator')

var userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    email: {
        type: String, 
        required:true,
        validate:emailValidator.validate
    },
    hashPassword: {
        type: String, 
        required:true
    },
}, { collection: 'users' }
);


module.exports = mongoose.model("User", userSchema)
