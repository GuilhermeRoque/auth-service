const express = require('express')
const router = express.Router()
const jwt = require('../auth/jwt')
const organizationsController = require('./organizationsController')

router.post('*', jwt.verify)
router.get('*', jwt.verify)
router.post('/', organizationsController.create)
router.get('/:id', organizationsController.get)
router.get('/', organizationsController.getAll)
router.post('/:id/users', organizationsController.inviteUser)
router.post('/:id/join', organizationsController.acceptInviteUser)
router.post('/:id/leave', organizationsController.removeUser)
router.use("/:idOrganization/:subDocument", organizationsController.subDocuments)


router.use(organizationsController.handleError)

module.exports = router;
