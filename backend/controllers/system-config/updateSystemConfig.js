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
      "Slot Price": "slot_price",
    };

    if (configMapping[config]) {
      config = configMapping[config];
    }

    // Find existing config or create if it doesn't exist
    let existingConfig = await models.SystemConfig.findOne({
      where: { config },
    });

    // If config doesn't exist, create it with appropriate type
    if (!existingConfig) {
      console.log(`Creating missing config: ${config}`);
      
      // Determine config type based on value
      let config_type = "string";
      if (typeof config_value === "boolean") {
        config_type = "boolean";
      } else if (typeof config_value === "number" || !isNaN(Number(config_value))) {
        config_type = "number";
      }
      
      try {
        existingConfig = await models.SystemConfig.create({
          config,
          config_value: config_value.toString(),
          config_type
        });
      } catch (createError) {
        console.error("Error creating config:", createError);
        return res.status(500).json({ error: "Failed to create config" });
      }
    }

    // Convert value to string for storage
    if (existingConfig.config_type === "boolean") {
      config_value = config_value.toString();
    } else if (existingConfig.config_type === "number") {
      config_value = Number(config_value).toString();
    } else {
      config_value = config_value.toString();
    }

    existingConfig.config_value = config_value;
    await existingConfig.save();
    console.log(`Updated config ${config} to ${config_value}`);

    // Convert DB keys back to frontend-friendly keys
    const reverseMapping = {
      is_stripe_allowed: "Stripe",
      generate_sample_data: "Generate Sample Data",
      slot_price: "Slot Price",
    };

    // Parse the value for response
    let returnValue = existingConfig.config_value;
    if (existingConfig.config_type === "boolean") {
      returnValue = returnValue === "true";
    } else if (existingConfig.config_type === "number") {
      returnValue = parseFloat(returnValue);
    }

    res.status(200).json({
      [reverseMapping[existingConfig.config] || existingConfig.config]: returnValue,
    });
  } catch (error) {
    console.error("Error updating system config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateSystemConfig };
