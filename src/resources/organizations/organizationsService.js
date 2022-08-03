const organization = require('./organizationsModel')
const Organization = organization.OrganizationModel
const OrganizationMember = organization.OrganizationMemberModel
const MemberStatusEnum = organization.MemberStatusEnum
const MemberRoleEnum = organization.MemberRoleEnum
const ServiceBase = require('../../service/serviceBase')
const User = require('../users/usersModel')
const { ForbiddenError, RoleError, NotFoundError } = require('../../service/serviceErrors')

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

    findMemberIndex(organization, userId){
        const index = organization.members.findIndex(member => {
            return member.userId.toString() === userId;
        });
        return index
    }
    findMemberIndexById(organization, id){
        const index = organization.members.findIndex(member => {
            return member._id.toString() === id;
        });
        return index
    }

    async create (organization, caller){
        try{
            const userId = caller._id

            // ADD new member to organization.members
            const newOrganization = new this.model(organization)
            const member = new OrganizationMember({
                userId: userId,
                role: MemberRoleEnum.OWNER,
                status: MemberStatusEnum.ACTIVE
            })
            newOrganization.members.push(member)            
            const organizationCreated = await newOrganization.save()

            // ADD organization to user.organizations
            const user = await User.findById(userId)
            user.organizations.push(organizationCreated._id)
            await user.save()

            // return organization created
            return organizationCreated

        }catch(error){
            throw (this.getServiceError(error))
        }
    }

    async deleteOne(filter, caller){
        const organization = await this.getOne(filter)
        // only owner can delete organization
        this.checkIsOwner(organization, caller) 
        const deleteReport = await this.model.deleteOne(filter) 
        return this.checkDeleteReport(filter, deleteReport)
    }

    checkIsOwner(organization, caller) {
        const userId = caller._id
        console.log("CHECKING IS MEMBER")
        console.log(organization)
        console.log(userId)
        const memberIndex = this.findMemberIndex(organization, userId)
        if (memberIndex === -1) throw new MemberError(caller)
        const member = organization.members[memberIndex]
        if (member.role !== MemberRoleEnum.OWNER) throw new RoleError(member, MemberRoleEnum.OWNER)
    }

    async update(organization, id, caller){
        const filter = {_id:id}
        const registeredOrganization = await this.getOne(filter)
        this.checkIsOwner(registeredOrganization, caller)
        for(const k of Object.keys(organization)){
            registeredOrganization[k] = organization[k]
        }
        try {
            return await registeredOrganization.save()
        } catch (error) {
            throw (getModelError(error))
        }        
    }

    async getAll(filter, caller){
        const user = await User.findById(caller._id)
        const userFilter = {...filter, '_id': { $in: user.organizations }}
        return await this.model.find(userFilter)
    }

    async inviteMember(id, invite, caller){
        const organizationFilter = {_id: id}
        const organization = await this.getOne(organizationFilter)     
        this.checkIsOwner(organization, caller)
        const userFilter =  {email: invite.email}
        const user =  await User.findOne(userFilter)
        if (!user) throw new NotFoundError(userFilter)
        const member = new OrganizationMember({
            userId: user._id,
            role: invite.role,
            status: MemberStatusEnum.INVITED
        })
        organization.members.push(member)
        user.organizations.push(organization._id)
        await organization.save()
        await user.save()
        return member
    }

    async acceptInviteMember(id, memberId, caller){
        const organizationFilter = {_id: id}
        const organization = await this.getOne(organizationFilter)     
        const userId = caller._id
        const memberIndex = this.findMemberIndexById(organization, memberId)
        const member =  organization.members[memberIndex]
        if ((!member) | (userId !== member?.userId)) throw new MemberError(caller)
        member.status = MemberStatusEnum.ACTIVE
        await organization.save()
        return member
    }

    async removeUser(id, userId, caller){
        const organizationFilter = {_id: userId}
        const organization = await this.getOne(organizationFilter)     
        // only owner can remove other members
        if(userId !== caller._id) this.checkIsOwner(organization, caller)
        const memberIndex = this.findMemberIndex(organization, userId)
        if (memberIndex === -1) throw new MemberError(caller)
        organization.members.splice(memberIndex, 1)
        await organization.save()
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
