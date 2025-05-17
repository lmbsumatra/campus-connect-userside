const stripe = require("stripe")("sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd");
const { models } = require("../../models");

const createPaymentIntent = async (req, res) => {
  try {
    const { currency = "PHP", listingType } = req.body;

    const userId = req.user?.userId;

    const missingFields = [];
    if (!userId) missingFields.push("userId (from auth token)");
    if (!listingType) missingFields.push("listingType");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: missingFields,
      });
    }

    // Get the slot price from system config
    const slotPriceConfig = await models.SystemConfig.findOne({
      where: { config: "slot_price" }
    });

    // Default to 10 if not found in config
    let amount = 10;
    if (slotPriceConfig) {
      amount = parseFloat(slotPriceConfig.config_value);
    }

    const exchangeRate = 0.024;
    let convertedAmount = amount;

    if (currency === "PHP") {
      convertedAmount = Math.round(amount * exchangeRate * 100); 
    } else if (currency === "CAD") {
      convertedAmount = Math.round(amount * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency: "CAD", 
      description: "Purchase of extra slot",
      metadata: {
        userId,
        purpose: "slot-purchase",
        listingType,
        slotPrice: amount
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      slotPrice: amount
    });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
};

module.exports = createPaymentIntent;
