const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const {applicationSchema} = require('../application/applicationModel')
const organizationMember = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        required: true,         
    },
    status: {
        type: String,
        required: true,
    }
},{ collection: 'organizationMembers' })

const organizationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    members: [organizationMember],
    applications: [applicationSchema]

}, { collection: 'organizations' })

module.exports = {
    OrganizationModel: mongoose.model("Organization", organizationSchema),
    OrganizationMemberModel: mongoose.model("organizationMembers", organizationMember),
}
