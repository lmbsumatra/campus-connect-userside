const { models } = require("../../models/index");

const addCartItem = async (req, res) => {
  const user_id = req.user.userId;
  // console.log("Authenticated User:", req.user);
  // console.log("Request received to add item to cart:", req.body);

  try {
    const { ownerId, itemId, itemType, dateId, durationId, price } = req.body;

    // Validate required fields
    if (!ownerId || !itemId || !itemType || !dateId || !durationId) {
      const missingFields = [
        !ownerId && "ownerId",
        !itemId && "itemId",
        !itemType && "itemType",
        !dateId && "dateId",
        !durationId && "durationId",
      ].filter(Boolean);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if the user exists
    const user = await models.User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if the owner exists
    const owner = await models.User.findOne({ where: { user_id: ownerId } });
    if (!owner) {
      return res.status(400).json({ message: "Owner not found." });
    }

    // Create a new cart item
    const newCartItem = await models.Cart.create({
      user_id,
      owner_id: ownerId,
      item_id: itemId,
      transaction_type: itemType,
      date: dateId,
      duration: durationId,
      price,
      status: "pending",
    });

    let itemDetails;
    let itemName = "";
    let specsData = {};

    // Fetch item details based on transaction type
    if (itemType === "buy") {
      itemDetails = await models.ItemForSale.findOne({
        where: { id: itemId },
        attributes: ["item_for_sale_name", "specifications"],
      });
      itemName = itemDetails ? itemDetails.dataValues.item_for_sale_name : "";
    } else {
      itemDetails = await models.Listing.findOne({
        where: { id: itemId },
        attributes: ["listing_name", "specifications"],
      });
      itemName = itemDetails ? itemDetails.dataValues.listing_name : "";
    }

    specsData =
      itemDetails &&
      itemDetails.dataValues &&
      itemDetails.dataValues.specifications
        ? JSON.parse(itemDetails.dataValues.specifications)
        : {};

    const addedCartItem = {
      ...newCartItem.dataValues,
      itemName,
      specs: specsData,
      owner: owner ? owner.dataValues : null,
    };

    const formattedItem = {
      id: addedCartItem.id,
      userId: addedCartItem.user_id,
      itemId: addedCartItem.item_id,
      name: addedCartItem.itemName,
      specs: addedCartItem.specs,
      dateId: addedCartItem.date,
      durationId: addedCartItem.duration,
      itemType: addedCartItem.transaction_type,
      price: addedCartItem.price,
      status: addedCartItem.status,
      owner: {
        id: addedCartItem.owner.user_id,
        fname: addedCartItem.owner.first_name,
        lname: addedCartItem.owner.last_name,
      },
    };

    // Return success response
    return res.status(201).json(formattedItem);
  } catch (error) {
    // Log the full error for debugging
    console.error("Error adding item to cart:", error);

    // Return detailed error response
    return res.status(500).json({
      message: "Failed to add item to cart",
      error: error.message,
      details: error.errors || error.stack || [],
    });
  }
};

module.exports = addCartItem;
