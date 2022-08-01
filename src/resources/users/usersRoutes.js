const express = require('express')
const router = express.Router()
const jwt = require("../auth/jwt")
const usersController = require('./usersController')

router.post('/', usersController.create)
router.use('*', jwt.verify)
router.get('/:id', usersController.get)
router.put('/:id', usersController.update)
// router.delete('/:id', usersController.delete)
module.exports = router;