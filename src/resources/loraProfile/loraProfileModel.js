const mongoose = require('mongoose');

const loraProfileSchema = new mongoose.Schema({
    loraProfileId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String, 
        required:true
    },
    freqPlanId: {
        type: String, 
        required:true
    },
    macVersion: {
        type: Number, 
        required:true
    },
    phyVersion: {
        type: Number, 
        required:true
    },
    isClassB: {
        type: Boolean,
        required: true
    },
    isClassC: {
        type: Boolean,
        required: true
    },
    isOTAA: {
        type: Boolean,
        required: true
    }

}, { collection: 'loraProfile' })

module.exports = {
    loraProfileSchema: loraProfileSchema,
    loraProfileModel: mongoose.model("LoraProfile", loraProfileSchema)
}
