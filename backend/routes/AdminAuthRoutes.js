const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/AdminAuthController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");
const multer = require("multer");
const {upload_prof} = require("../config/multer"); // Configure storage options if necessary

router.post("/register", upload_prof, adminAuthController.registerAdmin);
// router.post("/login", adminAuthController.loginAdmin);
// router.post("/google-login", adminAuthController.googleLogin);
// router.get("/info", authenticateToken, adminAuthController.getUserInformation);

module.exports = router;
