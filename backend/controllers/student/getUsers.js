const { models } = require("../../models");
const Fuse = require("fuse.js");

const getUsers = async (req, res) => {
  const logged_in_user_id = req.user.userId;
  console.log({ logged_in_user_id });

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
        const isFollowing = await models.Follow.findOne({
          where: { followee_id: user.user_id, follower_id: logged_in_user_id },
        });

        const isFollowedBy = await models.Follow.findOne({
          where: {
            followee_id: logged_in_user_id,
            follower_id: user.user_id,
          },
        });
        let action = "Follow";

        if (logged_in_user_id === user.user_id) {
          action = "You";
        } else if (isFollowedBy && isFollowing) {
          action = "Following";
        } else if (isFollowedBy) {
          action = "Follow back";
        } else if (isFollowing) {
          action = "Following";
        }
        return {
          id: user.user_id,
          fname: user.first_name,
          mname: user.middle_name,
          lname: user.last_name,
          college: user.student.college,
          profilePic: user.student.profile_pic,
          rating: "to be added",
          mutuals: "to be added",
          action: action,
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
    console.log("Error fetching users: ", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUsers;
