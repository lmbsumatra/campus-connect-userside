// Create this file as adminUpdateStudentSlots.js in your controllers directory

const { models } = require("../../models/index");

const updateStudentSlots = async (req, res) => {
  try {
    const { studentId, post_slot, item_slot, listing_slot } = req.body;
    
    // Check if admin is authenticated
    if (!req.adminUser || !req.adminUser.adminId) {
      return res.status(401).json({ error: "Unauthorized. Admin access required." });
    }

    // Validate input
    if (!studentId || post_slot === undefined || item_slot === undefined || listing_slot === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: studentId, post_slot, item_slot, and listing_slot are required." 
      });
    }

    // Ensure slot values are non-negative integers
    if (post_slot < 0 || item_slot < 0 || listing_slot < 0) {
      return res.status(400).json({ error: "Slot values must be non-negative integers." });
    }

    // Update the student record
    const [updatedRows] = await models.Student.update(
      {
        post_slot: post_slot,
        item_slot: item_slot,
        listing_slot: listing_slot
      },
      {
        where: { id: studentId }
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Student not found or no changes made." });
    }

    // Fetch the updated student record
    const updatedStudent = await models.Student.findByPk(studentId);

    return res.status(200).json({
      message: "Student slot counts updated successfully.",
      student: updatedStudent
    });
    
  } catch (error) {
    console.error("Error updating student slots:", error);
    return res.status(500).json({ error: "Internal server error while updating slots" });
  }
};

module.exports = updateStudentSlots;