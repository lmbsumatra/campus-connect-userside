const { models } = require("../../models");

const updateOrgStatus = async (req, res) => {
  const { orgId } = req.params;

  try {
    const org = await models.Org.findByPk(orgId);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    org.is_verified = !org.is_verified;
    org.is_active = !org.is_active;

    await org.save();

    res.json({
      message: "Organization status updated successfully",
      org: {
        orgId: org.org_id,
        name: org.name,
        isVerified: org.is_verified,
        isActive: org.is_active,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = updateOrgStatus;
