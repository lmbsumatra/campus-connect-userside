const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants"); // Make sure STRIPE is added to constants
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

const formatTransactionsForFrontend = (transactions, userId) => {
  // Group by transaction type
  const rentalTransactions = transactions.filter(
    (tx) => tx.transaction_type === "rental"
  );
  const saleTransactions = transactions.filter(
    (tx) => tx.transaction_type === "sell"
  );

  // Calculate statistics
  const stats = {
    totalTransactions: transactions.length,
    rentalTransactions: rentalTransactions.length,
    saleTransactions: saleTransactions.length,

    // Calculate revenue from completed transactions where user is the owner
    revenue: transactions
      .filter(
        (tx) => tx.status === "Completed" && tx.owner_id === Number(userId)
      )
      .reduce((sum, tx) => sum + (tx.revenue || 0), 0),

    successfulTransactions: transactions.filter(
      (tx) => tx.status === "Completed"
    ).length,

    // Additional helpful statistics
    pendingTransactions: transactions.filter((tx) => tx.status === "Requested")
      .length,
    cancelledTransactions: transactions.filter(
      (tx) => tx.status === "Cancelled"
    ).length,
  };

  // Format each transaction for display
  const formattedTransactions = transactions.map((tx) => {
    // Determine user role in transaction
    const userRole = getUserRole(tx, userId);

    // Determine counterparty based on user role
    const counterparty = getCounterparty(tx, userId);

    // Format dates and times nicely
    const formattedDate = tx.Date
      ? new Date(tx.Date.date).toLocaleDateString()
      : "N/A";

    let timeRange = "N/A";
    if (tx.Duration) {
      const from = tx.Duration.rental_time_from?.slice(0, 5) || "";
      const to = tx.Duration.rental_time_to?.slice(0, 5) || "";
      timeRange = from && to ? `${from} - ${to}` : "N/A";
    }

    // Format prices and determine transaction type nicely
    const transactionTypeName =
      tx.transaction_type === "rental" ? "Rental" : "Purchase";

    // Get item name and price based on transaction type
    const itemName =
      tx.item?.[
        tx.transaction_type === "rental" ? "listing_name" : "item_for_sale_name"
      ] || "Unknown Item";
    const itemPrice =
      tx.item?.[tx.transaction_type === "rental" ? "rate" : "price"] || "0";

    // Get Stripe payment status
    const paymentStatus = tx.stripe_payment_intent_id
      ? "Processing"
      : tx.payment_status || "Pending";

    return {
      id: tx.id,
      transactionType: transactionTypeName,
      status: tx.status,
      date: formattedDate,
      time: timeRange,
      itemName: itemName,
      itemPrice: parseFloat(itemPrice).toFixed(2),
      totalAmount: parseFloat(tx.revenue || itemPrice).toFixed(2),
      userRole: userRole,
      counterpartyName:
        `${counterparty?.first_name || ""} ${
          counterparty?.last_name || ""
        }`.trim() || "Unknown User",
      deliveryMethod:
        tx.delivery_method?.charAt(0).toUpperCase() +
          tx.delivery_method?.slice(1) || "N/A",
      paymentMethod: tx.payment_mode?.toUpperCase() || "N/A",
      paymentStatus: paymentStatus,
      createdAt: new Date(tx.createdAt).toLocaleDateString(),
      // Include raw data for detailed views if needed
      tx,
    };
  });

  return {
    stats,
    transactions: formattedTransactions,
  };
};

// Helper function to determine user's role in the transaction
const getUserRole = (transaction, userId) => {
  if (transaction.owner_id === Number(userId)) {
    return "Owner";
  } else if (transaction.renter_id === Number(userId)) {
    return "Renter";
  } else if (transaction.buyer_id === Number(userId)) {
    return "Buyer";
  }
  return "Unknown";
};

// Helper function to get the counterparty based on user role
const getCounterparty = (transaction, userId) => {
  if (transaction.owner_id === Number(userId)) {
    return transaction.transaction_type === "rental"
      ? transaction.renter
      : transaction.buyer;
  } else {
    return transaction.owner;
  }
};

// Example usage in your controller
const getTransactionsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await models.RentalTransaction.findAll({
      where: {
        [Op.or]: [
          { owner_id: userId },
          { renter_id: userId },
          { buyer_id: userId },
        ],
      },
      include: [
        {
          model: models.User,
          as: "owner",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        {
          model: models.User,
          as: "renter",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        {
          model: models.User,
          as: "buyer",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        { model: models.Date, attributes: ["id", "date"] },
        {
          model: models.Duration,
          attributes: ["id", "rental_time_from", "rental_time_to"],
        },
      ],
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        error: "No transactions found for this user.",
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    // Process each transaction to include the appropriate item details
    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const transactionData = transaction.toJSON();

        // Add item details based on transaction type
        if (transaction.transaction_type === "rental") {
          const listing = await models.Listing.findByPk(transaction.item_id, {
            attributes: [
              "id",
              "listing_name",
              "description",
              "rate",
              "security_deposit",
              "images",
            ],
          });

          // Get only the first image if images exist
          if (listing && listing.images && listing.images.length > 0) {
            listing.images = [JSON.parse(listing.images)[0]];
          }

          transactionData.item = listing;

          // Calculate revenue for rental transactions
          if (listing) {
            transactionData.revenue = parseFloat(listing.rate);
          }
        } else if (transaction.transaction_type === "sell") {
          const saleItem = await models.ItemForSale.findByPk(
            transaction.item_id,
            {
              attributes: [
                "id",
                "item_for_sale_name",
                "description",
                "price",
                "images",
              ],
            }
          );

          // Get only the first image if images exist
          if (saleItem && saleItem.images && saleItem.images.length > 0) {
            saleItem.images = [JSON.parse(saleItem.images)[0]];
          }

          transactionData.item = saleItem;

          // Calculate revenue for sale transactions
          if (saleItem) {
            transactionData.revenue = parseFloat(saleItem.price);
          }
        }

        return transactionData;
      })
    );

    // Format data for frontend
    const formattedData = formatTransactionsForFrontend(
      processedTransactions,
      userId
    );

    // Return the formatted data
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching transactions:", error);

    // Provide detailed error messages
    let errorMessage =
      "An unexpected error occurred while fetching transactions.";
    if (error.name === "SequelizeDatabaseError") {
      errorMessage = "Database error: " + error.message;
    } else if (error.name === "SequelizeValidationError") {
      errorMessage =
        "Validation error: " +
        error.errors.map((err) => err.message).join(", ");
    } else if (error.original) {
      errorMessage = error.original.sqlMessage || error.message;
    }

    res.status(500).json({
      error: errorMessage,
      userId,
      timestamp: new Date().toISOString(),
      details: error.message,
    });
  }
};

module.exports = {
  getTransactionsByUserId,
  formatTransactionsForFrontend,
};
