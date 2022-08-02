const mongoose = require('mongoose');
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    lastName: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        validate: [emailValidator.validate, "Expected email format"]
    },
    password: {
        type: String, 
        required:true
    },
    organizations: [{type: ObjectId, ref: "Organization"}]
    
}, { collection: 'users' })


userSchema.pre('save', async function() {
    if(this.isModified('password')){
        const hashPassword = await bcrypt.hash(this.password, Number(12))
        console.log("Generated hash for password", this.password, hashPassword)
        this.password = hashPassword    
    }
});

userSchema.pre('updateOne', async function() {
    this.options.runValidators = true;
});

module.exports = mongoose.model("User", userSchema)
