const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
); // Replace with your Stripe secret key

const { models } = require("../../models");

const createStripeOnBoardingLink = async (req, res) => {
  console.log(req.body);
  let account;
  try {
    const { email, userId } = req.body; // Assume userId is passed from the frontend

    // Step 1: Check if the user already has a Stripe account
    const existingUser = await models.User.findOne({
      where: { user_id: userId },
    });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existingUser.stripe_acct_id) {
      return res
        .status(400)
        .json({ error: "User already has a Stripe account" });
    }

    // Step 3: Create a new Express account with the email
    account = await stripe.accounts.create({
      type: "express",
      email, // User's email
      country: "CA", // Change if required
    });

    // Step 4: Save Stripe account ID to database
    existingUser.stripe_acct_id = account.id; // Save the Stripe account ID
    await existingUser.save();

    // Step 5: Create an account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://yourwebsite.com/onboarding-failed",
      return_url: "http://localhost:3000/profile/dashboard",
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating onboarding link:", error);

    // Rollback: Delete the Stripe account if there was an error
    if (account) {
      try {
        await stripe.accounts.del(account.id); // Delete the account to clean up
        if (existingUser) {
          existingUser.stripe_acct_id = null; // Remove the Stripe account ID
          await existingUser.save();
        }
      } catch (delError) {
        console.error(
          "Error deleting Stripe account during rollback:",
          delError
        );
      }
    }

    res.status(500).json({ error: error.message });
  }
};

module.exports = createStripeOnBoardingLink;