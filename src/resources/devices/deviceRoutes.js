const express = require('express')
const router = express.Router({mergeParams:true})
const deviceController = require('./deviceController')

router.post('/', deviceController.create)
router.put('/:idDevice', deviceController.update)

module.exports = router;
