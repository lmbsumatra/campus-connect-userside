const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/StudentAuthController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");
const StudentController = require("../controllers/student/StudentController");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");

const { upload, upload_prof } = require("../config/multer");
const {
  StudentPaymentController,
} = require("../controllers/student-payment/StudentPaymentController");

router.post(
  "/register",
  // checkUnavailableDate,
  upload,
  StudentController.registerStudent
);
router.post("/login", StudentController.loginStudent);
router.post("/verify-email/resend", StudentController.resendVerificationEmail);
router.post("/google-login", StudentController.googleLogin);
router.get(
  "/info/:id",
  authenticateToken,
  StudentController.getStudentDataById
);
router.get(
  "/other-user/info/:id",
  authenticateToken,
  StudentController.getOtherStudentDataById
);
router.get("/", studentAuthController.getAllStudents);
router.get("/verify-email/:token", StudentController.verifyStudent);
router.post(
  "/change-password",
  authenticateToken,
  studentAuthController.userChangePassword
);

router.post(
  "/update-verification-documents",
  authenticateToken,
  upload,
  StudentController.updateVerificationDocx
);

router.post(
  "/create-onboarding-link",
  StudentPaymentController.createStripeOnBoardingLink
);

router.get(
  "/merchant-details/:userId",
  StudentPaymentController.getMerchantDetails
);
router.post(
  "/info/:userId/upload-profile-image",
  upload_prof,
  StudentController.uploadProfileImage
);

router.get("/get", authenticateToken, StudentController.getUsers);
router.post("/forgot-password", StudentController.forgotPassword);
router.post("/reset-password", StudentController.resetPassword);

module.exports = router;
