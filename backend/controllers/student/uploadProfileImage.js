const { rollbackUpload } = require("../../config/multer");
const { models } = require("../../models");


const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = req.params.userId; // Extract user_id from route parameters
  const imageUrl = req.file.path; // Path of the uploaded file

  try {
    // Find the student record associated with the given user_id
    const student = await models.Student.findOne({
      where: { user_id: userId },
    });
    if (!student) {
      // Rollback uploaded image if student is not found
      await rollbackUpload([imageUrl]);
      return res.status(404).json({ error: "Student not found" });
    }

    // Update the profile_pic column with the uploaded image URL
    student.profile_pic = imageUrl;
    await student.save();

    // console.log(student, student.profile_pic)

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    // console.error("Error updating profile picture:", error);

    // Rollback uploaded image in case of an error
    await rollbackUpload([imageUrl]);

    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = uploadProfileImage;
