const { models } = require("../../models");

const followUser = async (req, res) => {
  const { loggedInUserId, otherUserId } = req.body;

  if (loggedInUserId === otherUserId) {
    return res.status(400).json({ error: "You cannot follow yourself!" });
  }

  try {
    const isFollowing = await models.Follow.findOne({
      where: { follower_id: loggedInUserId, followee_id: otherUserId },
    });

    const isFollowedBy = await models.Follow.findOne({
      where: { follower_id: otherUserId, followee_id: loggedInUserId },
    });

    // Get user data for notification
    const loggedInUser = await models.User.findByPk(loggedInUserId, {
      attributes: ["first_name", "last_name"],
    });

    if (isFollowing) {
      // Unfollow logic
      await isFollowing.destroy();
      return res.json({
        message: "Unfollowed successfully!",
        action: isFollowedBy ? "Follow Back" : "Follow",
      });
    } else {
      // Follow logic
      await models.Follow.create({
        follower_id: loggedInUserId,
        followee_id: otherUserId,
      });

      // Create a notification for the followee
      const notification = await models.StudentNotification.create({
        sender_id: loggedInUserId,
        recipient_id: otherUserId,
        type: "user_followed",
        message: `${loggedInUser.first_name} ${loggedInUser.last_name} started following you`,
        is_read: false,
      });

      // If socket notification is available in the request
      if (req.emitNotification) {
        req.emitNotification(otherUserId, notification.toJSON());
      }

      return res.json({
        message: "Followed successfully!",
        action: isFollowedBy ? "Following" : "Following",
      });
    }
  } catch (error) {
    // console.error("Error following user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = followUser;
