const express = require("express");
const OrgsController = require("../controllers/orgs/OrgsController");
const OrgCategoriesController = require("../controllers/org-categories/OrgCategoriesController");
const router = express.Router();

router.get("/", OrgsController.getAllOrgs);
router.post("/add", OrgsController.createOrg);
router.put("/:orgId", OrgsController.editOrg);
router.patch("/:orgId/status", OrgsController.updateOrgStatus);
router.patch("/:orgId/representative", OrgsController.setOrgRepresentative);

router.get("/categories", OrgCategoriesController.getAllCategories);
router.post("/categories/add", OrgCategoriesController.createCategory);

module.exports = router;
