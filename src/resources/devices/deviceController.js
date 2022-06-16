const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const device = require('./deviceModel')
const Device = device.deviceModel
const ttnApi = require('../../integrations/ttn/ttnApi')
const crypto = require("crypto")

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
                        
                    // console.log('device', device)
                    const newDevice = new Device(device)
                    // console.log('newDevice', newDevice)
                    

                    let resp = await ttnApi.addDevice(organization.apiKey, application.appId, newDevice)
                    console.log("addDevice", resp.status, resp.data)
                    resp = await ttnApi.setDeviceJoinSettings(organization.apiKey, application.appId, device.devId, device)
                    console.log("setDeviceJoinSettings", resp.status, resp.data)
                    resp = await ttnApi.setDeviceNetworkSettings(organization.apiKey, application.appId, device.devId, device)
                    console.log("setDeviceNetworkSettings", resp.status, resp.data)
                    application.devices.push(newDevice)
                    await organization.save()
                    res.status(201).send(newDevice)      
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
            console.log("error.data", error.response.data.details, "\n\n")
            next("error")
        }
    }),

    // TODO: Serve it as static content
    // getNetworkOptions: (async (req, res, next) => {
    //     res.send({
    //         frequencyPlans: freqPlans,
    //         loraWanVersions: [
    //             {name: "Especificação v1.0", value: 1},
    //             {name: "Especificação v1.0.1", value: 2},
    //             {name: "Especificação v1.0.2", value: 3},
    //             {name: "Especificação v1.1", value: 4},
    //             {name: "Especificação v1.0.3", value: 5},
    //             {name: "Especificação v1.0.4", value: 6},
    //        ]
    //     })
    // })
}