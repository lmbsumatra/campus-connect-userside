const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/AdminTransactionController")

router.get("/", transactionController.getAllTransactions); // Unified endpoint for all transactions
router.get("/view/:id", transactionController.getTransactionById);

module.exports = router;
