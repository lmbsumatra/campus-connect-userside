const { models } = require("../../models");

const updateProfile = async (req, res) => {
  try {
    // Custom validation logic
    const userId = req.user.userId;
    const errors = [];

    if (req.body.fname && typeof req.body.fname !== "string")
      errors.push({ field: "fname", message: "First name must be a string." });
    if (req.body.lname && typeof req.body.lname !== "string")
      errors.push({ field: "lname", message: "Last name must be a string." });
    if (req.body.mname && typeof req.body.mname !== "string")
      errors.push({ field: "mname", message: "Middle name must be a string." });

    if (
      req.body.year &&
      (!Number.isInteger(req.body.year) || req.body.year <= 0)
    )
      errors.push({
        field: "year",
        message: "Year must be a positive integer.",
      });
    if (req.body.college && typeof req.body.college !== "string")
      errors.push({ field: "college", message: "College must be a string." });
    if (req.body.course && typeof req.body.course !== "string")
      errors.push({ field: "course", message: "Course must be a string." });

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (req.body.fname || req.body.lname || req.body.mname) {
      const userUpdateData = {};

      if (req.body.fname) userUpdateData.first_name = req.body.fname;
      if (req.body.lname) userUpdateData.last_name = req.body.lname;
      if (req.body.mname) userUpdateData.middle_name = req.body.mname;

      await models.User.update(userUpdateData, {
        where: { user_id: userId },
      });
    }

    // Update student information
    if (req.body.year || req.body.college || req.body.course) {
      const studentUpdateData = {};

      if (req.body.year) studentUpdateData.year = req.body.year;
      if (req.body.college) studentUpdateData.college = req.body.college;
      if (req.body.course) studentUpdateData.course = req.body.course;

      await models.Student.update(studentUpdateData, {
        where: { user_id: userId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating your profile",
    });
  }
};

module.exports = updateProfile;
