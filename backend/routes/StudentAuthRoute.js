const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/StudentAuthController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");
const StudentController = require("../controllers/student/StudentController");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");

const { upload } = require("../config/multer");

router.post(
  "/register",
  // checkUnavailableDate,
  upload,
  StudentController.registerStudent
);
router.post("/login", StudentController.loginStudent);
router.post("/google-login", studentAuthController.googleLogin);
router.get("/info/:id", StudentController.getStudentDataById);
router.get("/", studentAuthController.getAllStudents);
router.get("/verify-email/:token", StudentController.verifyStudent);
router.post(
  "/change-password",
  authenticateToken,
  studentAuthController.userChangePassword
);

module.exports = router;
