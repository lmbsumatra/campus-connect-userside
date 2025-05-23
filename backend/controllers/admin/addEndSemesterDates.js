// Add a new end-semester date
const EndSemesterDate = require("../../models/EndSemesterDate");

const addEndSemesterDate = async (req, res) => {
  const { date, description } = req.body;

  if (!date || !description) {
    return res
      .status(400)
      .json({ message: "Date and description are required" });
  }

  try {
    // Check if the date already exists
    const existingDate = await EndSemesterDate.findOne({
      where: { date: new Date(date) },
    });
    if (existingDate) {
      return res.status(409).json({ message: "This date already exists." });
    }

    // Add the new date
    const newDate = await EndSemesterDate.create({ date, description });
    res.status(201).json(newDate);
  } catch (error) {
    // console.error("Error creating end-semester date:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = addEndSemesterDate;
