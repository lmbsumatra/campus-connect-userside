const { models } = require("../../models/index");

exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartItems = await models.Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: models.User,
          required: false,
          attributes: ["user_id", "first_name", "last_name"],
          as: "owner",
        },
      ],
    });

    const enrichedCartItems = [];

    for (const cartItem of cartItems) {
      let specs = {};
      let item_name = "";

      let item;
      if (cartItem.transaction_type === "buy") {
        item = await models.ItemForSale.findOne({
          where: { id: cartItem.item_id },
          attributes: ["item_for_sale_name", "specifications"],
        });
        item_name = item ? item.dataValues.item_for_sale_name : "";
      } else {
        item = await models.Listing.findOne({
          where: { id: cartItem.item_id },
          attributes: ["listing_name", "specifications"],
        });

        item_name = item ? item.dataValues.listing_name : "";
      }

      specs =
        item && item.dataValues && item.dataValues.specifications
          ? JSON.parse(item.dataValues.specifications)
          : {};

      enrichedCartItems.push({
        ...cartItem.dataValues,
        item_name,
        specs,
      });
    }

    return res.status(200).json(enrichedCartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
};
