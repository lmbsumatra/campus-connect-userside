const { models } = require("../models/index");
const BuyAndSellTransaction = models.BuyAndSellTransaction;
const RentalTransaction = models.RentalTransaction;

exports.getAllTransactions = async (req, res) => {
  try {
    // Fetch Buy & Sell transactions
    const buyAndSellTransactions = await BuyAndSellTransaction.findAll({
      include: [
        { model: models.User, as: "buyer", attributes: ["user_id", "first_name", "last_name"] },
        { model: models.User, as: "seller", attributes: ["user_id", "first_name", "last_name"] },
      ],
    });

    // Fetch Rental transactions
    const rentalTransactions = await RentalTransaction.findAll({
      include: [
        { model: models.User, as: "renter", attributes: ["user_id", "first_name", "last_name"] },
        { model: models.User, as: "owner", attributes: ["user_id", "first_name", "last_name"] },
      ],
    });

    // Combine and return transactions
    const transactions = [
      ...buyAndSellTransactions.map((tx) => ({ ...tx.toJSON(), type: "buy_and_sell" })),
      ...rentalTransactions.map((tx) => ({ ...tx.toJSON(), type: "rental" })),
    ];

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};
