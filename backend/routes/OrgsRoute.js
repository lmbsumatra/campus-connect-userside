const express = require("express");
const OrgsController = require("../controllers/orgs/OrgsController");
const OrgCategoriesController = require("../controllers/org-categories/OrgCategoriesController");
const { upload_org_logo } = require("../config/multer");
const router = express.Router();

router.get("/", OrgsController.getAllOrgs);
router.post("/add", upload_org_logo, OrgsController.createOrg);
router.put("/:orgId", upload_org_logo, OrgsController.editOrg);
router.patch("/:orgId/status", OrgsController.updateOrgStatus);
router.patch("/:orgId/representative", OrgsController.setOrgRepresentative);

router.get("/categories", OrgCategoriesController.getAllCategories);
router.post("/categories/add", OrgCategoriesController.createCategory);
router.delete("/:orgId", OrgsController.deleteOrg);

module.exports = router;
