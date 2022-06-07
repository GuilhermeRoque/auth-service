const express = require('express')
const router = express.Router({mergeParams:true})
const deviceController = require('./deviceController')

router.post('/', deviceController.create)
// router.get('/network-options', deviceController.getNetworkOptions)

module.exports = router;
