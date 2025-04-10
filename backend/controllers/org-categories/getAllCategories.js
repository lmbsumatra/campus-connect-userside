const { models } = require("../../models");

const getAllCategories = async (req, res) => {
  try {
    const categories = await models.OrgCategory.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = getAllCategories;