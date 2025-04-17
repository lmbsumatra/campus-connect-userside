const express = require("express");
const router = express.Router();
const rentalTransactionController = require("../controllers/rental-transactions/RentalTransactionController");
const { uploadTransactionEvidence } = require("../config/multer");

module.exports = function (rentalTransactionController) {
  // Attach io to the controller methods that need it
  const {
    createRentalTransaction,
    getAllRentalTransactions,
    getRentalTransactionById,
    updateRentalTransaction,
    deleteRentalTransaction,
    getTransactionsByUserId,
    acceptRentalTransaction,
    handOverRentalTransaction,
    returnRentalTransaction,
    completeRentalTransaction,
    cancelRentalTransaction,
    declineRentalTransaction,
    uploadEvidenceImage,
  } = rentalTransactionController; // Pass io to the controller

  // Routes that don't need io
  router.post("/add", createRentalTransaction);
  router.get("/all", getAllRentalTransactions);
  router.get("/:id", getRentalTransactionById);
  router.put("/:id", updateRentalTransaction);
  router.delete("/:id", deleteRentalTransaction);
  router.get("/user/:userId", getTransactionsByUserId);
  router.post("/upload-evidence", uploadTransactionEvidence, uploadEvidenceImage);

  // Routes that need io
  router.post("/user/:id/accept", acceptRentalTransaction);
  router.post("/user/:id/hand-over", handOverRentalTransaction);
  router.post("/user/:id/return", returnRentalTransaction);
  router.post("/user/:id/completed", completeRentalTransaction);
  router.post("/user/:id/cancel", cancelRentalTransaction);
  router.post("/user/:id/decline", declineRentalTransaction);

  return router;
};
