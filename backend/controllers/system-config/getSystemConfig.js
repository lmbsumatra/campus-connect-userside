const { models } = require("../../models");

// Get all system configurations
const getSystemConfig = async (req, res) => {
  try {
    // Ensure required configs exist
    await ensureRequiredConfigsExist();
    
    const configs = await models.SystemConfig.findAll();
    
    const configMap = {};

    configs.forEach((config) => {
      let key = config.config;
      let value = config.config_value;
    
      if (config.config === "is_stripe_allowed") {
        key = "Stripe";
      } else if (config.config === "generate_sample_data") {
        key = "Generate Sample Data";
      } else if (config.config === "slot_price") {
        key = "Slot Price";
      }
      
      // Parse the value based on config_type
      if (config.config_type === "boolean") {
        value = value === "true";
      } else if (config.config_type === "number") {
        value = parseFloat(value);
      }
      
      configMap[key] = value;
    });

    res.status(200).json(configMap);
  } catch (error) {
    console.error("Error fetching system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to ensure required configs exist
const ensureRequiredConfigsExist = async () => {
  const requiredConfigs = [
    {
      config: "is_stripe_allowed",
      config_value: "true", // default to enabled
      config_type: "boolean"
    }
  ];

  for (const configData of requiredConfigs) {
    try {
      const existing = await models.SystemConfig.findOne({
        where: { config: configData.config }
      });

      if (!existing) {
        console.log(`Creating missing config: ${configData.config}`);
        await models.SystemConfig.create(configData);
      }
    } catch (error) {
      console.error(`Error ensuring config ${configData.config} exists:`, error);
    }
  }
};

module.exports = { getSystemConfig };
