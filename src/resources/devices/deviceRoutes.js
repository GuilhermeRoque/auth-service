const express = require('express')
const router = express.Router({mergeParams:true})
const deviceController = require('./deviceController')

router.post('/', deviceController.create)

module.exports = router;
