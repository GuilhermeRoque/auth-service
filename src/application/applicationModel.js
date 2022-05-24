const mongoose = require('mongoose');
const {deviceSchema} = require("../devices/deviceModel")
const applicationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    key: {
        type: String, 
        required:true,
    },
    devices: {
        type: [deviceSchema]
    }

}, { collection: 'application' })

module.exports = {
    applicationSchema: applicationSchema,
    applicationModel: mongoose.model("Application", applicationSchema)
}
