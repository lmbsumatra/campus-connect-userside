const { models } = require("../../models");

const followUser = async (req, res) => {
  // const { followerId, followeeId } = req.body;
  // console.log("try!", followerId, followeeId);

  // const existingFollowee = await models.Follow.findOne({
  //   followee_id: followeeId,
  //   follower_id: followerId,
  // });

  // console.log(existingFollowee === true? true : false);

  // const newFollow = await models.Follow.create({
  //   followee_id: followeeId,
  //   follower_id: followerId,
  // });
};

module.exports = followUser;
