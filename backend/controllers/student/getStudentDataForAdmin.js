const { models } = require("../../models");

const getStudentDataForAdmin = async (req, res) => {
  const userId = req.params.id; // Student ID

  try {
    // Fetch student user data
    const user = await models.User.findOne({
      where: {
        user_id: userId,
        role: "student",
      },
      include: [
        {
          model: models.Student,
          as: "student",
          required: true,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Student not found!" });
    }

   
    const formattedUser = {
      user: {
        fname: user.first_name,
        mname: user.middle_name,
        lname: user.last_name,
        role: user.role,
        emailVerified: user.email_verified,
        stripeAcctId: user.stripe_acct_id,
        email: user.email,
        joinDate: user.createdAt,
      },
      student: {
        id: user.student.id,  // Use the primary key ID
        tupId: user.student.tup_id,
        college: user.student.college,
        scannedId: user.student.scanned_id,
        photoWithId: user.student.photo_with_id,
        profilePic: user.student.profile_pic,
        status: user.student.status,
      },
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching student data (Admin):", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getStudentDataForAdmin;
