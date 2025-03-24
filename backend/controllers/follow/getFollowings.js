const { models } = require("../../models");

const getFollowings = async (req, res) => {
  const loggedInUserId = req.user.userId;

  try {
    // Find all users that the logged-in user is following
    const followings = await models.Follow.findAll({
      where: { follower_id: loggedInUserId },
      include: [
        {
          model: models.User,
          as: "followee",
          required: true,
          include: [
            {
              model: models.Student,
              as: "student",
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Find all users that are following the logged-in user
    const followers = await models.Follow.findAll({
      where: { followee_id: loggedInUserId },
      include: [
        {
          model: models.User,
          as: "follower",
          required: true,
          include: [
            {
              model: models.Student,
              as: "student",
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!followings.length && !followers.length) {
      return res.status(200).json({ followings: [], followers: [] });
    }

    // Format followings
    const formattedFollowings = await Promise.all(
      followings.map(async (following) => {
        const user = following.followee;

        const followerCount = await models.Follow.count({
          where: { followee_id: user.user_id },
        });

        const followingCount = await models.Follow.count({
          where: { follower_id: user.user_id },
        });

        return {
          id: user.user_id,
          name: `${user.first_name} ${
            user.middle_name ? user.middle_name + " " : ""
          }${user.last_name}`,
          username: user.email.split("@")[0],
          profilePic: user.student?.profile_pic || null,
          college: user.student?.college || null,
          followers: followerCount,
          following: followingCount,
          isFollowing: true, // The logged-in user is following them
          action: "Following",
          joinDate: user.createdAt,
        };
      })
    );

    // Format followers
    const formattedFollowers = await Promise.all(
      followers.map(async (follower) => {
        const user = follower.follower;

        const followerCount = await models.Follow.count({
          where: { followee_id: user.user_id },
        });

        const followingCount = await models.Follow.count({
          where: { follower_id: user.user_id },
        });

        return {
          id: user.user_id,
          name: `${user.first_name} ${
            user.middle_name ? user.middle_name + " " : ""
          }${user.last_name}`,
          username: user.email.split("@")[0],
          profilePic: user.student?.profile_pic || null,
          college: user.student?.college || null,
          followers: followerCount,
          following: followingCount,
          isFollowing: followings.some((f) => f.followee.user_id === user.user_id), // Check if logged-in user follows them
          action: followings.some((f) => f.followee.user_id === user.user_id) ? "Following" : "Follow Back",
          joinDate: user.createdAt,
        };
      })
    );

    return res.status(200).json({ followings: formattedFollowings, followers: formattedFollowers });
  } catch (error) {
    // console.error("Error fetching followings and followers:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = getFollowings;
