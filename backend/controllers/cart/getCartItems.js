const { models } = require("../../models/index");

const getCartItems = async (req, res) => {
  const user_id = req.user.userId;
  try {
    const cartItems = await models.Cart.findAll({
      where: { user_id: user_id },
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

    const formattedCart = enrichedCartItems.map((cartItem) => ({
      id: cartItem.id,
      userId: cartItem.user_id,
      itemId: cartItem.item_id,
      name: cartItem.item_name,
      specs: cartItem.specs,
      dateId: cartItem.date,
      durationId: cartItem.duration,
      itemType: cartItem.transaction_type,
      price: cartItem.price,
      status: cartItem.status,
      owner: {
        id: cartItem.owner.user_id,
        fname: cartItem.owner.first_name,
        lname: cartItem.owner.last_name,
      },
    }));

    return res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
};

module.exports = getCartItems;
