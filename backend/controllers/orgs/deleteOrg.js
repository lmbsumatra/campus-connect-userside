const { models } = require("../../models");
const { rollbackUpload } = require("../../config/multer");

const deleteOrg = async (req, res) => {
  const { orgId } = req.params;

  console.log(orgId);

  try {
    // Find the organization by ID
    const org = await models.Org.findByPk(orgId);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // If the organization has a logo, rollback (delete) the logo
    if (org.logo) {
      await rollbackUpload([org.logo]);
    }

    // Delete the organization
    await org.destroy();

    res.status(200).json({
      message: "Organization deleted successfully",
      orgId: orgId,
    });
  } catch (err) {
    console.error("Error deleting organization:", err);
    res.status(500).json({
      error: "An error occurred while deleting the organization",
      details: err.message,
    });
  }
};

module.exports = deleteOrg;
