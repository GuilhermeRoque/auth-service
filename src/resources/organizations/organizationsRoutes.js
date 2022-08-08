const express = require('express')
const authController = require('../auth/authController')
const router = express.Router()
const organizationsController = require('./organizationsController')

router.use(authController.verifyAccessToken)
router.post('/', organizationsController.create)
router.get('/:id', organizationsController.get)
router.get('/', organizationsController.getAll)
router.post('/:id/members', organizationsController.inviteMember)
router.put('/:id/members/:idMember', organizationsController.updateMember)
router.delete('/:id/members/:idMember', organizationsController.removeUser)

module.exports = router;
