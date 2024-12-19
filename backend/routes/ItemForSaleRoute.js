const express = require("express");
const router = express.Router();
const ItemForSaleController = require("../controllers/ItemForSaleController");
const {
  ItemForSaleContoller,
} = require("../controllers/item-for-sale/ItemForSaleController.js");

router.get("/available", ItemForSaleContoller.getAllAvailable);
// isang item for sale na available (approved, with available date and corresponding time)
router.get("/available/:id", ItemForSaleController.getAvailableItemForSaleById);

// lahat ng  item for sale available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get(
  "/all/available/user",
  ItemForSaleController.getAvailableItemsForSaleByUser
); // get by query [item-for-sale/user?query=value]

/* * * * * * * * * displayed for all admins :: all regardless of status * * * * * * * * * * * * * */
router.get("/info", ItemForSaleController.getAllItemForSale);
router.get("/:id", ItemForSaleController.getItemForSaleById);

// patch by admins
router.patch("/:id", ItemForSaleController.updateStatus);

// crud for user
router.post("/add", ItemForSaleController.createItemForSale);
router.put("/:id", ItemForSaleController.updateItemForSale);
router.delete("/:id", ItemForSaleController.deleteItemForSale);

module.exports = router;
