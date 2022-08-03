const express = require('express')
const router = express.Router()
const jwt = require('../auth/jwt')
const organizationsController = require('./organizationsController')

router.post('*', jwt.verify)
router.get('*', jwt.verify)
router.post('/', organizationsController.create)
router.get('/:id', organizationsController.get)
router.get('/', organizationsController.getAll)
router.post('/:id/members', organizationsController.inviteMember)
router.post('/:id/members/:idMember/join', organizationsController.acceptInviteMember)
router.delete('/:id/members/:idMember', organizationsController.removeUser)
router.use(organizationsController.handleErr)

module.exports = router;
