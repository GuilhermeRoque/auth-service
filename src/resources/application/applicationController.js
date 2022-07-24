const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const application = require('./applicationModel')
const Application = application.applicationModel
const FormData = require('form-data');
const ttnApi = require("../../integrations/ttn/ttnApi")
const axios = require("axios")

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
                const app = req.body
                await ttnApi.addApplication(app)
                const application = new Application({
                    name: app.name,
                    appId: app.appId,
                    description: app.description,
                    
                })                
                organization.applications.push(application)
                const applicationNames = []
                for(const app of organization.applications){
                    applicationNames.push(app.name)
                }
                const _data = new FormData()
                _data.append("name", applicationNames)
                await axios.post(process.env.DEVICE_LISTENER, _data)
                await organization.save()
                res.status(201).send(application)
            }
        } catch (error) {
            next(error)
        }
    })
}