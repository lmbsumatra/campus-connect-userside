const express = require("express");
const OrgsController = require("../controllers/orgs/OrgsController");
const OrgCategoriesController = require("../controllers/org-categories/OrgCategoriesController");
const { upload_org_logo } = require("../config/multer");
const router = express.Router();
const { authenticateToken } = require("../middlewares/AdminAuthMiddleware");
const logAdminActivity = require("../middlewares/auditMiddleware");
const checkPermission = require("../middlewares/CheckPermission");

router.get("/", OrgsController.getAllOrgs);
router.post("/add", upload_org_logo, OrgsController.createOrg);
router.put("/:orgId", upload_org_logo, OrgsController.editOrg);
router.patch(
  "/:orgId/status",
  authenticateToken,
  checkPermission("ReadWrite"),
  logAdminActivity,
  OrgsController.updateOrgStatus
);
router.patch(
  "/:orgId/representative",
  authenticateToken,
  checkPermission("ReadWrite"),
  logAdminActivity,
  OrgsController.setOrgRepresentative
);

router.get("/categories", OrgCategoriesController.getAllCategories);
router.post("/categories/add", OrgCategoriesController.createCategory);
router.delete(
  "/:orgId",
  authenticateToken,
  checkPermission("ReadWrite"),
  logAdminActivity,
  OrgsController.deleteOrg
);

module.exports = router;
