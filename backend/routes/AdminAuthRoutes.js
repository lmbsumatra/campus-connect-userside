const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/AdminAuthController");
const authenticateToken = require("../middlewares/AdminAuthMiddleware");
const StudentController = require("../controllers/student/StudentController")

const { upload_prof } = require("../config/multer"); // Configure storage options if necessary

router.post("/register", upload_prof, adminAuthController.registerAdmin);
router.post("/login", adminAuthController.loginAdmin);

router.post(
  "/change-password",
  authenticateToken,
  adminAuthController.adminChangePassword
);

router.get("/accounts", adminAuthController.getAllAdminAccounts);

// router.post("/google-login", adminAuthController.googleLogin);
// router.get(
//     "/info",
//     authenticateToken,
//     adminAuthController.getUserInformation
//   );

router.get("/unavailable-dates", adminAuthController.getUnavailableDates);
router.post("/unavailable-dates", adminAuthController.addUnavailableDate);
router.delete("/unavailable-dates/:date", adminAuthController.deleteUnavailableDate);

router.get("/end-semester-dates", adminAuthController.getEndSemesterDates);
router.post("/end-semester-dates", adminAuthController.addEndSemesterDate);
router.delete("/end-semester-dates/:date", adminAuthController.deleteEndSemesterDate);

router.get("/student/info/:id", StudentController.getStudentDataForAdmin);
router.put("/change-status", StudentController.changeStudentStatus );


module.exports = router;
