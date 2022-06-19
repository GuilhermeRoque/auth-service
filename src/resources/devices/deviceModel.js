const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

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
        required:true,
        unique: true
    },
    joinEUI: {
        type: String, 
        required:true       
    },
    appKey: {
        type: String, 
    },
    loraProfile: {
        type: String,
        required: true,
    },
    loraProfileId: {
        type: ObjectId,
        required: true,
        ref: 'LoraProfile'
    },
    serviceProfileId: {
        type: ObjectId,
        required: true,
        ref: 'ServiceProfile'
    },
    serviceProfile: {
        type: String,
        required:true,
    }
}, { collection: 'device' })

module.exports = {
    deviceSchema: deviceSchema,
    deviceModel: mongoose.model("Device", deviceSchema)
}
