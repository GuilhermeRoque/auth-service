const express = require('express')
const router = express.Router({mergeParams:true})
const deviceRouter = require("../devices/deviceRoutes")
const applicationController = require('./applicationController')

router.post('/', applicationController.create)
router.use("/:idApplication/devices", deviceRouter)

module.exports = router;
