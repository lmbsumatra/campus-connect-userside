// DELETE request to remove an unavailable date
const UnavailableDate = require("../../models/UnavailableDateModel");

const deleteUnavailableDate = async (req, res) => {
  const { date } = req.params; // Get the date from URL parameter

  try {
    // Convert the string date to a Date object (assuming your database uses a date type)
    const deletedDate = await UnavailableDate.destroy({
      where: { date: new Date(date) }, // Make sure this matches your DB schema
    });

    if (deletedDate) {
      return res.status(200).json({ message: "Date removed successfully" });
    } else {
      return res.status(404).json({ message: "Date not found" });
    }
  } catch (error) {
    // console.error("Error removing date:", error);
    return res.status(500).json({ message: "Failed to remove date" });
  }
};

module.exports = deleteUnavailableDate;
