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
        {
          model: models.Date,
          required: false,
          attributes: ["id", "date"],
          as: "transaction_date", 
        },
        {
          model: models.Duration,
          required: false,
          attributes: ["id", "rental_time_from", "rental_time_to"],
          as: "transaction_duration",
        },
      ],
    });

    const enrichedCartItems = [];

    for (const cartItem of cartItems) {
      let specs = {};
      let item_name = "";
      let item_image = "";
      let payment_mode = "";
      let security_deposit = null;
      let late_charges = null;

      let item;
      if (cartItem.transaction_type === "buy") {
        item = await models.ItemForSale.findOne({
          where: { id: cartItem.item_id },
          attributes: [
            "item_for_sale_name",
            "specifications",
            "images",
            "payment_mode",
            "current_stock",
          ],
        });
        if (item && item.dataValues.images) {
          try {
            const imagesArray = Array.isArray(item.dataValues.images)
              ? item.dataValues.images
              : JSON.parse(item.dataValues.images);
            item_image =
              imagesArray && imagesArray.length > 0 ? imagesArray[0] : "";
          } catch (error) {
            item_image = ""; 
          }
        }

        item_name = item ? item.dataValues.item_for_sale_name : "";
        stock = item ? item.dataValues.current_stock : "";
        if (item) {
          payment_mode = item.dataValues.payment_mode; 
        }
      } else {
        item = await models.Listing.findOne({
          where: { id: cartItem.item_id },
          attributes: [
            "listing_name",
            "specifications",
            "images",
            "payment_mode",
            "security_deposit",
            "late_charges",
          ],
        });

        if (item) {
          payment_mode = item.dataValues.payment_mode;
          security_deposit = item.dataValues.security_deposit;
          late_charges = item.dataValues.late_charges;
        }

        if (item && item.dataValues.images) {
          try {
            const imagesArray = Array.isArray(item.dataValues.images)
              ? item.dataValues.images
              : JSON.parse(item.dataValues.images);
            item_image =
              imagesArray && imagesArray.length > 0 ? imagesArray[0] : "";
          } catch (error) {
            item_image = "";
          }
        }
      }

      specs =
        item && item.dataValues && item.dataValues.specifications
          ? JSON.parse(item.dataValues.specifications)
          : {};

      enrichedCartItems.push({
        ...cartItem.dataValues,
        item_name,
        specs,
        item_image,
        payment_mode,
        late_charges,
        security_deposit,
        stock,
      });
    }

    const formattedCart = enrichedCartItems.map((cartItem) => ({
      id: cartItem.id,
      paymentMode: cartItem.payment_mode,
      userId: cartItem.user_id,
      itemId: cartItem.item_id,
      name: cartItem.item_name,
      specs: cartItem.specs,
      dateId: cartItem.date,
      durationId: cartItem.duration,
      itemType: cartItem.transaction_type,
      price: cartItem.price,
      status: cartItem.status,
      securityDeposit: cartItem.security_deposit,
      lateCharges: cartItem.late_charges,
      image: cartItem.item_image,
      dateId: cartItem.transaction_date?.id || null,
      date: cartItem.transaction_date?.date || null,
      durationId: cartItem.transaction_duration?.id || null,
      rentalTimeFrom: cartItem.transaction_duration?.rental_time_from || null,
      rentalTimeTo: cartItem.transaction_duration?.rental_time_to || null,
      owner: {
        id: cartItem.owner.user_id,
        fname: cartItem.owner.first_name,
        lname: cartItem.owner.last_name,
      },
      quantity: cartItem.quantity,
      stock: cartItem.stock,
    }));

    return res.status(200).json(formattedCart);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
};

module.exports = getCartItems;
