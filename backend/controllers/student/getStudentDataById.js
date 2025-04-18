const { Op } = require("sequelize");
const { models } = require("../../models");
const { sequelize } = require("../../models/index");

const getStudentById = async (req, res) => {
  const loggedInUserId = req.params.id;
  const studentId = req.params.id;

  try {
    const user = await models.User.findOne({
      where: {
        user_id: studentId,
        role: "student",
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
            "item_slot",
            "listing_slot",
            "post_slot",
          ],
        },
        {
          model: models.ItemForSale,
          as: "items",
          required: true,
          attributes: ["id"], 
        },
        {
          model: models.Listing,
          as: "listings",
          required: true,
          attributes: ["id"],
        },
        {
          model: models.Post,
          as: "posts",
          required: true,
          attributes: ["id"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Student not found!" });
    }

    const org = await models.Org.findOne({
      where: { user_id: user.user_id },
      include: [
        { model: models.OrgCategory, as: "category" },
        { model: models.User, as: "representative" },
      ],
    });

    const isRepresentative = !!org;

    if (
      user.student &&
      user.student.status === "restricted" &&
      user.student.restricted_until
    ) {
      const now = new Date();
      if (new Date(user.student.restricted_until) <= now) {
        await user.student.update({
          status: "verified",
          status_message: `Restriction expired on ${now.toLocaleDateString()}. Account automatically reactivated.`,
          restricted_until: null,
        });

        await user.student.reload();
      }
    }

    const isFollowing = await models.Follow.findOne({
      where: { followee_id: user.user_id, follower_id: loggedInUserId },
    });

    const isFollowedBy = await models.Follow.findOne({
      where: {
        followee_id: loggedInUserId,
        follower_id: user.user_id,
      },
    });

    let action = "Follow";
    if (loggedInUserId === user.user_id) action = "You";
    else if (isFollowedBy && isFollowing) action = "Following";
    else if (isFollowedBy) action = "Follow back";
    else if (isFollowing) action = "Following";

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

    const counts = {
      itemForSale: user?.items?.length || 0,
      listingForRent: user?.listings?.length || 0,
      postLookingForItem: user?.posts?.length || 0,
    };

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
        ratingCount: totalReviews,
        hasStripe: !!(user.is_stripe_completed && user.stripe_acct_id),
        isRepresentative,
        organization: org
          ? {
              id: org.org_id,
              name: org.name,
              description: org.description,
              logo: org.logo,
              isVerified: org.is_verified,
              isActive: org.is_active,
              category: org.category_id
                ? {
                    id: org.category.id,
                    name: org.category.name,
                  }
                : null,
              createdAt: org.created_at,
              updatedAt: org.updated_at,
            }
          : null,
      },
      student: user.student
        ? {
            id: user.student.tup_id,
            college: user.student.college,
            course: user.student.course,
            scannedId: user.student.scanned_id,
            photoWithId: user.student.photo_with_id,
            profilePic: user.student.profile_pic,
            status: user.student.status,
            statusMsg:
              user.student.status_message || "No status message available",
            restrictedUntil: user.student.restricted_until,
            itemSlot: user.student.item_slot,
            listingSlot: user.student.listing_slot,
            postSlot: user.student.post_slot,
          }
        : null,
      action: action,
      counts,
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getStudentById;
