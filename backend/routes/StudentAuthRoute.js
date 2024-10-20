const express = require('express');
const router = express.Router();
const studentAuthController = require('../controllers/StudentAuthController');

router.post('/register', studentAuthController.registerStudent);
router.post('/login', studentAuthController.loginStudent);
router.post('/google-login', studentAuthController.googleLogin);

module.exports = router;
