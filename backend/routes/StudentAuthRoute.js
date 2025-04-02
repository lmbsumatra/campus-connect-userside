const express = require("express");
const router = express.Router();
const studentAuthController = require("../controllers/StudentAuthController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");
const checkRestrictions = require("../middlewares/CheckRestrictionMiddleware");
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
  checkRestrictions, // Add the restriction check middleware here
  StudentController.getStudentDataById
);
router.get(
  "/other-user/info/:id",
  authenticateToken,
  checkRestrictions, // Add it here too
  StudentController.getOtherStudentDataById
);
router.get("/", studentAuthController.getAllStudents);
router.get("/verify-email/:token", StudentController.verifyStudent);
router.post(
  "/change-password",
  authenticateToken,
  checkRestrictions, // Add it to all authenticated routes
  studentAuthController.userChangePassword
);

router.post(
  "/update-verification-documents",
  authenticateToken,
  checkRestrictions,
  upload,
  StudentController.updateVerificationDocx
);
router.put(
  "/update-profile",
  authenticateToken,
  checkRestrictions,
  StudentController.updateProfile
);

router.post(
  "/create-onboarding-link",
  checkRestrictions,
  StudentPaymentController.createStripeOnBoardingLink
);

router.get(
  "/merchant-details/:userId",
  checkRestrictions,
  StudentPaymentController.getMerchantDetails
);
router.post(
  "/info/:userId/upload-profile-image",
  upload_prof,
  checkRestrictions,
  StudentController.uploadProfileImage
);

router.get(
  "/get",
  authenticateToken,
  checkRestrictions,
  StudentController.getUsers
);
router.post("/forgot-password", StudentController.forgotPassword);
router.post("/reset-password", StudentController.resetPassword);

module.exports = router;
