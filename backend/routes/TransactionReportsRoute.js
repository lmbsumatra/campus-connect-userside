const express = require("express");
const router = express.Router();
const TransactionReportController = require("../controllers/transactionreports/TransactionReportController");
const { uploadEvidence } = require("../config/multer");
const authenticateStudentToken = require("../middlewares/StudentAuthMiddleware");
const {
  authenticateToken: authenticateAdminToken,
} = require("../middlewares/AdminAuthMiddleware");
const checkPermission = require("../middlewares/CheckPermission");

module.exports = (dependencies) => {
  const controller = TransactionReportController(dependencies);

  // GET All Reports (Admin Only) - Protected by Admin Auth
  router.get(
    "/",
    authenticateAdminToken, // Use Admin Auth
    controller.getAllTransactionReports
  );

  // GET Escalated Reports (Admin Only) ---
  router.get(
    "/escalated", // Specific endpoint for admin queue
    authenticateAdminToken,
    controller.getEscalatedTransactionReports
  );

  // GET Single Report (Admin)
  router.get(
    "/admin/:reportId",
    authenticateAdminToken,
    controller.getTransactionReportById
  );
  // GET Single Report (Student)
  router.get(
    "/student/:reportId",
    authenticateStudentToken,
    controller.getTransactionReportById
  );

  router.get(
    "/user/:userId",
    authenticateStudentToken,
    controller.getTransactionReportsByUser
  );
  // POST Create Report (Student Action)
  router.post(
    "/",
    authenticateStudentToken,
    uploadEvidence,
    controller.createTransactionReport
  );

  // POST Add Response (Student - Reporter or Reportee)
  router.post(
    "/:reportId/response",
    authenticateStudentToken, // Student action
    uploadEvidence,
    controller.addResponse
  );

  // PUT Mark as Resolved (Student - Reporter Only)
  router.put(
    "/:reportId/resolve",
    authenticateStudentToken,
    controller.markReportResolved
  );

  // PUT Escalate Report (Reporter Only)
  router.put(
    "/:reportId/escalate",
    authenticateStudentToken, // Student action
    controller.escalateReport
  );
  // PUT Admin Action ---
  router.put(
    "/:reportId/admin-action",
    authenticateAdminToken,
    checkPermission("ReadWrite"),
    controller.updateEscalatedReportStatusByAdmin
  );

  return router;
};
