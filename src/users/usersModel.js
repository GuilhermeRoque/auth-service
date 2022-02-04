const mongoose = require('mongoose');
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    email: {
        type: String, 
        required:true,
        unique:true,
        validate:emailValidator.validate
    },
    password: {
        type: String, 
        required:true
    },
}, { collection: 'users' })

userSchema.pre('save', async function() {
    this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS))
  });


module.exports = mongoose.model("User", userSchema)
