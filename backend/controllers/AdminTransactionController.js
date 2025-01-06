const { models } = require("../models/index");
const BuyAndSellTransaction = models.BuyAndSellTransaction;
const RentalTransaction = models.RentalTransaction;

exports.getAllTransactions = async (req, res) => {
  try {
    // Fetch Buy & Sell transactions
    const buyAndSellTransactions = await BuyAndSellTransaction.findAll({
      include: [
        {
          model: models.User,
          as: "buyer",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    // Fetch Rental transactions
    const rentalTransactions = await RentalTransaction.findAll({
      include: [
        {
          model: models.User,
          as: "renter",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.User,
          as: "owner",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    console.log(rentalTransactions);

    // Combine and return transactions
    const transactions = [
      // ...buyAndSellTransactions.map((tx) => ({ ...tx.toJSON(), type: "buy_and_sell" })),
      ...rentalTransactions.map((tx) => ({ ...tx.toJSON(), type: "rental" })),
    ];

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(`Fetching transaction with ID: ${id}`); // Add log for debugging

    let transaction = await BuyAndSellTransaction.findOne({
      where: { id },
      include: [
        {
          model: models.User,
          as: "buyer",
          attributes: ["user_id", "first_name", "last_name"],
        },
        {
          model: models.User,
          as: "seller",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    if (transaction) {
      transaction = { ...transaction.toJSON(), type: "buy_and_sell" };
    } else {
      // console.log(`Transaction not found in BuyAndSellTransaction model, searching in RentalTransaction.`);
      transaction = await RentalTransaction.findOne({
        where: { id },
        include: [
          {
            model: models.User,
            as: "renter",
            attributes: ["user_id", "first_name", "last_name"],
          },
          {
            model: models.User,
            as: "owner",
            attributes: ["user_id", "first_name", "last_name"],
          },
        ],
      });

      if (transaction) {
        transaction = { ...transaction.toJSON(), type: "rental" };
      }
    }

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error); // Log any error that occurs
    res.status(500).json({ error: "Failed to fetch transaction." });
  }
};
