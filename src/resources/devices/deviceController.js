const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const device = require('./deviceModel')
const Device = device.deviceModel
const ttnApi = require('../../integrations/ttn/ttnApi')
// const yaml = require("js-yaml")
// const fs = require('fs')
// const freqPlans = yaml.load(fs.readFileSync('../../integrations/ttn/ttnFreqPlans.yml', 'utf8'))

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
                    const device = new Device(req.body)
                    // await ttnApi.addDevice(organization.apiKey, application.appId, device)
                    await ttnApi.setDeviceNetworkSettings(organization.apiKey, application.appId, device.devId, req.body.config)
                    // application.devices.push(device)
                    // await organization.save()
                    res.status(201).send(device)      
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
            next(error)
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