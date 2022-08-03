const HttpStatusCodes = require("../utils/http")
const organizationService = require("./organizationsService")

module.exports = {
    create : (async (req, res, next) => {
        try {
            const organization = req.body
            const caller = req.user
            const organizationCreated = await organizationService.create(organization, caller)
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
            const organizationId = req.params.id
            const filter = {_id:organizationId}
            const organization = await organizationService.getOne(filter)
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
            const invite = req.body
            const caller = req.user
            const id = req.params.id
            const newMember = await organizationService.inviteMember(id, invite, caller)
            res.status(HttpStatusCodes.CREATED).send(newMember)
        } catch (error) {
            next(error)            
        }
    }),


    acceptInviteMember: (async (req, res, next) => {
        try {
            const caller = req.user
            const id = req.params.id
            const memberId = req.params.memberId
            const memberUpdated = await organizationService.acceptInviteMember(id, memberId, caller)
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
    
    handleErr: (async (error, req, res, next) =>{
        res.status(error.httpStatusCode).send({
            message: error.message, 
            value: error.value
        })
    })
}