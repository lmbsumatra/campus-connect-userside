const { models } = require("../../models");
const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");

const getUserById = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const userId = req.params.id;

  try {
    // Fetch the user with student info
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
      return res.status(404).json({ error: "User not found!" });
    }

    // Fetch org where this user is a representative
    const org = await models.Org.findOne({
      where: { user_id: userId },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    const isRepresentative = !!org;

    // Follow/followed-by logic
    const isFollowing = await models.Follow.findOne({
      where: { followee_id: user.user_id, follower_id: loggedInUserId },
    });

    const isFollowedBy = await models.Follow.findOne({
      where: { followee_id: loggedInUserId, follower_id: user.user_id },
    });

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

    // Get average rating
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

    const averageRating = userRating?.averageRating
      ? parseFloat(userRating.averageRating).toFixed(1)
      : "0.0";

    const totalReviews = userRating?.totalReviews || 0;

    const formattedUser = {
      user: {
        id: user.user_id,
        fname: user.first_name,
        mname: user.middle_name,
        lname: user.last_name,
        role: user.role,
        emailVerified: user.email_verified,
        stripeAcctId: user.stripe_acct_id,
        email: user.email,
        joinDate: user.createdAt,
        rating: averageRating || 0,
        ratingCount: totalReviews,
        isRepresentative: isRepresentative,
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
        id: user.student.tup_id,
        college: user.student.college,
        scannedId: user.student.scanned_id,
        photoWithId: user.student.photo_with_id,
        profilePic: user.student.profile_pic,
        course: user.student.course,
      },
      action: action,
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUserById;
