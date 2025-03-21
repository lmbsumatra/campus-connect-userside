const express = require("express");
const router = express.Router();
const SystemConfigController = require("../controllers/system-config/SystemConfigController"); 

router.get("/", SystemConfigController.getSystemConfig); 
router.put("/:config", SystemConfigController.updateSystemConfig);

module.exports = router;
