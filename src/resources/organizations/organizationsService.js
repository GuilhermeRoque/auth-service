const {Organization, OrganizationMember} = require('./organizationsModel')
const { MemberRoleEnum, MemberStatusEnum } = require('web-service-utils/enums');
const ServiceBase = require('web-service-utils/serviceBase')
const {User, UserOrganization} = require('../users/usersModel')
const { ForbiddenError, RoleError, NotFoundError, FailedSanityCheckError } = require('web-service-utils/serviceErrors')
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

            // ADD new member to organization.members
            const newOrganization = new this.model(organization)

            const userPermission = {
                role: MemberRoleEnum.OWNER,
                status: MemberStatusEnum.ACTIVE
            }

            const member = new OrganizationMember({
                userId: userId,
                userEmail: caller.email,
                userName : caller.name,
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
            
            const newAccessToken = await authService.createAccessToken(user.toJSON())
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

    async getById(id, caller){
        const organization = await this._getById(id)
        this._checkRoleNeeded(organization, caller, MemberRoleEnum.USER)
        return organization
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
            userName: user.name,
            userEmail: user.email,
            role: invite.role,
            status: MemberStatusEnum.INVITED
        })
        organization.members.push(member)
        const userOrganization = new UserOrganization({
            organizationId: organization._id,
            organizationName: organization.name,
            role: invite.role,
            status: MemberStatusEnum.INVITED
        })
        user.userOrganizations.push(userOrganization)
        await organization.save()
        await user.save()
        return member
    }

    async updateMember(id, memberId, member, caller){
        const organization = await this._getById(id)
        const memberRegistered = this._getMemberById(organization, memberId, caller)
        const isMemberEqualCaller = memberRegistered.userId.toString() === caller._id
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
                throw new FailedSanityCheckError(('Only possible update invited to active member status'))
            }    
        }
        memberRegistered.status = member.status !== undefined?member.status:memberRegistered.status
        memberRegistered.role = member.role !== undefined?member.role:memberRegistered.role

        let newAccessToken = undefined
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

    _getMemberById(organization, id, caller){
        const memberIndex = this._findMemberIndexById(organization, id)
        if (memberIndex === -1) throw new MemberError(caller)
        return organization.members[memberIndex]
    }

}


module.exports = new ServiceOrganization()