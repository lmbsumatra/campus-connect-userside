const { models } = require("../../models");
const { Op } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get the Stripe API key from environment variables
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

const getStripeAdminOverview = async (req, res) => {
  try {
    // Check if system config allows Stripe
    const stripeConfig = await models.SystemConfig.findOne({
      where: { config: "is_stripe_allowed" },
    });

    if (!stripeConfig || !stripeConfig.config_value) {
      return res.status(403).json({ error: "Stripe payments are disabled" });
    }

    // Add error handling for Stripe API calls
    let balance;
    try {
      // Fetch platform balance from Stripe
      balance = await stripe.balance.retrieve();
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      return res.status(500).json({
        error: "Error connecting to Stripe API",
        details: stripeError.message,
      });
    }

    // Get total connected accounts with safer query
    let connectedAccounts;
    try {
      connectedAccounts = await models.User.count({
        where: {
          stripe_acct_id: { [Op.ne]: null },
          is_stripe_completed: true,
        },
      });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      // Continue with zero connected accounts rather than failing
      connectedAccounts = 0;
    }

    // Get recent transactions with error handling
    let transactions;
    try {
      transactions = await stripe.balanceTransactions.list({
        limit: 10,
      });
    } catch (stripeError) {
      console.error("Stripe transactions error:", stripeError);
      // Continue with empty transactions rather than failing
      transactions = { data: [] };
    }

    // Calculate balance values safely
    const availableBalance =
      balance.available && balance.available.length
        ? balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100
        : 0;

    const pendingBalance =
      balance.pending && balance.pending.length
        ? balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100
        : 0;

    const currencies =
      balance.available && balance.available.length
        ? balance.available.map((bal) => ({
            currency: bal.currency,
            amount: bal.amount / 100,
          }))
        : [];

    // Return aggregated data with all values defaulted safely
    res.status(200).json({
      platformBalance: {
        available: availableBalance,
        pending: pendingBalance,
        currencies: currencies,
      },
      connectedAccounts: connectedAccounts || 0,
      recentTransactions:
        transactions && transactions.data ? transactions.data : [],
    });
  } catch (error) {
    console.error("Error fetching admin stripe overview:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = getStripeAdminOverview;
