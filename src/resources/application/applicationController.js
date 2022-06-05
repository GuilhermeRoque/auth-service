const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const application = require('./applicationModel')
const Application = application.applicationModel
// const ApiKey = application.apiKeyModel
const ttnApi = require("../../integrations/ttnApi")

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
                const respApp = await ttnApi.addApplication(organization.apiKey, req.body)
                const app = respApp.data
                const application = new Application({
                    name: app.name,
                    appId: app.ids.application_id,
                    description: app.description,
                    
                })                

                // const respAppKey = await ttnApi.addApiKey(organization, application)
                // const appKey = respAppKey.data
                
                // const apiKey = new ApiKey(
                //     {
                //         keyId: appKey.id,
                //         name: appKey.name,
                //         key: appKey.key,    
                //     }
                // )
                // application.apiKey = apiKey

                organization.applications.push(application)
                await organization.save()

                res.status(201).send(application)
            }
        } catch (error) {
            next(error)
        }
    })
}