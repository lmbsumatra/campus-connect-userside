const UnavailableDate = require("../models/UnavailableDateModel");


const checkUnavailableDate = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
    const unavailableDates = await UnavailableDate.findAll({ attributes: ['date', 'description'] });

    const unavailableEntry = unavailableDates.find(
      (entry) => new Date(entry.date).toISOString().split("T")[0] === today
    );

    if (unavailableEntry) {
      // Notify the user with the reason
      const reason = unavailableEntry.description || "This date is unavailable.";
      return res.status(403).json({ 
        message: "This action is not allowed on unavailable dates.",
        reason: reason 
      });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // console.error("Error checking unavailable dates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = checkUnavailableDate;