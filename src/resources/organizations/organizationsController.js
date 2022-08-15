const { HttpStatusCodes } = require("web-service-utils/enums")
const organizationService = require("./organizationsService")

module.exports = {
    create : (async (req, res, next) => {
        try {
            console.log("CREATE CRONTROLLER ORGANIZATION")
            const organization = req.body
            const caller = req.user
            const accessToken = req.accessToken
            const organizationCreated = await organizationService.create(organization, caller, accessToken)
            res.status(HttpStatusCodes.CREATED).send(organizationCreated)
        } catch (error) {
            next(error)
        }
    }),
    
    update: (async (req, res, next) => {
        try {
            const organization = req.body
            const caller = req.user
            const organizationId = req.params.id
            const organizationUpdated = await organizationService.update(organization, organizationId, caller)
            res.status(HttpStatusCodes.OK).send(organizationUpdated)
        } catch (error) {
            next(error)
        }
    }),
        
    get: (async (req, res, next) => {
        try {
            const caller = req.user
            const organizationId = req.params.id
            const organization = await organizationService.getById(organizationId, caller)
            res.status(HttpStatusCodes.OK).send(organization)
        } catch (error) {
            next(error)
        }
    }),
    
    getAll: (async (req, res, next) => {
        try {
            const caller = req.user
            const organization = await organizationService.getAll({}, caller)
            res.status(HttpStatusCodes.OK).send(organization)
        } catch (error) {
            next(error)
        }
    }),

    inviteMember: (async (req, res, next) => {
        try {
            console.log("INVITE MEMBER CONTROLLER")
            const invite = req.body
            const caller = req.user
            const id = req.params.id
            const newMember = await organizationService.inviteMember(id, invite, caller)
            res.status(HttpStatusCodes.CREATED).send(newMember)
        } catch (error) {
            next(error)            
        }
    }),

    updateMember: (async (req, res, next) => {
        try {
            const caller = req.user
            const id = req.params.id
            const memberId = req.params.memberId
            const member = req.body
            const memberUpdated = await organizationService.updateMember(id, memberId, member, caller)
            res.status(HttpStatusCodes.OK).send(memberUpdated)
        } catch (error) {
            next(error)            
        }
    }),

    removeUser: (async (req, res, next) => {
        try {
            const organizationId = req.params.id
            const caller = req.user
            const userId = req.params.userId
            const memberUpdated = await organizationService.removeUser(organizationId, userId, caller)
            res.status(HttpStatusCodes.OK).send(memberUpdated)
        } catch (error) {
            next(error)            
        }
    }),
}