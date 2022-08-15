const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { MemberRoleEnum, MemberStatusEnum } = require('web-service-utils/enums');

const organizationMember = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
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
    Organization: mongoose.model("Organization", organizationSchema),
    OrganizationMember: mongoose.model("OrganizationMember", organizationMember),
}
