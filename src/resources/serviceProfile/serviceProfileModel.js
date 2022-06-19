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
        type: Number, 
        required:true
    },
    channelType: {
        type: Number, 
        required:true
    },
    channelParam: {
        type: Number,
    },
    acquisition: {
        type: Number,
        required: true
    },
    period: {
        type: Number,
        required: true
    }

}, { collection: 'serviceProfile' })

module.exports = {
    serviceProfileSchema: serviceProfileSchema,
    serviceProfileModel: mongoose.model("ServiceProfile", serviceProfileSchema)
}
