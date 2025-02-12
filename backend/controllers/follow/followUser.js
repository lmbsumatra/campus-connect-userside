const { models } = require("../../models");

const followUser = async (req, res) => {
  const { loggedInUserId, otherUserId, userAction } = req.body;
  if (loggedInUserId === otherUserId) {
    return res.status(400).json({error: "You cannot follow yourself!"})
  }

  try{

  } catch (error) {
    
  }

  const isFollowing = await models.Follow.findOne({
    where: { followee_id: otherUserId, follower_id: loggedInUserId },
  });

  const isFollowedBy = await models.Follow.findOne({
    where: {
      follower_id: otherUserId,
      followee_id: loggedInUserId,
    },
  });
  let action = "Follow"
  if (isFollowedBy && isFollowing) {
    const removeFollow = await isFollowing.destroy();
    action = "Follow Back"
  } else if (isFollowedBy) {
    const followBack = await isFollowedBy.create();
    action = "Following"
  } else if (isFollowing) {
    const removeFollow = await isFollowing.destroy();
    action = "Follow"
  }

  console.log({ isFollowing, isFollowedBy, userAction });

  // const newFollow = await models.Follow.create({
  //   followee_id: followeeId,
  //   follower_id: followerId,
  // });
};

module.exports = followUser;
