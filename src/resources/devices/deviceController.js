const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const device = require('./deviceModel')
const Device = device.deviceModel
const ttnApi = require('../../integrations/ttnApi')

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
                    await ttnApi.addDevice(organization.apiKey, application.appId, device)
                    application.devices.push(device)
                    await organization.save()
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
    })
}