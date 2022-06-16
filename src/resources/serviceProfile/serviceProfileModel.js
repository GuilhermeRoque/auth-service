const mongoose = require('mongoose');

const serviceProfileSchema = new mongoose.Schema({
    serviceProfileId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String, 
        required:true
    },
    dataType: {
        type: String, 
        required:true
    },
    channelType: {
        type: String, 
        required:true
    },
    channelParam: {
        type: String, 
    },
    acquisition: {
        type: String,
        required: true
    }

}, { collection: 'serviceProfile' })

module.exports = {
    serviceProfileSchema: serviceProfileSchema,
    serviceProfileModel: mongoose.model("ServiceProfile", serviceProfileSchema)
}
