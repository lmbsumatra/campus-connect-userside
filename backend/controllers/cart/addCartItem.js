const { models } = require("../../models/index");

const addCartItem = async (req, res) => {
  // Log the incoming request body for debugging
  const user_id = req.user.userId;
  console.log("Request received to add item to cart:", req.body);

  try {
    const {
      owner_id,
      item_id,
      transaction_type,
      date,
      duration,
      price,
    } = req.body;

    if (
      !owner_id ||
      !item_id ||
      !transaction_type ||
      !date ||
      !duration
    ) {
      const missingFields = [
        !owner_id && "owner_id",
        !item_id && "item_id",
        !transaction_type && "transaction_type",
        !date && "date",
        !duration && "duration",
      ].filter(Boolean);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if the user exists
    const user = await models.User.findOne({
      where: { user_id },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    // Check if the owner exists
    const owner = await models.User.findOne({
      where: { user_id: owner_id },
    });

    if (!owner) {
      return res.status(400).json({
        message: "Owner not found.",
      });
    }

    // Create a new cart item
    const newCartItem = await models.Cart.create({
      user_id,
      owner_id,
      item_id,
      transaction_type,
      date,
      duration,
      price,
      status: "pending",
    });

    let item;
    let item_name = "";
    let specsData = {};

    // Fetch item details based on transaction type
    if (transaction_type === "buy") {
      item = await models.ItemForSale.findOne({
        where: { id: item_id },
        attributes: ["item_for_sale_name", "specifications"],
      });
      item_name = item ? item.dataValues.item_for_sale_name : "";
    } else {
      item = await models.Listing.findOne({
        where: { id: item_id },
        attributes: ["listing_name", "specifications"],
      });
      item_name = item ? item.dataValues.listing_name : "";
    }

    specsData =
      item && item.dataValues && item.dataValues.specifications
        ? JSON.parse(item.dataValues.specifications)
        : {};

    // Return success response
    return res.status(201).json({
      ...newCartItem.dataValues,
      item_name,
      specs: specsData,
      owner: owner ? owner.dataValues : null,
    });
  } catch (error) {
    // Log the full error for debugging
    console.error("Error adding item to cart:", error); // Log full error for debugging

    // Return detailed error response to the client
    const errorResponse = {
      message: "Failed to add item to cart",
      error: error.message,
      errorDetails: error.errors || error.stack || [], // Include stack trace for better error tracing
    };

    return res.status(500).json(errorResponse);
  }
};

module.exports = addCartItem;
