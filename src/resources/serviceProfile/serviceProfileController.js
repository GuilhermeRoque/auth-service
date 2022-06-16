const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const serviceProfile = require('./serviceProfileModel')
const ServiceProfile = serviceProfile.serviceProfileModel

module.exports = {
    create : (async (req, res, next) => {
        try {
            const idOrganization = req.params.idOrganization
            const organization = await Organization.findById(idOrganization)    
            if (!organization){
                res.status(404).send(
                    {
                        "message": "Organização não encontrada",
                        "value": idOrganization
                    }
                )
            }else{
                const serviceProfile = new ServiceProfile(req.body)
                organization.serviceProfiles.push(serviceProfile)
                await organization.save()
                res.status(201).send(serviceProfile)   
            }
        } catch (error) {
            next(error)
        }
    }),   
}