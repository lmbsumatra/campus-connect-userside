const { models } = require("../../models/index");

const updateCartQuantity = async (req, res) => {
  const user_id = req.user.userId;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!cartItemId || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "Cart item ID and quantity are required." });
  }

  try {
    const cartItem = await models.Cart.findOne({
      where: {
        id: cartItemId,
        user_id: user_id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    let unitPrice = 0;

    // Check transaction type and fetch item info accordingly
    if (cartItem.transaction_type === "buy") {
      const itemForSale = await models.ItemForSale.findOne({
        where: { id: cartItem.item_id },
        attributes: ["price", "current_stock"],
      });

      if (!itemForSale) {
        return res.status(404).json({ message: "Associated item not found." });
      }

      if (quantity > itemForSale.current_stock) {
        return res.status(400).json({
          message: `Only ${itemForSale.current_stock} item(s) in stock.`,
        });
      }

      unitPrice = itemForSale.price;
    } else if (cartItem.transaction_type === "rent") {
      const itemForRent = await models.ItemForRent.findOne({
        where: { id: cartItem.item_id },
        attributes: ["price"],
      });

      if (!itemForRent) {
        return res.status(404).json({ message: "Associated item not found." });
      }

      unitPrice = itemForRent.price;
    }

    // Update quantity and price
    cartItem.quantity = quantity;
    cartItem.price = unitPrice * quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cart item quantity and price updated successfully.",
      updatedItem: {
        id: cartItem.id,
        quantity: cartItem.quantity,
        price: cartItem.price,
      },
    });
  } catch (error) {
    console.error("Error updating cart quantity and price:", error);
    return res
      .status(500)
      .json({ message: "Failed to update cart item." });
  }
};

module.exports = updateCartQuantity;
