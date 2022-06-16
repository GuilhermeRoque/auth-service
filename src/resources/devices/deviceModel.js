const { Map, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { loraProfileSchema } = require('../loraProfile/loraProfileModel')

const deviceSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    devId: {
        type: String, 
        required:true
    },
    devEUI: {
        type: String, 
        required:true
    },
    joinEUI: {
        type: String, 
        required:true
    },
    appKey: {
        type: String, 
    },
    config: {
        type: Map, 
        of: {},
        required:true,
    },
    loraProfile: {
        type: loraProfileSchema,
        required: true
    }

}, { collection: 'device' })

module.exports = {
    deviceSchema: deviceSchema,
    deviceModel: mongoose.model("Device", deviceSchema)
}
