const express = require("express");
const router = express.Router();
const rentalTransactionController = require("../controllers/rental-transactions/RentalTransactionController");

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
  } = rentalTransactionController; // Pass io to the controller

  // Routes that don't need io
  router.post("/add", createRentalTransaction);
  router.get("/", getAllRentalTransactions);
  router.get("/:id", getRentalTransactionById);
  router.put("/:id", updateRentalTransaction);
  router.delete("/:id", deleteRentalTransaction);
  router.get("/user/:userId", getTransactionsByUserId);

  // Routes that need io
  router.post("/user/:id/accept", acceptRentalTransaction);
  router.post("/user/:id/hand-over", handOverRentalTransaction);
  router.post("/user/:id/return", returnRentalTransaction);
  router.post("/user/:id/completed", completeRentalTransaction);
  router.post("/user/:id/cancel", cancelRentalTransaction);
  router.post("/user/:id/decline", declineRentalTransaction);

  return router;
};
