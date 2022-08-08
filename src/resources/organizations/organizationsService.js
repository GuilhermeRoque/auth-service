const {Organization, OrganizationMember} = require('./organizationsModel')
const {MemberRoleEnum, MemberStatusEnum} = require('../utils/enums')
const ServiceBase = require('../../service/serviceBase')
const {User, UserOrganization} = require('../users/usersModel')
const { ForbiddenError, RoleError, NotFoundError, FailedSanityCheckError } = require('../../service/serviceErrors')
const redisClient = require('../auth/redisClient')
const authService = require('../auth/authService')

class MemberError extends ForbiddenError{
    constructor(user){
        super(user, "Must be a member of the organization")
    }
}

class MemberStatusError extends ForbiddenError{
    constructor(user, status){
        super(user, `Must have status ${status} to do this operation`)
    }
}

class ServiceOrganization extends ServiceBase{
    constructor(){
        const model = Organization
        super(model)
    }

    async create (organization, caller, accessToken){
        try{
            const userId = caller._id
            const userEmail = caller.email

            // ADD new member to organization.members
            const newOrganization = new this.model(organization)

            const userPermission = {
                role: MemberRoleEnum.OWNER,
                status: MemberStatusEnum.ACTIVE
            }

            const member = new OrganizationMember({
                userId: userId,
                userEmail: userEmail,
                ...userPermission
            })
            newOrganization.members.push(member)            
            const organizationCreated = await newOrganization.save()

            // ADD organization to user.userOrganizations
            const user = await User.findById(userId)
            user.userOrganizations.push(
                new UserOrganization({
                    organizationId:organizationCreated._id,
                    organizationName: organization.name,
                    ...userPermission
                }))
            await user.save()
            
            // user has new organization role: deny current accessToken 
            await authService.removeAccessToken(accessToken)
            const newAccessToken = await authService.createAccessToken(user.toJSON())

            // return organization created
            return {organization: organizationCreated, accessToken: newAccessToken}

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

    async updateMember(id, memberId, member, caller, accessToken){
        const organization = await this._getById(id)
        const memberRegistered = this._getMemberById(organization, memberId)
        const isMemberEqualCaller = memberRegistered.userId === caller._id
        const isMemberOwner =  memberRegistered.role === MemberRoleEnum.OWNER

        if(!isMemberEqualCaller) {
            // if the other member is OWNER deny update
            if(isMemberOwner) throw new ForbiddenError(memberRegistered, "Owner member can only be uptated by himself")
            // only owner can update other members
            this._checkRoleNeeded(organization, caller, MemberRoleEnum.OWNER)
        }else if (member.role){
            // if the user is updating himself, the role privilege can only decrease
            this._checkRoleNeeded(organization, caller, member.role)
        }
        // There is actually only INVITED and ACTIVE status, check it
        if(member.status){
            if((memberRegistered.status !== MemberStatusEnum.INVITED) | (member.status !== MemberStatusEnum.ACTIVE)) {
                throw new FailedSanityCheckError((
                    `Only possible update invited to active member status. 
                    To accept an invite the member status must be ${MemberStatusEnum.INVITED}`))
            }    
        }
        memberRegistered.status = member.status?member.status:memberRegistered.status
        memberRegistered.role = member.role?member.role:memberRegistered.role

        let newAccessToken = undefined
        if(isMemberEqualCaller) {
            await authService.removeAccessToken(accessToken)
            newAccessToken = await authService.createAccessToken(caller)
        } 
        else redisClient.pushDenyListUserId(member.userId)

        await organization.save()

        return {member: memberRegistered, accessToken: newAccessToken}
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
        if (member.status !== MemberStatusEnum.ACTIVE) throw new MemberStatusError(member, MemberStatusEnum.ACTIVE)
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

    _getMemberById(organization, id){
        const memberIndex = this._findMemberIndexById(organization, id)
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
