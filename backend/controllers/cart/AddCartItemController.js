const { models } = require("../../models/index");

exports.addCartItem = async (req, res) => {
  console.log("Request received to add item to cart:", req.body); 

  try {
    const {
      user_id,
      owner_id,
      item_id,
      transaction_type,
      date,
      duration,
      price,
    } = req.body;

    if (
      !user_id ||
      !owner_id ||
      !item_id ||
      !transaction_type ||
      !date ||
      !duration
    ) {
      const missingFields = [
        !user_id && "user_id",
        !owner_id && "owner_id",
        !item_id && "item_id",
        !transaction_type && "transaction_type",
        !date && "date",
        !duration && "duration",
      ].filter(Boolean);
      return res
        .status(400)
        .json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

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

    const owner = await models.User.findOne({
      where: { user_id: owner_id },
      attributes: ["user_id", "first_name", "last_name"], 
    });

    return res.status(201).json({
      ...newCartItem.dataValues, 
      item_name, 
      specs: specsData, 
      owner: owner ? owner.dataValues : null, 
    });
  } catch (error) {
    const errorResponse = {
      message: "Failed to add item to cart",
      error: error.message, 
      errorDetails: error.errors || [], 
    };

    console.error("Error response:", JSON.stringify(errorResponse, null, 2)); 

    return res.status(500).json(errorResponse);
  }
};
