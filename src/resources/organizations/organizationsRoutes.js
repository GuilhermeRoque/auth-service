const express = require('express')
const router = express.Router()
const jwt = require('../../auth/jwt')
const organizationsController = require('./organizationsController')
const applicationRouter = require("../application/applicationRoutes")
const loraProfileRouter = require("../loraProfile/loraProfileRoutes")
const serviceProfileRouter = require("../serviceProfile/serviceProfileRoutes")

router.post('*', jwt.verify)
router.get('*', jwt.verify)
router.post('/', organizationsController.create)
router.get('/:id', organizationsController.get)
router.get('/', organizationsController.getAll)
router.post('/:id/users', organizationsController.inviteUser)
router.post('/:id/join', organizationsController.acceptInviteUser)
router.post('/:id/leave', organizationsController.removeUser)

router.use("/:idOrganization/applications", applicationRouter)
router.use("/:idOrganization/lora-profiles", loraProfileRouter)
router.use("/:idOrganization/service-profiles", serviceProfileRouter)


router.use(organizationsController.handleError)

module.exports = router;
