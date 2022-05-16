const mongoose = require('mongoose');
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    lastName: {
        type: String, 
        // required:true
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
    organizations: [{type: ObjectId, ref: "Organization"}]
    
}, { collection: 'users' })

userSchema.pre('save', async function() {
    this.password = await bcrypt.hash(this.password, Number(12))
  });


module.exports = mongoose.model("User", userSchema)
