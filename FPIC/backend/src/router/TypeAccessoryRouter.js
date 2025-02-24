const express = require('express')
const router = express.Router()
const typeAccessory = require("../controller/TypeAccessoryController")
const upload = require("../config/db/upload")
router.get("/get-types-accessory", typeAccessory.getTypesAccessory)
router.post("/types-accessory",upload.single("file"), typeAccessory.createTypeAccessory)
module.exports = router