// Delete an end-semester date
const EndSemesterDate = require("../../models/EndSemesterDate");

const deleteEndSemesterDate = async (req, res) => {
  const { date } = req.params;

  try {
    const deletedDate = await EndSemesterDate.destroy({
      where: { date: new Date(date) },
    });

    if (deletedDate) {
      return res.status(200).json({ message: "Date removed successfully" });
    } else {
      return res.status(404).json({ message: "Date not found" });
    }
  } catch (error) {
    // console.error("Error removing end-semester date:", error);
    return res.status(500).json({ message: "Failed to remove date" });
  }
};

module.exports = deleteEndSemesterDate;
