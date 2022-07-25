const express = require('express')
const router = express.Router()
const authController = require('./authController')

router.post("/login", authController.login)
router.post("/logout", authController.logout)
router.get("/refresh", authController.refresh)

module.exports = router;