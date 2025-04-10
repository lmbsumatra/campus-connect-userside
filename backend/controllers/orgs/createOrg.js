const { models } = require("../../models");

const createOrg = async (req, res) => {
  try {
    const org = await models.Org.create(req.body);
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = createOrg;
