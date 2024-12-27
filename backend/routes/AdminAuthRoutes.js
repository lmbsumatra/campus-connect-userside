const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/AdminAuthController");
const authenticateToken = require("../middlewares/AdminAuthMiddleware");

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

module.exports = router;
