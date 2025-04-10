const { models } = require("../../models");

const getAllOrgs = async (req, res) => {
  try {
    const orgs = await models.Org.findAll({
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    // Transform org data to camelCase
    const orgsCamelCase = orgs.map(org => {
      return {
        orgId: org.org_id,
        name: org.name,
        description: org.description,
        categoryId: org.category_id,
        logo: org.logo,
        isVerified: org.is_verified,
        isActive: org.is_active,
        userId: org.user_id,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
        category: org.category ? {
          id: org.category.id,
          name: org.category.name,
          description: org.category.description,
        } : null,
        representative: org.representative ? {
          id: org.representative.user_id,
          name: `${org.representative.first_name} ${org.representative.last_name}`,
        } : null,
      };
    });

    res.json(orgsCamelCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = getAllOrgs;
