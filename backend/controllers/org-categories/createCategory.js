const { models } = require("../../models");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await models.OrgCategory.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = createCategory;
