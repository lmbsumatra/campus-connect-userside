const express = require('express');
const router = express.Router();
const studentAuthController = require('../controllers/StudentAuthController');
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.post('/register', studentAuthController.registerStudent);
router.post('/login', studentAuthController.loginStudent);
router.post('/google-login', studentAuthController.googleLogin);
router.get("/info", authenticateToken, studentAuthController.getUserInformation);



module.exports = router;
