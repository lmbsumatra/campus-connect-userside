const { Op } = require("sequelize");
const { models } = require("../../models");
const { sequelize } = require("../../models/index");

const getStudentById = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const studentId = req.params.id; // Get the studentId from the request params

  try {
    // Find the specific student based on studentId
    const user = await models.User.findOne({
      where: {
        user_id: studentId,
        role: "student", // Ensure the user is a student
      },
      include: [
        {
          model: models.Student,
          as: "student",
          required: true,
          attributes: [
            "tup_id",
            "college",
            "scanned_id",
            "photo_with_id",
            "profile_pic",
            "course",
            "status",
            "status_message",
            "restricted_until",
          ],
        },
      ],
    });

    // Debugging logs
    // console.log("Fetched user:", JSON.stringify(user, null, 2));
    // console.log("Raw student data:", user?.student || "No student data");
    // console.log("Raw status_message:", user?.student?.status_message || "NULL or Undefined");

    if (!user) {
      return res.status(404).json({ error: "Student not found!" });
    }

    // Check the follow status with the logged-in user
    const isFollowing = await models.Follow.findOne({
      where: { followee_id: user.user_id, follower_id: loggedInUserId },
    });

    const isFollowedBy = await models.Follow.findOne({
      where: {
        followee_id: loggedInUserId,
        follower_id: user.user_id,
      },
    });

    // Get the average rating for this user from all reviews where they were the reviewee
    const userRating = await models.ReviewAndRate.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rate")), "averageRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
      ],
      where: {
        reviewee_id: user.user_id,
        review_type: { [Op.in]: ["owner", "renter"] },
      },
      raw: true,
    });

    // Format the rating to one decimal place if it exists
    const averageRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";

    const totalReviews = userRating?.totalReviews || 0;

    let action = "Follow";

    if (loggedInUserId === user.user_id) {
      action = "You";
    } else if (isFollowedBy && isFollowing) {
      action = "Following";
    } else if (isFollowedBy) {
      action = "Follow back";
    } else if (isFollowing) {
      action = "Following";
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
        rating: averageRating,
        hasStripe: !!(user.is_stripe_completed && user.stripe_acct_id),
      },
      student: user.student
        ? {
            id: user.student.tup_id,
            college: user.student.college,
            scannedId: user.student.scanned_id,
            photoWithId: user.student.photo_with_id,
            profilePic: user.student.profile_pic,
            course: user.student.course,
            status: user.student.status,
            statusMsg:
              user.student.status_message || "No status message available",
            restrictedUntil: user.student.restricted_until,
          }
        : null, // If student is null, return null instead of an empty object
      action: action,
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    // console.error("Error fetching student by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getStudentById;
