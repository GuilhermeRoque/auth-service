const mongoose = require('mongoose');
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { MemberRoleEnum, MemberStatusEnum } = require('web-service-utils/enums');

const userOrganizationSchema = new mongoose.Schema({
    organizationId: {
        type: ObjectId,
        ref: 'Organization',
        required: true,
    },
    organizationName: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: Number,
        required: true, 
        enum: MemberRoleEnum.ALL_OPTIONS        
    },
    status: {
        type: Number,
        required: true, 
        enum: MemberStatusEnum.ALL_OPTIONS        
    },
},{ collection: 'userOrganization' })


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
    userOrganizations: [userOrganizationSchema]
    
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

module.exports = {
    User: mongoose.model("User", userSchema),
    UserOrganization: mongoose.model('UserOrganization', userOrganizationSchema)
}
