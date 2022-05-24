const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const application = require('./applicationModel')
const Application = application.applicationModel

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
                const application = new Application(req.body)
                organization.applications.push(application)
                await organization.save()
                res.status(201).send(application)
            }
        } catch (error) {
            next(error)
        }
    })
}