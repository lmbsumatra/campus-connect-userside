const { models } = require("../../models");

// Update a specific system configuration
const updateSystemConfig = async (req, res) => {
  try {
    let { config_value } = req.body;
    let { config } = req.params;

    // Convert frontend-friendly keys to DB keys
    const configMapping = {
      "Stripe": "is_stripe_allowed",
      "Generate Sample Data": "generate_sample_data",
    };

    if (configMapping[config]) {
      config = configMapping[config];
    }

    const existingConfig = await models.SystemConfig.findOne({
      where: { config },
    });

    if (!existingConfig) {
      return res.status(404).json({ error: "Config not found" });
    }

    existingConfig.config_value = config_value;
    await existingConfig.save();

    // Convert DB keys back to frontend-friendly keys
    const reverseMapping = {
      is_stripe_allowed: "Stripe",
      generate_sample_data: "Generate Sample Data",
    };

    res.status(200).json({
      [reverseMapping[existingConfig.config] || existingConfig.config]: existingConfig.config_value,
    });
  } catch (error) {
    console.error("Error updating system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateSystemConfig };
