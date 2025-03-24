const UnavailableDate = require("../../models/UnavailableDateModel");

// GET request to display an unavailable date
const getUnavailableDates = async (req, res) => {
  try {
    const dates = await UnavailableDate.findAll(); // This should work if the model is set up correctly
    res.status(200).json(dates);
  } catch (error) {
    // console.error("Error fetching dates:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = getUnavailableDates;
