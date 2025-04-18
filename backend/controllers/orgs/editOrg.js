const { rollbackUpload } = require("../../config/multer");
const { models } = require("../../models");

const editOrg = async (req, res) => {
  const { orgId } = req.params;
  let { org_name, description, category, isActive, rep_id, remove_logo } =
    req.body;
  let logoUrl = null;

  // console.log({
  //   orgId,
  //   org_name,
  //   description,
  //   category,
  //   isActive,
  //   remove_logo,
  // });

  // Convert isActive to boolean if it's a string
  if (typeof isActive === "string") {
    isActive =
      isActive.toLowerCase() === "true" || isActive === "active" ? true : false;
  }

  // Convert remove_logo to boolean if it's a string
  if (typeof remove_logo === "string") {
    remove_logo = remove_logo.toLowerCase() === "true";
  }

  try {
    // Find the organization by ID
    const org = await models.Org.findByPk(orgId);

    if (!org) {
      // If upload happened but update failed, rollback the upload
      if (req.file) await rollbackUpload([req.file.path]);
      return res.status(404).json({ error: "Organization not found" });
    }

    // Handle logo changes
    if (req.file) {
      // If new logo is uploaded
      logoUrl = req.file.path;

      // If there was an old logo, delete it from cloudinary
      if (org.logo_url) {
        await rollbackUpload([org.logo]);
      }
    } else if (remove_logo) {
      // If logo should be removed and no new logo is uploaded
      if (org.logo_url) {
        await rollbackUpload([org.logo]);
      }
      logoUrl = null;
    } else {
      // Keep existing logo
      logoUrl = org.logo;
    }

    // Find the category record by name
    const categoryRecord = await models.OrgCategory.findOne({
      where: { name: category },
    });

    if (!categoryRecord) {
      // If upload happened but update failed, rollback the upload
      if (req.file) await rollbackUpload([req.file.path]);
      return res.status(400).json({ error: "Category not found" });
    }

    // Find the representative by ID
    const representative = await models.User.findByPk(rep_id);
    if (!representative) {
      console.error(`Representative with ID ${rep_id} not found.`);
      // return res.status(404).json({ error: "Representative not found" });
    }

    // Update the organization
    await org.update({
      name: org_name,
      description,
      category_id: categoryRecord.id,
      is_active: isActive,
      is_verified: isActive,
      user_id: representative?.user_id || null,
      logo: logoUrl, // Update logo URL
    });

    // Re-fetch the updated organization with associations
    const updated = await models.Org.findByPk(orgId, {
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    // Prepare camelCase response
    const updatedOrg = {
      orgId: updated.org_id,
      name: updated.name,
      description: updated.description,
      categoryId: updated.category_id,
      isActive: updated.is_active,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      userId: updated.user_id,
      logo: updated.logo, // Include logo URL in response
      category: updated.category
        ? {
            id: updated.category.id,
            name: updated.category.name,
            description: updated.category.description,
          }
        : null,
      representative: updated.representative
        ? {
            id: updated.representative.user_id,
            name: `${updated.representative.first_name} ${updated.representative.last_name}`,
          }
        : null,
    };

    // console.log(updatedOrg);

    res.status(200).json(updatedOrg);
  } catch (err) {
    console.error("Error updating organization:", err);
    // If upload happened but update failed, rollback the upload
    if (req.file) await rollbackUpload([req.file.path]);

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
