const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart/CartController.js");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.get("/get", authenticateToken, CartController.getCartItems);
router.post("/add", authenticateToken, CartController.addCartItem);
router.delete(
  "/remove/:cart_item_id",
  authenticateToken,
  CartController.removeCartItem
);
router.put(
  "/update-qty/:cartItemId",
  authenticateToken,
  CartController.updateCartQuantity
);

module.exports = router;
