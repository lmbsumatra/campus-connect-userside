const express = require("express");
const { BuySlotController } = require("../controllers/slot/BuySlotController");
const router = express.Router();
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.post("/pi", authenticateToken, BuySlotController.createPaymentIntent);
router.post("/", authenticateToken, BuySlotController.buySlot);

module.exports = router;
