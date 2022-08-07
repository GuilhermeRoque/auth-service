const {Organization, OrganizationMember} = require('./organizationsModel')
const {MemberRoleEnum} = require('../utils/enums')
const ServiceBase = require('../../service/serviceBase')
const {User, UserOrganization} = require('../users/usersModel')
const { ForbiddenError, RoleError, NotFoundError, FailedSanityCheckError } = require('../../service/serviceErrors')

class MemberError extends ForbiddenError{
    constructor(user){
        super(user, "Must be a member of the organization")
    }
}

class ServiceOrganization extends ServiceBase{
    constructor(){
        const model = Organization
        super(model)
    }

    async create (organization, caller){
        try{
            const userId = caller._id
            const userEmail = caller.email

            // ADD new member to organization.members
            const newOrganization = new this.model(organization)
            const member = new OrganizationMember({
                userId: userId,
                userEmail: userEmail,
                role: MemberRoleEnum.OWNER,
            })
            newOrganization.members.push(member)            
            const organizationCreated = await newOrganization.save()

            // ADD organization to user.userOrganizations
            const user = await User.findById(userId)
            user.userOrganizations.push(
                new UserOrganization({
                    organizationId:organizationCreated._id,
                    organizationName: organization.name,
                    role: MemberRoleEnum.OWNER
                }))
            await user.save()

            // return organization created
            return organizationCreated

        }catch(error){
            throw (this.getServiceError(error))
        }
    }

    async deleteById(id, caller){
        const organization = await this._getById(id)
        this._checkRoleNeeded(organization, caller, MemberRoleEnum.OWNER)
        return await this._deleteById(id)
    }

    async update(organization, id, caller){
        this._checkRoleNeeded(organization, caller, MemberRoleEnum.OWNER)
        return await this._update(organization, id)
    }

    async getAll(filter, caller){
        const user = await User.findById(caller._id)
        const organizationIds = user.userOrganizations.map((userOrganization)=>userOrganization.organizationId)
        const userFilter = {...filter, '_id': { $in:  organizationIds}}
        return await this.model.find(userFilter)
    }

    async inviteMember(id, invite, caller){
        const organization = await this._getById(id)
        this._checkRoleNeeded(organization, caller, MemberRoleEnum.OWNER)
        const userFilter =  {email: invite.email}
        const user =  await User.findOne(userFilter)
        if (!user) throw new NotFoundError(userFilter)
        const member = new OrganizationMember({
            userId: user._id,
            role: invite.role,
            status: MemberStatusEnum.INVITED
        })
        organization.members.push(member)
        user.userOrganizations.push(organization._id)
        await organization.save()
        await user.save()
        return member
    }

    async acceptInviteMember(id, caller){
        const organization = await this._getById(id)
        const member = this._getMember(organization, caller)
        if(member.status !== MemberStatusEnum.INVITED) throw new FailedSanityCheckError((`To accept an invite the member status must be ${MemberStatusEnum.INVITED}`))
        member.status = MemberStatusEnum.ACTIVE
        await organization.save()
        return member
    }

    async removeUser(id, userId, caller){
        const organization = await this._getById(id)
        // only owner can remove other members
        if(userId !== caller._id) this._checkRoleNeeded(organization, caller, MemberRoleEnum.OWNER)
        const memberIndex = this._findMemberIndex(organization, userId)
        if (memberIndex === -1) throw new MemberError(caller)
        organization.members.splice(memberIndex, 1)
        await organization.save()
    }


    async _getOrganization(id, caller, roleNeeded){
        const organization = await this._getById(id)
        this._checkRoleNeeded(organization, caller, roleNeeded) 

    }

    _checkRoleNeeded(organization, caller, roleNeeded) {
        const member = this._getMember(organization, caller)
        if (member.role > roleNeeded) throw new RoleError(member, roleNeeded)
    }

    _findMemberIndex(organization, userId){
        const index = organization.members.findIndex(member => {
            return member.userId.toString() === userId;
        });
        return index
    }
    _findMemberIndexById(organization, id){
        const index = organization.members.findIndex(member => {
            return member._id.toString() === id;
        });
        return index
    }

    _getMember(organization, caller){
        const userId = caller._id
        const memberIndex = this._findMemberIndex(organization, userId)
        if (memberIndex === -1) throw new MemberError(caller)
        return organization.members[memberIndex]

    }

}



module.exports = new ServiceOrganization()






// subDocuments: (async (req, res, next) => {
//     try {
//         const organization =  await Organization.findById(req.params.id)
//         if (organization){
//             const idUser = req.user._id
//             const index = organization.members.findIndex(member => {
//                 return member.user == idUser;
//             });
//             if (index > -1){
//                 const subDocument = req.params.subDocument
//                 const subDocuments = ["applications", "lora-profiles", "service-profiles"]
//                 if(subDocuments.includes(subDocument)){

//                     // proxy request here

//                 }else{
//                     res.status(404).send({message: "Resource unknown"})
//                 }
//                 organization.members.splice(index, 1)
//                 await organization.save()

//             }else{
//                 // user not belongs to organization
//                 res.status(403).send()
//             }             
//         }else{
//             res.status(404).send({message: "Organization not found"})
//         }   
//     } catch (error) {
//         next(error)            
//     }
// }),
