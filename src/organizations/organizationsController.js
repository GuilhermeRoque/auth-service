const organization = require('./organizationsModel')
const Organization = organization.OrganizationModel
const OrganizationMember = organization.OrganizationMemberModel
const User = require('../users/usersModel')

module.exports = {
    create : (async (req, res, next) => {
        try {
            const organization = new Organization(req.body)
            const member = new OrganizationMember({
                user: req.idUser,
                role: 'owner',
                status: 'active'
            })
            organization.members.push(member)            
            const organizationCreated = await organization.save()
            res.status(201).send(organizationCreated)                    
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        try {
            const id =  req.params.id
            const organization = await Organization.findById(id)
            if(organization){
                organization.name = req.body.name
                await organization.save()
                res.status(204).send()                    
            }else{
                res.status(404).send()
            }
        } catch (error) {
            next(error)
        }
    }),
        
    get: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                res.send(organization)    
            }else{
                res.status(404).send()
            }   
        } catch (error) {
            next(error)            
        }
    }),
    
    inviteUser: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                const email = req.body.email
                const user =  await User.findOne({email:email})
                if (user){
                    const member = new OrganizationMember({
                        user: user._id,
                        role: req.body.role,
                        status: 'invited'
                    })
                    organization.members.push(member)
                    await organization.save()
                    res.status(204).send()      
                }else{
                    res.status(404).send()
                }             
            }else{
                res.status(404).send()
            }   
        } catch (error) {
            next(error)            
        }
    }),


    acceptInviteUser: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                const idUser = req.idUser
                const index = organization.members.findIndex(member => {
                    return member.user == idUser;
                });
                if (index > -1){
                    const member =  organization.members[index]
                    member.status = "active"
                    await organization.save()
                    res.status(204).send()      
                }else{
                    res.status(404).send()
                }             
            }else{
                res.status(404).send()
            }   
        } catch (error) {
            next(error)            
        }
    }),

    removeUser: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                const idUser = req.idUser
                const index = organization.members.findIndex(member => {
                    return member.user == idUser;
                });
                if (index > -1){
                    organization.members.splice(index, 1)
                    await organization.save()
                    res.status(204).send()      
                }else{
                    res.status(404).send()
                }             
            }else{
                res.status(404).send()
            }   
        } catch (error) {
            next(error)            
        }
    }),

    handleError:(async (err, req, res, next) => {
        console.log("ERROR:\n", err)
        if (err.name == "ValidationError"){
            res.status(400).send({error:err.message})
        }else{
            res.status(500).send()
        }
    })
}