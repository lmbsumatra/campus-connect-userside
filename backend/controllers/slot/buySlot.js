const { models, sequelize } = require("../../models/index");
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

const buySlot = async (req, res) => {
  try {
    const { paymentIntentId, listingType } = req.body;
    const userId = req.user?.userId;

    if (!paymentIntentId || !userId || !listingType) {
      return res.status(400).json({
        error:
          "Missing required fields: paymentIntentId, userId, and listingType are required.",
      });
    }

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error retrieving paymentIntent from Stripe" });
    }

    if (paymentIntent.status === "succeeded") {

      const updateField = {};
      const normalizedType = listingType.toLowerCase().trim();

      if (normalizedType === "postlookingforitem") {
        updateField.post_slot = sequelize.literal("post_slot + 1");
      } else if (normalizedType === "itemforsale") {
        updateField.item_slot = sequelize.literal("item_slot + 1");
      } else if (normalizedType === "listingforrent") {
        updateField.listing_slot = sequelize.literal("listing_slot + 1");
      } else {
        return res.status(400).json({ error: "Invalid listingType." });
      }

      try {
        const [updatedRows] = await models.Student.update(updateField, {
          where: { user_id: userId },
        });


        if (updatedRows === 0) {
          return res
            .status(404)
            .json({ error: "Student not found or no change made." });
        }

        const updatedStudent = await models.Student.findOne({
          where: { user_id: userId },
        });

        return res.status(200).json({
          message: "Payment succeeded and slot count updated successfully.",
          student: updatedStudent,
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Error updating student's slots" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Payment failed or is still pending." });
    }
  } catch (error) {
    console.error("Error processing payment:", error.message);
    return res.status(500).json({ error: "Error processing payment" });
  }
};

module.exports = buySlot;
