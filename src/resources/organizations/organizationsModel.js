const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { applicationSchema } = require('../application/applicationModel')
const { loraProfileSchema } = require('../loraProfile/loraProfileModel')
const { serviceProfileSchema } = require('../serviceProfile/serviceProfileModel')

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
    organizationId: {
        type: String, 
        required:true,
        unique:true
    },
    name: {
        type: String, 
        required:true
    },
    apiKey: {
        type: String, 
    },
    members: [organizationMember],
    applications: [applicationSchema],
    loraProfiles: [loraProfileSchema],
    serviceProfiles: [serviceProfileSchema]

}, { collection: 'organizations' })

module.exports = {
    OrganizationModel: mongoose.model("Organization", organizationSchema),
    OrganizationMemberModel: mongoose.model("OrganizationMember", organizationMember),
}
