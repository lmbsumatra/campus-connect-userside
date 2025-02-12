const { models } = require("../../models");
const Fuse = require("fuse.js");

const getUserById = async (req, res) => {
  const loggedInUserId = req.user.userId;
  const userId = req.params.id; // Get the userId from the request params

  try {
    // Find the specific user based on userId
    const user = await models.User.findOne({
      where: {
        user_id: userId,
        role: "student", // Ensure the user is a student
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
      },
      student: {
        id: user.student.tup_id,
        college: user.student.college,
        scannedId: user.student.scanned_id,
        photoWithId: user.student.photo_with_id,
        profilePic: user.student.profile_pic,
      },
      action: action,
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.log("Error fetching user by ID: ", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUserById;
