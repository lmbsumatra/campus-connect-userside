const { models } = require("../../models/index");

exports.removeCartItem = async (req, res) => {
  try {
    const { cart_item_id } = req.params; 

    if (!cart_item_id) {
      return res.status(400).json({ message: "cart_item_id is required" });
    }

    const cartItem = await models.Cart.findOne({
      where: { id: cart_item_id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();

    return res
      .status(200)
      .json({ message: "Item removed from cart", data: cartItem });
  } catch (error) {
    const errorResponse = {
      message: "Failed to remove item from cart",
      error: error.message, 
      errorDetails: error.errors || [], 
    };

    console.error("Error response:", JSON.stringify(errorResponse, null, 2)); 

    return res.status(500).json(errorResponse);
  }
};
