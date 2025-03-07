const { models } = require("../../models");

// Update a specific system configuration
const updateSystemConfig = async (req, res) => {
  try {
    const { config, config_value } = req.body;

    const existingConfig = await models.SystemConfig.findOne({
      where: { config },
    });

    if (!existingConfig) {
      return res.status(404).json({ error: "Config not found" });
    }

    existingConfig.config_value = config_value;
    await existingConfig.save();

    res.status(200).json({
      message: "Configuration updated successfully",
      config: existingConfig,
    });
  } catch (error) {
    console.error("Error updating system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateSystemConfig };
