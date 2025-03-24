const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
); // Replace with your Stripe secret key

const { models } = require("../../models/index.js");

// Fetch merchant details including settings, payout settings, and payout schedule
const getMerchantDetails = async (req, res) => {
  try {
    const { userId } = req.params; // Assume userId is passed in request parameters

    // Fetch user from database
    const user = await models.User.findOne({ where: { user_id: userId } }); // For Sequelize
    if (!user || !user.stripe_acct_id) {
      return res
        .status(404)
        .json({ error: "Merchant or Stripe account not found" });
    }

    // Fetch merchant details from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_acct_id);

    // Fetch balance details from Stripe
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_acct_id,
    });

    // Format and send the response with Merchant settings, Payout settings, and Payout schedule
    res.status(200).json({
      merchantSettings: {
        storeName: account.business_profile.name || "Not provided",
        countryCode: account.country || "Not provided",
      },
      payoutSettings: {
        stripeAccountId: account.id,
        pendingBalance: balance.pending,
        availableBalance: balance.available,
      },
      payoutSchedule: {
        current: account.settings.payouts.schedule.interval || "Not provided",
      },
    });
  } catch (error) {
    // console.error("Error fetching merchant details:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getMerchantDetails;