const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

const { models } = require("../../models/index.js");

// Fetch complete details about a user's Stripe Connect account
const getStripeConnectAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user from database
    const user = await models.User.findOne({ where: { user_id: userId } });
    if (!user || !user.stripe_acct_id) {
      return res
        .status(404)
        .json({ error: "User or Stripe Connect account not found" });
    }

    // Retrieve complete Stripe account information
    const account = await stripe.accounts.retrieve(user.stripe_acct_id, {
      expand: [
        "capabilities",
        "external_accounts",
        "settings.branding",
        "settings.payouts",
        "settings.card_payments",
        "settings.payments",
        "tos_acceptance",
      ],
    });

    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: user.stripe_acct_id }
    );

    const payouts = await stripe.payouts.list(
      { limit: 10 },
      { stripeAccount: user.stripe_acct_id }
    );

    // Create account completion link if necessary
    let accountLink = null;
    if (
      !account.details_submitted ||
      !account.charges_enabled ||
      !account.payouts_enabled ||
      (account.requirements &&
        (account.requirements.currently_due?.length > 0 ||
          account.requirements.past_due?.length > 0))
    ) {
      accountLink = await stripe.accountLinks.create({
        account: user.stripe_acct_id,
        refresh_url: `http://localhost:3000/profile/dashboard`,
        return_url: `http://localhost:3000/profile/dashboard`,
        type: "account_onboarding",
      });
    }

    // Check missing requirements
    let missingRequirements = [];
    if (
      account.requirements?.currently_due.includes("tos_acceptance.date") ||
      account.requirements?.currently_due.includes("tos_acceptance.ip")
    ) {
      missingRequirements.push("Terms of Service acceptance is required. Please continue on setting up.");
    }

    if (account.requirements?.currently_due.includes("individual.verification.proof_of_liveness")) {
      missingRequirements.push("Identity verification is required. Please continue and  upload a correct identity document.");
    }

    // Format the response with all relevant information
    const response = {
      accountId: account.id,
      accountType: account.type,
      businessType: account.business_type,

      // Basic company information
      businessProfile: {
        name: account.business_profile?.name,
        url: account.business_profile?.url,
        supportEmail: account.business_profile?.support_email,
        supportPhone: account.business_profile?.support_phone,
        mcc: account.business_profile?.mcc,
        productDescription: account.business_profile?.product_description,
      },

      // Business details
      company: account.company || {},
      individual: account.individual || {},

      // Status information
      status: {
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        restricted: !account.charges_enabled || !account.payouts_enabled,
        completionLink: accountLink ? accountLink.url : null,
      },

      // Requirements and verification
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        pastDue: account.requirements?.past_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        disabledReason: account.requirements?.disabled_reason,
        errors: account.requirements?.errors || [],
      },

      // Capabilities information
      capabilities: account.capabilities || {},

      // Payment methods
      externalAccounts: {
        bankAccounts:
          account.external_accounts?.data.filter(
            (acc) => acc.object === "bank_account"
          ) || [],
        cards:
          account.external_accounts?.data.filter(
            (acc) => acc.object === "card"
          ) || [],
      },

      // Financial information
      balance: {
        available: balance.available,
        pending: balance.pending,
        instantAvailable: balance.instant_available,
      },

      // Payout details
      payouts: {
        schedule: account.settings?.payouts?.schedule || {},
        recentPayouts: payouts.data,
        defaultMethod: account.settings?.payouts?.default_method,
        statementDescriptor: account.settings?.payouts?.statement_descriptor,
      },

      // Settings
      settings: {
        cardPayments: account.settings?.card_payments,
        payments: account.settings?.payments,
        branding: account.settings?.branding,
      },

      // Legal and ToS information
      tosAcceptance: account.tos_acceptance || {},

      // Metadata
      metadata: account.metadata || {},

      // Account creation and update times
      created: account.created,
      createdAt: new Date(account.created * 1000).toISOString(),
      updated: account.updated
        ? new Date(account.updated * 1000).toISOString()
        : null,
    };

    if (response.status.restricted && response.status.completionLink !== null) {
      return res.status(200).json({
        payoutSettings: {
          stripeAccountId: account.id,
          pendingBalance: balance.pending,
          availableBalance: balance.available,
        },
        status: {
          restricted: response.status.restricted,
          completionLink: response.status.completionLink,
        },
        message: missingRequirements.length > 0 ? missingRequirements.join(" ") : null,
      });
    }

    if (
      !response.status.restricted &&
      response.status.completionLink === null &&
      account.charges_enabled &&
      account.payouts_enabled
    ) {
      user.is_stripe_completed = true;
      await user.save();
    }

    res.status(200).json({
      status: {
        status: response.status.restricted,
        completionLink: response.status.completionLink,
      },
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
      message: missingRequirements.length > 0 ? missingRequirements.join(" ") : null,
    });
  } catch (error) {
    console.error("Error fetching Stripe Connect account details:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getStripeConnectAccount;
