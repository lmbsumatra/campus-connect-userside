const { models } = require("../../models");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const TokenGenerator = require("../../middlewares/TokenGenerator.js");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verify(token);
    const email = payload.email;
    const user = await models.User.findOne({
      where: { email },
      include: [
        {
          model: models.Student,
          as: "student",
          required: true,
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check if user is a student
    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not a student" });
    }

    // Update last login time
    user.lastlogin = new Date();
    await user.save();

    if (
      user.student &&
      user.student.status === "restricted" &&
      user.student.restricted_until
    ) {
      const now = new Date();
      if (new Date(user.student.restricted_until) <= now) {
        await user.student.update({
          status: "verified",
          status_message: `Restriction expired on ${now.toLocaleDateString()}. Account automatically reactivated on login.`,
          restricted_until: null,
        });

        // Reload to get updated values
        await user.student.reload();
      }
    }

    const jwtToken = TokenGenerator.generateToken({
      userId: user.user_id,
      role: user.role,
    });

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      role: user.role,
      userId: user.user_id,
      studentStatus: user.student.status,
      hasStripe: !!(user.is_stripe_completed && user.stripe_acct_id),
    });
  } catch (error) {
    // console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = googleLogin;
