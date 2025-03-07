const { models } = require("../../models");

// Get all system configurations
const getSystemConfig = async (req, res) => {
  try {
    const configs = await models.SystemConfig.findAll();
    const configMap = {};

    configs.forEach((config) => {
      // Rename "is_stripe_allowed" to "stripe"
      const key = config.config === "is_stripe_allowed" ? "Stripe" : config.config;
      configMap[key] = config.config_value;
    });

    res.status(200).json(configMap);
  } catch (error) {
    console.error("Error fetching system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getSystemConfig };
