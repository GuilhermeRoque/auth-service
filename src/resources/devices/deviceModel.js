const { Map } = require('mongodb');
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
    config: {
        type: Map, 
        of: {},
        required:true,
    },

}, { collection: 'device' })

module.exports = {
    deviceSchema: deviceSchema,
    deviceModel: mongoose.model("Device", deviceSchema)
}
