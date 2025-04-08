const express = require("express");
const router = express.Router();
const Accessory = require("../controller/AccessoryController");
const { default: upload } = require("../config/db/upload");

router.get("/accessory", Accessory.getAccessories);
router.get("/accessory/:id", Accessory.getAccessory);
router.post("/accessory", upload.single("file"), Accessory.createAccessory);
router.put("/accessory/:id", upload.single("file"), Accessory.updateAccessory);
router.delete("/accessory/:id", Accessory.deleteAccessory);
module.exports = router;
