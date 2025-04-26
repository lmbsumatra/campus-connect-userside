const { models } = require("../../models");
const Fuse = require("fuse.js");
const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");

const getUsers = async (req, res) => {
  const loggedInUserId = req.user.userId;

  try {
    const users = await models.User.findAll({
      where: {
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

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found!" });
    }

    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const [isFollowing, isFollowedBy, org, userRating] = await Promise.all([
          models.Follow.findOne({
            where: { followee_id: user.user_id, follower_id: loggedInUserId },
          }),
          models.Follow.findOne({
            where: {
              followee_id: loggedInUserId,
              follower_id: user.user_id,
            },
          }),
          models.Org.findOne({
            where: { user_id: user.user_id },
            include: [
              { model: models.OrgCategory, as: "category" },
              { model: models.User, as: "representative" },
            ],
          }),
          models.ReviewAndRate.findOne({
            attributes: [
              [sequelize.fn("AVG", sequelize.col("rate")), "averageRating"],
              [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
            ],
            where: {
              reviewee_id: user.user_id,
              review_type: { [Op.in]: ["owner", "renter"] },
            },
            raw: true,
          }),
        ]);

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

        const averageRating = userRating?.averageRating
          ? parseFloat(userRating.averageRating).toFixed(1)
          : "0.0";

        const totalReviews = userRating?.totalReviews || 0;

        return {
          id: user.user_id,
          fname: user.first_name,
          mname: user.middle_name,
          lname: user.last_name,
          college: user.student.college,
          profilePic: user.student.profile_pic,
          rating: averageRating || 0,
          course: user.student.course,
          ratingCount: totalReviews,
          mutuals: "to be added",
          action: action,
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
        };
      })
    );

    const { q } = req.query;
    if (q) {
      const fuse = new Fuse(formattedUsers, {
        keys: ["fname", "mname", "lname", "college"],
      });
      const results = fuse.search(q).map((result) => result.item);
      return res.status(200).json(results.length ? results : []);
    }

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUsers;
