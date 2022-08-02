const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const MemberRoleEnum = {
    OWNER:0,
    ADMIN:1,
    USER:2,
    ALL_OPTIONS: [0,1,2]
}

const MemberStatusEnum = {
    ACTIVE:0,
    INVITED:1,
    ALL_OPTIONS: [0,1]
}

const organizationMember = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
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
    }
},{ collection: 'organizationMembers' })

const organizationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true,
        unique:true
    },
    description: {
        type: String, 
    },
    members: [organizationMember],
}, { collection: 'organizations' })

module.exports = {
    OrganizationModel: mongoose.model("Organization", organizationSchema),
    OrganizationMemberModel: mongoose.model("OrganizationMember", organizationMember),
    MemberRoleEnum: MemberRoleEnum,
    MemberStatusEnum: MemberStatusEnum
}
