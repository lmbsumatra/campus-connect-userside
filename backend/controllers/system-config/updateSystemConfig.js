const { models } = require("../../models");

// Update a specific system configuration
const updateSystemConfig = async (req, res) => {
  try {
    let { config_value } = req.body;
    let { config } = req.params; // Use 'let' instead of 'const' if modification is needed

    console.log("Received from backend:", config, config_value);

    // Rename "stripe" to "is_stripe_allowed" before querying the DB
    if (config === "Stripe") {
      config = "is_stripe_allowed";
    }

    const existingConfig = await models.SystemConfig.findOne({
      where: { config },
    });

    if (!existingConfig) {
      return res.status(404).json({ error: "Config not found" });
    }

    existingConfig.config_value = config_value;
    await existingConfig.save();

    res.status(200).json({
      [existingConfig.config === "is_stripe_allowed"
        ? "Stripe"
        : existingConfig.config]: existingConfig.config_value,
    });
  } catch (error) {
    console.error("Error updating system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateSystemConfig };
