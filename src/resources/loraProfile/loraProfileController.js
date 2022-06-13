const organization = require('../organizations/organizationsModel')
const Organization = organization.OrganizationModel
const loraProfile = require('./loraProfileModel')
const LoraProfile = loraProfile.loraProfileModel

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
                const loraProfile = new LoraProfile(req.body)
                organization.loraProfiles.push(loraProfile)
                await organization.save()
                res.status(201).send(loraProfile)   
            }
        } catch (error) {
            next(error)
        }
    }),

    
}