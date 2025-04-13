const express = require("express");
const router = express.Router();
const ItemForSaleController = require("../controllers/ItemForSaleController");
const ItemForSaleController2 = require("../controllers/item-for-sale/ItemForSaleController.js");
const updateItemForSaleStatus = require("../controllers/item-for-sale/updateItemForSaleStatus.js");
const { upload_item } = require("../config/multer");
const { authenticateToken } = require("../middlewares/AdminAuthMiddleware");
const checkPermission = require("../middlewares/CheckPermission.js");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");
const logAdminActivity = require("../middlewares/auditMiddleware");

router.get("/available", ItemForSaleController2.getAllAvailable);
// isang item for sale na available (approved, with available date and corresponding time)
router.get(
  "/available/:id",
  ItemForSaleController2.getAvailableItemForSaleById
);

// lahat ng  item for sale available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
// router.get(
//   "/all/available/user",
//   ItemForSaleController.getAvailableItemsForSaleByUser
// ); // get by query [item-for-sale/user?query=value]

/* * * * * * * * * displayed for all admins :: all regardless of status * * * * * * * * * * * * * */
router.get("/info", ItemForSaleController.getAllItemForSale);

router.get(
  "/user/:userId/available",
  ItemForSaleController2.getAvailableItemsForSaleByUser
);
router.get("/users/:id", ItemForSaleController2.getAllItemForSaleByUser);

// patch by admins
router.patch("/:id", ItemForSaleController.updateStatus);
router.get("/admin/get/:id", ItemForSaleController2.adminItemForSaleById);

// crud for user
router.post(
  "/add",
  checkUnavailableDate,
  upload_item,
  ItemForSaleController2.addItemForSale
);
router.get(
  "/users/:userId/get/:itemForSaleId",
  upload_item,
  ItemForSaleController2.getItemForSaleById
);
router.patch(
  "/users/:userId/update/:itemId",
  upload_item,
  ItemForSaleController2.updateItemForSaleById
);
router.put("/:id", ItemForSaleController.updateItemForSale);
router.patch(
  "/:id/status",
  authenticateToken,
  checkPermission("ReadWrite"),
  logAdminActivity,
  updateItemForSaleStatus
);
router.delete(
  "/:users/:userId/delete/:itemForSaleId",
  ItemForSaleController2.deleteItemForSaleById
);

module.exports = router;
