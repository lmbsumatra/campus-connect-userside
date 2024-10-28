const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/AdminAuthController');
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.post('/register', adminAuthController.registerAdmin);
router.post('/login', adminAuthController.loginAdmin);
router.post('/google-login', adminAuthController.googleLogin);
router.get(
    "/info",
    authenticateToken,
    adminAuthController.getUserInformation
  );

module.exports = router;
