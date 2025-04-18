const { models } = require("../../models");
const { rollbackUpload } = require("../../config/multer");

const createOrg = async (req, res) => {
  let { org_name, description, category, isActive, rep_id } = req.body;
  let logoUrl = null;

  // console.log({ org_name, description, category, isActive, rep_id });

  if (typeof isActive === "string") {
    isActive =
      isActive.toLowerCase() === "true" || isActive === "active" ? true : false;
  }

  try {
    // Handle logo upload if present
    if (req.file) {
      logoUrl = req.file.path; // Cloudinary URL
    }

    // Look up the category by its name to get the category_id
    const categoryRecord = await models.OrgCategory.findOne({
      where: { name: category },
    });

    if (!categoryRecord) {
      // If upload happened but creation failed, rollback the upload
      if (logoUrl) await rollbackUpload([logoUrl]);
      return res.status(400).json({ error: "Category not found" });
    }

    const representative = await models.User.findByPk(rep_id);
    if (!representative) {
      console.error(`Representative with ID ${rep_id} not found.`);
      // Consider adding an error response for representative
      // return res.status(404).json({ error: "Representative not found" });
    }

    // Now that we have the category_id, we can create the organization
    const orgData = {
      name: org_name,
      description: description,
      category_id: categoryRecord.id,
      is_active: isActive,
      is_verified: isActive,
      user_id: representative?.user_id || null,
      logo: logoUrl, // Add the logo URL
    };

    // console.log(orgData);

    // Create the organization with the correct category_id
    const createdOrg = await models.Org.create(orgData);

    const org = await models.Org.findByPk(createdOrg.org_id, {
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    // Transform org data to camelCase
    const orgCamelCase = {
      orgId: org.org_id,
      name: org.name,
      description: org.description,
      categoryId: org.category_id,
      isActive: org.is_active,
      createdAt: org.created_at,
      updatedAt: org.updated_at,
      userId: org.user_id,
      logoUrl: org.logo, // Include logo URL in response
      category: categoryRecord
        ? {
            id: categoryRecord.id,
            name: categoryRecord.name,
            description: categoryRecord.description,
          }
        : null,
      representative: org.representative
        ? {
            id: org.representative.user_id,
            name: `${org.representative.first_name} ${org.representative.last_name}`,
          }
        : null,
    };

    // Return the transformed organization
    res.status(201).json(orgCamelCase);
  } catch (err) {
    console.error("Error creating organization:", err);
    // If upload happened but creation failed, rollback the upload
    if (logoUrl) await rollbackUpload([logoUrl]);

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

module.exports = createOrg;
