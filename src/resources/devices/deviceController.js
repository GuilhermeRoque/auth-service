const crypto = require("crypto")
const loraProfile = require("../loraProfile/loraProfileModel")
const serviceProfile = require("../serviceProfile/serviceProfileModel") 
const organization = require('../organizations/organizationsModel')
const device = require('./deviceModel')
const ttnApi = require('../../integrations/ttn/ttnApi')
const Organization = organization.OrganizationModel
const Device = device.deviceModel
const LoraProfile = loraProfile.loraProfileModel
const ServiceProfile = serviceProfile.serviceProfileModel

// const yaml = require("js-yaml")
// const fs = require('fs')
// const freqPlans = yaml.load(fs.readFileSync('../../integrations/ttn/ttnFreqPlans.yml', 'utf8'))

const get_random_local_eui64 = () => {
    // random 64 bits
    const buffer = crypto.randomBytes(8)
    // set to local
    buffer[0] |= (1 << 1)
    buffer[0] &= ~(1 << 0)
    return buffer.toString('hex')
}

const get_random_appkey = () => {
    const buffer = crypto.randomBytes(16)
    return buffer.toString('hex')
}

module.exports = {
    create : (async (req, res, next) => {
        try {
            const idOrganization = req.params.idOrganization
            const organization = await Organization.findById(idOrganization)    
            // TODO: add user member filter
            if (!organization){
                res.status(404).send(
                    {
                        "message": "Organização não encontrada",
                        "value": idOrganization
                    }
                )
            }else{
                const idApplication = req.params.idApplication
                const index = organization.applications.findIndex(application => {
                    return application._id == idApplication;
                });
                if (index > -1){
                    const application =  organization.applications[index]
                    const device = {...req.body}

                    // TODO: Move this to Model or Front-End?
                    device.devEUI = device.devEUI?device.devEUI: get_random_local_eui64()
                    device.joinEUI = device.joinEUI?device.joinEUI: "0000000000000000"
                    device.appKey = device.appKey?device.appKey: get_random_appkey()
                    
                    const devie_to_add = {...device}                        
                    devie_to_add.loraProfileId = devie_to_add.loraProfile._id
                    devie_to_add.serviceProfileId = devie_to_add.serviceProfile._id
                    devie_to_add.loraProfile = devie_to_add.loraProfile.loraProfileId
                    devie_to_add.serviceProfile = devie_to_add.serviceProfile.serviceProfileId
                    const newDevice = new Device(devie_to_add)
                    application.devices.push(newDevice)
                    await organization.save()
                    
                    let respStatus = 201
                    try {                        
                        let resp = await ttnApi.addDevice(application.appId, device)
                        console.log("addDevice", resp.status, resp.data)
                        resp = await ttnApi.setDeviceJoinSettings(application.appId, device.devId, device)
                        console.log("setDeviceJoinSettings", resp.status, resp.data)
                        resp = await ttnApi.setDeviceNetworkSettings(application.appId, device)
                        console.log("setDeviceNetworkSettings", resp.status, resp.data)    
                    } catch (error) {
                        console.log(error)
                        respStatus = 202
                    }

                    res.status(respStatus).send(newDevice)      

                }else{
                    res.status(404).send(
                        {
                            "message": "Aplicação não encontrada",
                            "value": {
                                'organization': idOrganization,
                                'application': idApplication
                            }
                        }    
                    )
                }             

            }
        } catch (error) {
            // console.log("error.data", error.response.data.details, "\n\n")   
            console.log(error)         
            next("error")
        }
    }),
}