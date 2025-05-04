const { Op } = require("sequelize");
const { models } = require("../../models");
const { GCASH } = require("../../utils/constants");
const stripe = require("stripe")(
  "sk_test_51Qd6OGJyLaBvZZCypqCCmDPuXcuaTI1pH4j2Jxhj1GvnD4WuL42jRbQhEorchvZMznXhbXew0l33ZDplhuyRPVtp00iHoX6Lpd"
);

const formatTransactionsForFrontend = (transactions, userId) => {
  const rentalTransactions = transactions.filter(
    (tx) => tx.transaction_type === "rental"
  );
  const saleTransactions = transactions.filter(
    (tx) => tx.transaction_type === "sell"
  );

  const stats = {
    totalTransactions: transactions.length,
    rentalTransactions: rentalTransactions.length,
    saleTransactions: saleTransactions.length,

    revenue: transactions
      .filter(
        (tx) => tx.status === "Completed" && tx.owner_id === Number(userId)
      )
      .reduce((sum, tx) => sum + (tx.revenue || 0), 0),

    successfulTransactions: transactions.filter(
      (tx) => tx.status === "Completed"
    ).length,

    pendingTransactions: transactions.filter((tx) => tx.status === "Requested")
      .length,
    cancelledTransactions: transactions.filter(
      (tx) => tx.status === "Cancelled"
    ).length,
  };

  const formattedTransactions = transactions.map((tx) => {
    const userRole = getUserRole(tx, userId);

    const counterparty = getCounterparty(tx, userId);

    const formattedDate = tx.Date
      ? new Date(tx.Date.date).toLocaleDateString()
      : "N/A";

    let timeRange = "N/A";
    if (tx.Duration) {
      const from = tx.Duration.rental_time_from?.slice(0, 5) || "";
      const to = tx.Duration.rental_time_to?.slice(0, 5) || "";
      timeRange = from && to ? `${from} - ${to}` : "N/A";
    }

    const transactionTypeName =
      tx.transaction_type === "rental" ? "Rental" : "Purchase";

    const itemName =
      tx.item?.[
        tx.transaction_type === "rental" ? "listing_name" : "item_for_sale_name"
      ] || "Unknown Item";
    const itemPrice =
      tx.item?.[tx.transaction_type === "rental" ? "rate" : "price"] || "0";

    const paymentStatus = tx.stripe_payment_intent_id
      ? "Processing"
      : tx.payment_status || "Pending";

    return {
      id: tx.id,
      transactionType: transactionTypeName,
      // is_allowed_to_proceed: tx.is_allowed_to_proceed, // aye, just comment this line to remove restriction ye
      // is_allowed_to_cancel: tx.is_allowed_to_cancel, // aye, just comment this line to remove restriction ye
      is_allowed_to_proceed: true,
      is_allowed_to_cancel: true,
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
      tx,
    };
  });

  return {
    stats,
    transactions: formattedTransactions,
  };
};

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

const getCounterparty = (transaction, userId) => {
  if (transaction.owner_id === Number(userId)) {
    return transaction.transaction_type === "rental"
      ? transaction.renter
      : transaction.buyer;
  } else {
    return transaction.owner;
  }
};

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
      order: [["createdAt", "DESC"]],
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        error: "No transactions found for this user.",
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    const processedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const transactionData = transaction.toJSON();

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

          if (listing && listing.images && listing.images.length > 0) {
            listing.images = [JSON.parse(listing.images)[0]];
          }

          transactionData.item = listing;

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

          if (saleItem && saleItem.images && saleItem.images.length > 0) {
            saleItem.images = [JSON.parse(saleItem.images)[0]];
          }

          transactionData.item = saleItem;

          if (saleItem) {
            transactionData.revenue = parseFloat(saleItem.price);
          }
        }

        if (transaction.post_id) {
          const post = await models.Post.findOne({
            where: { id: transaction.post_id },
            include: [
              {
                as: "renter",
                model: models.User,
                attributes: [
                  "user_id",
                  "email",
                  "stripe_acct_id",
                  "first_name",
                ],
              },
            ],
          });

          const messages = await models.Message.findAll({
            where: {
              isProductCard: 1,
            },
          });

          let foundProductDetails = null;

          if (messages && messages.length > 0) {
            for (const message of messages) {
              try {
                const parsedProductDetails = JSON.parse(message.productDetails);
                if (parsedProductDetails.productId === transaction.post_id) {
                  foundProductDetails = parsedProductDetails;
                  break;
                }
              } catch (error) {
                console.error(
                  "Error parsing productDetails in message:",
                  error
                );
              }
            }
          }

          if (foundProductDetails) {
            transactionData.item = {
              id: post?.id || transaction.post_id,
              item_for_sale_name:
                foundProductDetails.name ||
                post?.post_item_name ||
                "Unknown Item",
              listing_name:
                foundProductDetails.name ||
                post?.post_item_name ||
                "Unknown Item",
              description: post?.description || "",
              price: foundProductDetails.offerPrice || "0.00",
              rate: foundProductDetails.offerPrice || "0.00",
              images: foundProductDetails.image
                ? [foundProductDetails.image]
                : [],
            };

            transactionData.revenue = parseFloat(
              foundProductDetails.offerPrice || "0"
            );
          } else if (post) {
            transactionData.item = {
              id: post.id,
              item_for_sale_name: post.post_item_name || "Unknown Item",
              listing_name: post.post_item_name || "Unknown Item",
              description: post.description || "",
              price: "0.00",
              rate: "0.00",
              images: post.images ? JSON.parse(post.images) : [],
            };
          }
        }

        return transactionData;
      })
    );

    const formattedData = formatTransactionsForFrontend(
      processedTransactions,
      userId
    );

    res.json(formattedData);
  } catch (error) {
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
