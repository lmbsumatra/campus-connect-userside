// Import necessary models
const { models } = require("../../models/index");

// Controller function to get all cart items for a user
exports.getCartItems = async (req, res) => {
  try {
    //   const { user_id } = req.query; // Filter by user_id if provided
    const user_id = 48;

    // Fetch cart items with associations (optional)
    const cartItems = await models.Cart.findAll({
      where: { user_id: user_id }, // If user_id is provided, filter results
    //   include: [
    //     {
    //       model: models.User,
    //       as: "user", // Fetch user details
    //       attributes: ["user_id", "first_name", "last_name"], // Include specific user fields
    //     },
    //     {
    //       model: models.User,
    //       as: "owner", // Fetch owner details
    //       attributes: ["user_id", "first_name", "last_name"],
    //     },
    //     {
    //       model: models.Listing,
    //       as: "item", // Fetch item details if it's a listing
    //       attributes: ["id", "title", "price"],
    //     },
    //     {
    //       model: models.ItemForSale,
    //       as: "item", // Fetch item details if it's for sale
    //       attributes: ["id", "title", "price"],
    //     },
    //     {
    //       model: models.Date,
    //       as: "date",
    //       attributes: ["id", "date_value"],
    //     },
    //     {
    //       model: models.Duration,
    //       as: "duration",
    //       attributes: ["id", "duration_value"],
    //     },
    //   ],
    });
    return res
      .status(200)
      .json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
};
