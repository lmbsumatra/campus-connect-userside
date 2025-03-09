// Get all end-semester dates
const EndSemesterDate = require("../../models/EndSemesterDate");

const getEndSemesterDates = async (req, res) => {
  try {
    const dates = await EndSemesterDate.findAll(); // Use the correct model here
    res.status(200).json(dates);
  } catch (error) {
    console.error("Error fetching end-semester dates:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = getEndSemesterDates;
