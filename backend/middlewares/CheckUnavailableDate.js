const UnavailableDate = require("../models/UnavailableDateModel");

const checkUnavailableDate = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
    const unavailableDates = await UnavailableDate.findAll({ attributes: ['date'] });

    const isUnavailable = unavailableDates.some(
      (entry) => new Date(entry.date).toISOString().split("T")[0] === today
    );

    if (isUnavailable) {
      return res.status(403).json({ message: "This action is not allowed on unavailable dates." });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error checking unavailable dates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = checkUnavailableDate;
