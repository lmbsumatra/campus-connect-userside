const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authenticateRefreshToken,
} = require("../middlewares/AdminAuthMiddleware");
const StudentController = require("../controllers/student/StudentController");
const AdminController = require("../controllers/admin/AdminController");
const logAdminActivity = require("../middlewares/auditMiddleware");
const { upload_prof } = require("../config/multer"); // Configure storage options if necessary

// Making admins account.
router.post(
  "/register",
  upload_prof,
  authenticateToken,
  logAdminActivity,
  AdminController.registerAdmin
);

// Login in the admin side.
router.post("/login", AdminController.loginAdmin);

// Changing password of the admin.
router.post(
  "/change-password",
  authenticateToken,
  logAdminActivity,
  AdminController.adminChangePassword
);

// Get all the superadmin and admin account to display.
router.get("/accounts", AdminController.getAllAdminAccounts);

// Getting, adding, deleting unavailable dates.
router.get("/all-unavailable-dates", AdminController.allUnavailableDates);
router.get("/unavailable-dates", AdminController.getAllUnavailableDate);
router.post(
  "/unavailable-dates",
  authenticateToken,
  logAdminActivity,
  AdminController.addUnavailableDate
);
router.delete(
  "/unavailable-dates/:date",
  authenticateToken,
  logAdminActivity,
  AdminController.deleteUnavailableDate
);

// Getting, adding, deleting end semester dates.
router.get("/end-semester-dates", AdminController.getAllEndSemesterDate);
router.post(
  "/end-semester-dates",
  authenticateToken,
  logAdminActivity,
  AdminController.addEndSemesterDate
);
router.delete(
  "/end-semester-dates/:date",
  authenticateToken,
  logAdminActivity,
  AdminController.deleteEndSemesterDate
);

// Getting the info and changing status of the student.
router.get("/student/info/:id", StudentController.getStudentDataForAdmin);
router.put(
  "/change-status",
  authenticateToken,
  logAdminActivity,
  StudentController.changeStudentStatus
);

router.get("/logs", authenticateToken, AdminController.getAuditLogs);

// Refresh token route
router.post(
  "/refresh-token",
  authenticateRefreshToken,
  AdminController.refreshAdminToken
);

router.post("/audit-logout", AdminController.logAdminLogout);

router.get("/report", AdminController.reportGeneration);

module.exports = router;
