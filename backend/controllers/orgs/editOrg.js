const { models } = require("../../models");

const editOrg = async (req, res) => {
  const { orgId } = req.params;
  let { org_name, description, category, isActive } = req.body;

  console.log({ orgId, org_name, description, category, isActive });

  // Convert isActive to boolean if it's a string
  if (typeof isActive === "string") {
    isActive = isActive.toLowerCase() === "true" || "active" ? true : false;
  }

  try {
    // Find the organization by ID
    const org = await models.Org.findByPk(orgId);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Find the category record by name
    const categoryRecord = await models.OrgCategory.findOne({
      where: { name: category },
    });

    if (!categoryRecord) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Update the organization
    await org.update({
      name: org_name,
      description,
      category_id: categoryRecord.id,
      is_active: isActive,
      is_verified: isActive,
    });

    // Prepare camelCase response
    const updatedOrg = {
      orgId: org.org_id,
      name: org.name,
      description: org.description,
      categoryId: org.category_id,
      isActive: org.is_active,
      createdAt: org.created_at,
      updatedAt: org.updated_at,
      category: {
        id: categoryRecord.id,
        name: categoryRecord.name,
        description: categoryRecord.description,
      },
    };

    res.status(200).json(updatedOrg);
  } catch (err) {
    console.error("Error updating organization:", err);
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(400).json({
      error: err.message,
      stack: err.stack,
    });
  }
};

module.exports = editOrg;
