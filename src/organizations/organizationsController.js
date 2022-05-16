const organization = require('./organizationsModel')
const Organization = organization.OrganizationModel
const OrganizationMember = organization.OrganizationMemberModel
const User = require('../users/usersModel')

module.exports = {
    create : (async (req, res, next) => {
        try {
            const organization = new Organization(req.body)
            console.log(req.user)
            const idUser = req.user._id
            const member = new OrganizationMember({
                user: idUser,
                role: 'owner',
                status: 'active'
            })
            organization.members.push(member)            
            const organizationCreated = await organization.save()
            const user = await User.findById(idUser)
            user.organizations.push(organizationCreated._id)
            await user.save()
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
            if (req.params.id){
                const organization =  await Organization.findById(req.params.id)
                if (organization){
                    res.send(organization)    
                }else{
                    res.status(404).send()
                }   
            }else{
                const organizations = await Organization.find({_id:req.user.organizations})
                if (organizations){
                    res.send(organizations)
                }else{
                    res.status(404).send()
                }
            }
        } catch (error) {
            next(error)
        }
    }),
    
    getAll: (async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id)
            const organizations = await Organization.find({ '_id': { $in: user.organizations } })
            if (organizations){
                console.log(organizations)
                res.send(organizations)
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
                    user.organizations.push(organization._id)
                    await organization.save()
                    await user.save()
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
                const idUser = req.user._id
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
                const idUser = req.user._id
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
        }else if(err.name == "TokenExpiredError"){
            res.status(403).send({error:err.message})
        }else{
            res.status(500).send()
        }
    })
}