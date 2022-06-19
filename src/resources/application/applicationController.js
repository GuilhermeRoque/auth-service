const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const application = require('./applicationModel')
const Application = application.applicationModel
// const ApiKey = application.apiKeyModel
const ttnApi = require("../../integrations/ttn/ttnApi")

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
                // console.log("BODYYYYYYYYY\n\n", req.body, '\n\ns')
                const app = req.body
                // await ttnApi.addOrganization(organization)
                await ttnApi.addApplication(app)
                const application = new Application({
                    name: app.name,
                    appId: app.appId,
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