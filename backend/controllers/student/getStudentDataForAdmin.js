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

    // Check if the student is an org representative
    const org = await models.Org.findOne({
      where: { user_id: userId },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    const formattedUser = {
      user: {
        fname: user.first_name,
        mname: user.middle_name,
        lname: user.last_name,
        role: user.role,
        listing_slot: user.student.listing_slot,
        post_slot: user.student.post_slot,
        item_slot: user.student.item_slot,

        emailVerified: user.email_verified,
        stripeAcctId: user.stripe_acct_id,
        email: user.email,
        joinDate: user.createdAt,
        isRepresentative: !!org,
        organization: org
          ? {
              id: org.org_id,
              name: org.name,
              description: org.description,
              logo: org.logo,
              isVerified: org.is_verified,
              isActive: org.is_active,
              createdAt: org.created_at,
              updatedAt: org.updated_at,
              category: org.category
                ? {
                    id: org.category.id,
                    name: org.category.name,
                  }
                : null,
              representative: org.representative
                ? {
                    id: org.representative.user_id,
                    email: org.representative.email,
                    name: `${org.representative.first_name} ${org.representative.last_name}`,
                  }
                : null,
            }
          : null,
      },
      student: {
        id: user.student.id, // Use the primary key ID
        tupId: user.student.tup_id,
        college: user.student.college,
        scannedId: user.student.scanned_id,
        photoWithId: user.student.photo_with_id,
        profilePic: user.student.profile_pic,
        status: user.student.status,
        course: user.student.course,
      },
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching student data (Admin):", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = getStudentDataForAdmin;
