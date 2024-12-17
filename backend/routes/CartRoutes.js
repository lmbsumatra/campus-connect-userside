const express = require("express");
const router = express.Router();
const AddCartItemController = require("../controllers/cart/AddCartItemController");
const GetCartItemsController = require("../controllers/cart/GetCartItemsController");
const DeleteCartItemController = require("../controllers/cart/DeleteCartItemController");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.get("/get", authenticateToken, GetCartItemsController.getCartItems);
router.post("/add", authenticateToken, AddCartItemController.addCartItem);
router.delete(
  "/remove/:cart_item_id",
  authenticateToken,
  DeleteCartItemController.removeCartItem
);

module.exports = router;
