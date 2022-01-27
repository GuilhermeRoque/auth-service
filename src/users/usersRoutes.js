const express = require('express')
const router = express.Router()
const usersController = require('./usersController')

router.get('/', usersController.getAll);
router.post('/', usersController.create)
router.get('/:id', usersController.get)
router.put('/:id', usersController.update)
router.delete('/:id', usersController.delete)
router.post('/:id/login', usersController.login)
router.use(usersController.handleError)

module.exports = router;
