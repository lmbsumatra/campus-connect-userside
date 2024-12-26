const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/StudentAuthController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");
const StudentController = require("../controllers/student/StudentController")

const { upload } = require("../config/multer");

router.post("/register", upload, studentAuthController.registerStudent);
router.post("/login", studentAuthController.loginStudent);
router.post("/google-login", studentAuthController.googleLogin);
router.get(
  "/info/:id",
  StudentController.getStudentDataById
);
router.get(
  "/",
  studentAuthController.getAllStudents
);

router.post("/change-password", authenticateToken, studentAuthController.userChangePassword)

module.exports = router;
