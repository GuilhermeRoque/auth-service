const express = require('express')
const authController = require('../auth/authController')
const router = express.Router()
const usersController = require('./usersController')

router.post('/', usersController.create)
router.use('*', authController.verifyAccessToken)
router.get('/:id', usersController.get)
router.put('/:id', usersController.update)
router.delete('/:id', usersController.delete)
module.exports = router;