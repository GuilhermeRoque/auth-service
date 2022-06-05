const mongoose = require('mongoose');
const {deviceSchema} = require("../devices/deviceModel")


// const apiKeySchema = new mongoose.Schema({
//     key: {
//         type: String, 
//         required:true
//     },
//     keyId: {
//         type: String, 
//         required:true
//     },
// }, {collection: 'apiKeys'})

const applicationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required:true
    },
    // apiKey: {
    //     type: apiKeySchema, 
    //     required:true,
    // },
    appId: {
        type: String, 
        required:true,
    },
    devices: {
        type: [deviceSchema]
    }

}, { collection: 'applications' })

module.exports = {
    applicationSchema: applicationSchema,
    applicationModel: mongoose.model("Application", applicationSchema),
    // apiKeySchema: apiKeySchema,
    // apiKeyModel: mongoose.model("ApiKey", apiKeySchema)
}
