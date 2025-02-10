const { models } = require("../../models");

const getUsers = async (requestAnimationFrame, res) => {
  try {
    const users = await models.User.findAll({});

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found!" });
    }
    return res.status(200).json({ users });
  } catch (error) {
    console.log("Error fetching users: ", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUsers;
