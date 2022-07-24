const crypto = require("crypto")
const loraProfile = require("../loraProfile/loraProfileModel")
const serviceProfile = require("../serviceProfile/serviceProfileModel") 
const organization = require('../organizations/organizationsModel')
const device = require('./deviceModel')
const ttnApi = require('../../integrations/ttn/ttnApi')
const Organization = organization.OrganizationModel
const Device = device.deviceModel
// const LoraProfile = loraProfile.loraProfileModel
// const ServiceProfile = serviceProfile.serviceProfileModel

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

const configureLora = async (appId, device) => {
    resp = await ttnApi.setDeviceJoinSettings(appId, device.devId, device)
    console.log("setDeviceJoinSettings", resp.status, resp.data)
    resp = await ttnApi.setDeviceNetworkSettings(appId, device)
    console.log("setDeviceNetworkSettings", resp.status, resp.data)                
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
                        await configureLora(application.appId, device)
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

    update : (async (req, res, next) => {
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
                const index = organization.applications.findIndex(application => {return application._id == idApplication;});
                if (index > -1){
                    const application =  organization.applications[index]
                    const device = {...req.body}
                    const _device_index = application.devices.findIndex(dev=>{return dev._id.toString()===req.params.idDevice})
                    const _device = application.devices[_device_index]
                    console.log("ID ", req.params.idDevice)
                    console.log("DEVICES", application.devices)
                    console.log("DEVICE POST", device)
                    console.log("DEVICE INDEX", _device_index)
                    console.log("FOUND DEVICE", _device)

                    
                    const devie_to_add = {
                        loraProfileId: device.loraProfile._id,
                        serviceProfileId: device.serviceProfile._id,
                        loraProfile: device.loraProfile.loraProfileId,
                        serviceProfile: device.serviceProfile.serviceProfileId,
                        appKey: _device.appKey,
                        joinEUI: _device.joinEUI,
                        devEUI: _device.devEUI,
                        _id: _device._id,
                        name: _device.name,
                        devId: _device.devId
                        
                    }                        
                    application.devices.splice(_device_index, 1)
                    application.devices.push(devie_to_add)
                    console.log("ADDING DEVICE", devie_to_add)

                    await organization.save()
                    
                    let respStatus = 201
                    try {                        
                        await configureLora(application.appId, device)
                    } catch (error) {
                        console.log(error)
                        respStatus = 202
                    }

                    res.status(respStatus).send(devie_to_add)      

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