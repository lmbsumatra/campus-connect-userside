const { models } = require("../../models");

const createOrg = async (req, res) => {
  let { org_name, description, category, isActive } = req.body;

  console.log({ org_name, description, category, isActive });

  if (typeof isActive === "string") {
    isActive = isActive.toLowerCase() === "true" || "active" ? true : false;
  }

  try {
    // Look up the category by its name to get the category_id
    const categoryRecord = await models.OrgCategory.findOne({
      where: { name: category }, // `category` is the text you passed
    });

    if (!categoryRecord) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Now that we have the category_id, we can create the organization
    const orgData = {
      name: org_name, // Mapping org_name to name
      description: description,
      category_id: categoryRecord.id, // Use the category_id from the category record
      is_active: isActive, // Adjust field to match database if needed
      is_verified: isActive, // Adjust field to match database if needed
    };

    // Create the organization with the correct category_id
    const org = await models.Org.create(orgData);

    // Transform org data to camelCase
    const orgCamelCase = {
      orgId: org.org_id, // Mapping org_id to orgId
      name: org.name,
      description: org.description,
      categoryId: org.category_id, // Mapping category_id to categoryId
      isActive: org.is_active, // Mapping is_active to isActive
      createdAt: org.created_at, // Mapping created_at to createdAt
      updatedAt: org.updated_at, // Mapping updated_at to updatedAt
      category: categoryRecord
        ? {
            id: categoryRecord.id,
            name: categoryRecord.name,
            description: categoryRecord.description,
          }
        : null,
    };

    // Return the transformed organization
    res.status(201).json(orgCamelCase);
  } catch (err) {
    console.error("Error creating organization:", err);
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
