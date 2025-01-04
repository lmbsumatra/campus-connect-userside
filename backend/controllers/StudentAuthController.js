const User = require("../models/UserModel");
const Student = require("../models/StudentModel");
const sequelize = require("../config/database");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cloudinary = require("cloudinary").v2;
const { models } = require("../models/index");

const bcrypt = require("bcrypt");
const { rollbackUpload } = require("../config/multer");

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

exports.getAllStudents = async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: ["user_id", "first_name", "last_name", "createdAt"],
      include: [
        {
          model: models.Student,
          as: "student",
          attributes: ["college"],
        },
      ],
    });

    res.status(200).json(users);
    // console.log(JSON.stringify(listings, null, 2)); // Log for debugging
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
};

// // Register a new student
// exports.registerStudent = async (req, res) => {
//   const t = await sequelize.transaction();
//   let publicIds = [];

//   try {
//     const {
//       first_name,
//       middle_name,
//       last_name,
//       email,
//       password,
//       tup_id,
//       college,
//     } = req.body;

//     const { scanned_id, photo_with_id } = req.files;

//     if (
//       !first_name ||
//       !last_name ||
//       !email ||
//       !password ||
//       !tup_id ||
//       !college ||
//       !scanned_id ||
//       !photo_with_id
//     )
//       return res.status(400).json({ message: "All fields are required" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     publicIds.push(scanned_id[0].filename, photo_with_id[0].filename);

//     const newUser = await User.create(
//       {
//         first_name,
//         middle_name,
//         last_name,
//         role: "student",
//         email,
//         password: hashedPassword,
//       },
//       { transaction: t }
//     );

//     // Create a new student record
//     const newStudent = await Student.create(
//       {
//         tup_id,
//         user_id: newUser.user_id,
//         college,
//         scanned_id: scanned_id[0].path,
//         photo_with_id: photo_with_id[0].path,
//       },
//       { transaction: t }
//     );

//     await t.commit();
//     res.status(201).json({
//       message: "Student registered successfully",
//       student: newStudent,
//     });
//   } catch (error) {
//     await t.rollback();

//     await rollbackUpload(publicIds);

//     console.error("Registration error:", error);
//     res.status(500).json({
//       message: "Failed registration. Please check your information",
//       error: error.message,
//     });
//   }
// };

// Login a student
// exports.loginStudent = async (req, res) => {
//   const { email, password } = req.body;

//   // Validation checks
//   if (!email) return res.status(400).json({ message: "Email is required" });
//   if (!password) return res.status(400).json({ message: "Password is required" });

//   try {
//     // Find user
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // JWT token creation
//     let token;
//     try {
//       if (!JWT_SECRET) {
//         console.error("JWT_SECRET is not defined");
//         return res.status(500).json({ message: "Server configuration error: Missing JWT secret" });
//       }
//       token = jwt.sign(
//         { userId: user.user_id, role: user.role },
//         JWT_SECRET
//       );
//     } catch (error) {
//       console.error("Error signing JWT:", error);
//       return res.status(500).json({ message: "Error generating authentication token", error: error.message });
//     }

//     // Respond with success
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       role: user.role,
//       userId: user.user_id,
//     });

//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verify(token);
    const email = payload.email;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Check if user is a student
    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not a student" });
    }

    const jwtToken = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      role: user.role,
      userId: user.user_id,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// exports.getUserInformation = async (req, res) => {
//   const userId = req.params.id;
//   try {
//     const student = await Student.findOne({ where: { user_id: userId } });
//     if (!student) {
//       return res.status(404).json({ message: "Student record not found" });
//     }

//     const user = await User.findByPk(student.user_id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "User information retrieved successfully",
//       user: {
//         user_id: user.user_id,
//         first_name: user.first_name,
//         middle_name: user.middle_name,
//         last_name: user.last_name,
//         email: user.email,
//         role: user.role,
//         password: user.password,
//         createdAt: user.createdAt,
//       },
//       student: {
//         tup_id: student.tup_id,
//         college: student.college,
//         scanned_id: student.scanned_id,
//         photo_with_id: student.photo_with_id,
//       },
//     });
//   } catch (error) {
//     console.error("Error retrieving user information:", error);
//     res.status(500).json({
//       message: "Error retrieving user information",
//       error: error.message,
//     });
//   }
// };

exports.userChangePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    const student = await Student.findOne({ where: { user_id: userId } });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const user = await User.findByPk(student.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};
