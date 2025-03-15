const EndSemesterDate = require("../../models/EndSemesterDate");
const UnavailableDate = require("../../models/UnavailableDateModel");

const allUnavailableDates = async (req, res) => {
  try {
    const endSemesterDates = await EndSemesterDate.findAll();
    const unavailableDates = await UnavailableDate.findAll();

    res.status(200).json({
      endSemesterDates,
      unavailableDates,
    });
  } catch (error) {
    console.error("Error fetching dates:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = allUnavailableDates;
