const organization = require('./organizationsModel')
const Organization = organization.OrganizationModel
const OrganizationMember = organization.OrganizationMemberModel
const MemberStatusEnum = organization.MemberStatusEnum
const MemberRoleEnum = organization.MemberRoleEnum

const User = require('../users/usersModel')


module.exports = {
    create : (async (req, res, next) => {
        try {
            // ADD new member to organization.members
            const organization = new Organization(req.body)
            const userId = req.user._id 
            const member = new OrganizationMember({
                userId: userId,
                role: MemberRoleEnum.OWNER,
                status: MemberStatusEnum.ACTIVE
            })
            organization.members.push(member)            
            const organizationCreated = await organization.save()

            // ADD organization to user.organizations
            const user = await User.findById(userId)
            user.organizations.push(organizationCreated._id)
            await user.save()

            res.status(201).send(organizationCreated)

            // const membersPopulated = [{
            //     name: user.name,
            //     email: user.email,
            //     ...member.toJSON()
            // }]

            // const orgResp = {
            //     ...organization.toJSON(),
            //     members: membersPopulated
            // }

            // res.status(201).send(orgResp)
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
    
    getAll: (async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id)
            const organizations = await Organization.find({ '_id': { $in: user.organizations } })
            res.send(organizations)
        } catch (error) {
            next(error)
        }
    }),

    inviteUser: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                const email = req.body.email
                const role = req.body.role
                const user =  await User.findOne({email: email})
                if (user){
                    const member = new OrganizationMember({
                        userId: user._id,
                        role: role,
                        status: MemberStatusEnum.INVITED
                    })
                    organization.members.push(member)
                    user.organizations.push(organization._id)
                    await organization.save()
                    await user.save()
                    res.status(201).send(organization)      
                }else{
                    res.status(404).send({message: "User not found", value:email})
                }                 
            }else{
                res.status(404).send({message: "Organization not found", value: req.params.id})
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
                    member.status = MemberStatusEnum.ACTIVE
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

    subDocuments: (async (req, res, next) => {
        try {
            const organization =  await Organization.findById(req.params.id)
            if (organization){
                const idUser = req.user._id
                const index = organization.members.findIndex(member => {
                    return member.user == idUser;
                });
                if (index > -1){
                    const subDocument = req.params.subDocument
                    const subDocuments = ["applications", "lora-profiles", "service-profiles"]
                    if(subDocuments.includes(subDocument)){

                        // proxy request here

                    }else{
                        res.status(404).send({message: "Resource unknown"})
                    }
                    organization.members.splice(index, 1)
                    await organization.save()

                }else{
                    // user not belongs to organization
                    res.status(403).send()
                }             
            }else{
                res.status(404).send({message: "Organization not found"})
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