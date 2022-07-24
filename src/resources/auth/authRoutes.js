const express = require('express')
const router = express.Router()
const authController = require('./authController')

router.use("/login", authController.login)
router.use("/refresh", authController.refresh)

module.exports = router;