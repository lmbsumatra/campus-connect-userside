const { models } = require("../models"); // Adjust the path to your models

// Fetch user names based on user_id
const getUserNames = async (userId) => {
  try {
    const user = await models.User.findByPk(userId, {
      attributes: ["first_name", "last_name"],
    });

    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  } catch (error) {
    console.error(`Error fetching user names for ID ${userId}:`, error);
    return "Unknown User";
  }
};

// Fetch rental item name based on item_id
const getRentalItemName = async (itemId) => {
  try {
    const item = await models.Listing.findByPk(itemId, {
      attributes: ["listing_name"],
    });

    return item ? item.listing_name : "Unknown Item";
  } catch (error) {
    console.error(`Error fetching item name for ID ${itemId}:`, error);
    return "Unknown Item";
  }
};

module.exports = {
  getUserNames,
  getRentalItemName,
};
